const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const tokenHeader = req.headers.authorization;
  if (!tokenHeader) {
    return res
      .status(401)
      .json({ message: "Accès non autorisé. Token manquant." });
  }

  const token = tokenHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    res.status(401).json({ message: "Token invalide.", error: error.message });
  }
};

module.exports = auth;
