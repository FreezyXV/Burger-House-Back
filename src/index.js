// Importation des modules nécessaires
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const productRoutes = require("./routes/productRoutes");
const menuRoutes = require("./routes/menuRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");

// Configuration des variables d'environnement
dotenv.config();

// Création de l'instance de l'application Express
const app = express();
// Définition du port sur lequel le serveur écoutera
const PORT = process.env.PORT || 2233;

// Utilisation du middleware CORS pour gérer les requêtes provenant d'origines différentes
app.use(cors({
  origin:"burger-house-front.vercel.app",

}));
// Utilisation du middleware pour analyser le corps des requêtes en JSON
app.use(express.json());

// Connexion à la base de données MongoDB
mongoose
  .connect(process.env.MONGO_URI) // Utilisation de l'URI MongoDB définie dans les variables d'environnement
  .then(() => console.log("Connected to MongoDB")) // Affichage d'un message si la connexion est établie avec succès
  .catch((err) => console.error("Could not connect to MongoDB:", err)); // Affichage d'une erreur en cas d'échec de la connexion

// Route racine de l'API
app.get("/", (req, res) => {
  res.send("Welcome to the Burger Shop API!"); // Réponse avec un message de bienvenue
});

// Configuration des routes pour les différentes fonctionnalités de l'API
app.use("/api/menus", menuRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);

// Middleware pour la gestion des erreurs
app.use((err, res) => {
  console.error(err.stack); // Affichage de la stack d'erreurs dans la console
  res
    .status(err.status || 500)
    .send({ message: err.message || "Something broke!" }); // Réponse avec un code d'erreur et un message
});

// Écoute du port spécifié
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`); // Affichage d'un message indiquant que le serveur est en écoute
});

// Exportation de l'application Express (utile pour les tests unitaires ou l'intégration continue)
module.exports = app;
