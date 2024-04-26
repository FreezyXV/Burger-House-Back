const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const tokenHeader = req.headers.authorization;

  if (!tokenHeader) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const parts = tokenHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ message: "Invalid token format." });
    }

    const token = parts[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.userId) {
      throw new Error("Invalid token payload.");
    }

    req.user = { id: decoded.userId, isAdmin: decoded.isAdmin };
    next();
  } catch (error) {
    console.error("Authentication Error:", error.message);
    res.status(401).json({ message: "Invalid token.", error: error.message });
  }
};

module.exports = auth;
