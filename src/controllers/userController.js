const User = require("../models/user");
const dotenv = require("dotenv");
dotenv.config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Création d'un Utilisateur
exports.registerUser = async (req, res, next) => {
  try {
    const {
      username,
      password,
      name,
      surname,
      email,
      phone,
      address,
      zipcode,
      city,
      dateOfBirth,
    } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({ message: "Required fields are missing." });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username or email is already taken." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      password: hashedPassword,
      name,
      surname,
      email,
      phone,
      address,
      zipcode,
      city,
      dateOfBirth,
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    next(error);
  }
};

// Identification d'un Utilisateur
exports.loginUser = async (req, res, next) => {
  const { username, email, password } = req.body;

  if ((!username && !email) || !password) {
    return res
      .status(400)
      .json({ message: "Username or email, and password, are required." });
  }

  try {
    const user = await User.findOne(
      username ? { username } : { email }
    );

    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Password does not match." });
    }

    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userForResponse = {
      _id: user._id,
      username: user.username,
      name: user.name,
      surname: user.surname,
      email: user.email,
      phone: user.phone,
      address: user.address,
      zipcode: user.zipcode,
      city: user.city,
      dateOfBirth: user.dateOfBirth,
      isAdmin: user.isAdmin,
    };

    res.json({ message: "Login successful", token, user: userForResponse });
  } catch (error) {
    next(error);
  }
};

// Afficher tous les Utilisateurs
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// Afficher  un Utilisateur par son ID
exports.getUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    if (!req.user.isAdmin && req.user.id !== userId) {
      return res.status(403).json({ message: "Not authorized to view this user." });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Actualiser les informations d'un Utilisateur
exports.updateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    if (!req.user.isAdmin && req.user.id !== userId) {
      return res.status(403).json({ message: "Not authorized to update this user." });
    }

    const updatableFields = [
      "username",
      "name",
      "surname",
      "email",
      "phone",
      "address",
      "zipcode",
      "city",
      "dateOfBirth",
    ];

    const payload = {};
    updatableFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        payload[field] = req.body[field];
      }
    });

    if (req.user.isAdmin && Object.prototype.hasOwnProperty.call(req.body, "isAdmin")) {
      payload.isAdmin = req.body.isAdmin;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, payload, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

// Supprimer un Utilisateur
exports.deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Changer le Mot de Passe lié à l'utilisateur
exports.changePassword = async (req, res, next) => {
  const { userId } = req.params;
  const { currentPassword, newPassword } = req.body;

  if (!newPassword || newPassword.length < 8) {
    return res
      .status(400)
      .json({ message: "New password must be at least 8 characters long." });
  }

  try {
    if (!req.user.isAdmin && req.user.id !== userId) {
      return res.status(403).json({ message: "Not authorized to change this password." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!req.user.isAdmin) {
      if (!currentPassword) {
        return res
          .status(400)
          .json({ message: "Current password is required." });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ message: "Current password is incorrect." });
      }
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully." });
  } catch (error) {
    next(error);
  }
};

exports.requestPasswordReset = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        message: "If an account exists for this email, a reset link has been generated.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    await user.save();

    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.json({
      message: "Password reset link generated. Check your email.",
      ...(process.env.NODE_ENV !== "production" && { resetToken }),
    });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  const { token, email, username, newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ message: "newPassword is required." });
  }

  if (newPassword.length < 8) {
    return res
      .status(400)
      .json({ message: "New password must be at least 8 characters long." });
  }

  try {
    let user = null;

    if (token) {
      const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
      user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res
          .status(400)
          .json({ message: "Token is invalid or has expired." });
      }
    } else if (email || username) {
      const filter = email ? { email } : { username };
      user = await User.findOne(filter);

      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
    } else {
      return res.status(400).json({
        message: "Provide either a reset token or the email/username associated with the account.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful." });
  } catch (error) {
    next(error);
  }
};
