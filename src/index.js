// src/index.js
const express = require("express"); // Framework web pour Node.js
const dotenv = require("dotenv"); // Module pour charger les variables d'environnement à partir d'un fichier .env
const cors = require("cors"); // Middleware pour gérer les problèmes de sécurité liés au CORS (Cross-Origin Resource Sharing)
const productRoutes = require("./routes/productRoutes"); // Routes pour la gestion des produits
const menuRoutes = require("./routes/menuRoutes"); // Routes pour la gestion des menus
const userRoutes = require("./routes/userRoutes"); // Routes pour la gestion des utilisateurs
const orderRoutes = require("./routes/orderRoutes"); // Routes pour la gestion des commandes
const errorHandler = require("./middlewares/errorHandler"); // Importation du middleware de gestion d'erreurs centralisé
const connectDB = require("./config/connectDB"); // Gestion centralisée de la connexion MongoDB

// Chargement des variables d'environnement à partir du fichier .env
dotenv.config();

// Initialisation de l'application Express
const app = express();
const PORT = process.env.PORT || 2233; // Définition du port sur lequel le serveur écoute

const REQUIRED_ENV_VARS = ["MONGO_URI", "JWT_SECRET"];
const missingEnvs = REQUIRED_ENV_VARS.filter((envVar) => !process.env[envVar]);

if (missingEnvs.length) {
  console.error(
    `Les variables d'environnement suivantes sont manquantes: ${missingEnvs.join(
      ", "
    )}`
  );
  console.error(
    "Déployez à nouveau en définissant les variables dans Railway > Variables."
  );
  process.exit(1);
}

const defaultOrigins = [
  "https://burger-house-front.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const envOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

console.log("CORS allowed origins:", allowedOrigins);

// Configuration du middleware CORS pour autoriser les requêtes provenant du frontend
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(
        new Error(`Origin ${origin} is not allowed by CORS policy.`)
      );
    },
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  })
);

// Middleware pour parser les corps de requête JSON
app.use(express.json());

// Route de base pour vérifier le fonctionnement de l'API
app.get("/", (req, res) => {
  res.send("Welcome to the Burger Shop API!");
});

// Endpoint de santé pour Railway
app.get("/healthz", (req, res) => {
  res.json({ status: "ok" });
});

// Utilisation des routes définies pour les différentes entités de l'application
app.use("/api/menus", menuRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);

// Middleware global de gestion des erreurs
app.use(errorHandler);

async function startServer() {
  try {
    await connectDB();

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server listening on port ${PORT}`);
    });

    const gracefulShutdown = (signal) => {
      console.log(`${signal} received. Closing HTTP server.`);
      server.close(() => {
        console.log("HTTP server closed.");
        process.exit(0);
      });
    };

    ["SIGINT", "SIGTERM"].forEach((signal) =>
      process.on(signal, () => gracefulShutdown(signal))
    );
  } catch (error) {
    console.error("Server startup aborted:", error);
    process.exit(1);
  }
}

startServer();

// Exportation de l'application pour les tests ou pour d'autres modules
module.exports = app;
