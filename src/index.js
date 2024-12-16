// Importation des modules nécessaires
const express = require("express"); // Framework web pour Node.js
const dotenv = require("dotenv"); // Module pour charger les variables d'environnement à partir d'un fichier .env
const cors = require("cors"); // Middleware pour gérer les problèmes de sécurité liés au CORS (Cross-Origin Resource Sharing)
const mongoose = require("mongoose"); // ODM (Object Data Modeling) pour MongoDB
const productRoutes = require("./routes/productRoutes"); // Routes pour la gestion des produits
const menuRoutes = require("./routes/menuRoutes"); // Routes pour la gestion des menus
const userRoutes = require("./routes/userRoutes"); // Routes pour la gestion des utilisateurs
const orderRoutes = require("./routes/orderRoutes"); // Routes pour la gestion des commandes

// Chargement des variables d'environnement à partir du fichier .env
dotenv.config();

// Initialisation de l'application Express
const app = express();
const PORT = process.env.PORT || 2233; // Définition du port sur lequel le serveur écoute

// Configuration du middleware CORS pour autoriser les requêtes provenant du frontend
app.use(cors({
  origin: "https://burger-house-front.vercel.app", // Origine autorisée
}));

// Middleware pour parser les corps de requête JSON
app.use(express.json());

// Connexion à la base de données MongoDB
mongoose
  .connect(process.env.MONGO_URI) // Utilise l'URI MongoDB définie dans les variables d'environnement
  .then(() => console.log("Connected to MongoDB")) // Message de succès en cas de connexion réussie
  .catch((err) => console.error("Could not connect to MongoDB:", err)); // Message d'erreur en cas d'échec

// Route de base pour vérifier le fonctionnement de l'API
app.get("/", (req, res) => {
  res.send("Welcome to the Burger Shop API!");
});

// Utilisation des routes définies pour les différentes entités de l'application
app.use("/api/menus", menuRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);

// Middleware global de gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack); // Journalise la pile d'erreurs
  res.status(err.status || 500).send({ message: err.message || "Something broke!" }); // Envoie une réponse d'erreur au client
});

// Démarrage du serveur pour écouter sur le port défini
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Exportation de l'application pour les tests ou pour d'autres modules
module.exports = app;
