const User = require("../models/user");
const dotenv = require("dotenv");
dotenv.config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  try {
    const user = await User.findOne({ username });

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
    const users = await User.find();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// Afficher  un Utilisateur par son ID
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Actualiser les informations d'un Utilisateur
exports.updateUser = async (req, res, next) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
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
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Current password is incorrect." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully." });
  } catch (error) {
    next(error);
  }
};
