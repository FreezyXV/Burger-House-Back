// Importation du module jsonwebtoken pour vérifier et signer les tokens JWT
const jwt = require("jsonwebtoken");

// Middleware d'authentification
const auth = (req, res, next) => {
  // Récupère le header d'autorisation contenant le token JWT
  const tokenHeader = req.headers.authorization;

  // Vérifie si le header d'autorisation est présent
  if (!tokenHeader) {
    // Si aucun token n'est fourni, renvoie une réponse 401 (Unauthorized)
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    // Sépare le token du header d'autorisation
    const parts = tokenHeader.split(" ");
    // Vérifie que le format du token est correct (doit être "Bearer token")
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      // Si le format est incorrect, renvoie une réponse 401 (Unauthorized)
      return res.status(401).json({ message: "Invalid token format." });
    }

    // Récupère le token proprement dit
    const token = parts[1];
    // Vérifie et décode le token en utilisant la clé secrète JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Vérifie que le payload du token contient un userId valide
    if (!decoded.userId) {
      // Si le payload est invalide, déclenche une erreur
      throw new Error("Invalid token payload.");
    }

    // Ajoute les informations de l'utilisateur décodé à l'objet req pour une utilisation ultérieure
    req.user = { id: decoded.userId, isAdmin: decoded.isAdmin };
    // Passe au middleware ou à la route suivante
    next();
  } catch (error) {
    // En cas d'erreur (par exemple, token invalide), journalise l'erreur et renvoie une réponse 401 (Unauthorized)
    console.error("Authentication Error:", error.message);
    res.status(401).json({ message: "Invalid token.", error: error.message });
  }
};

// Exportation du middleware d'authentification pour l'utiliser dans d'autres parties de l'application
module.exports = auth;
