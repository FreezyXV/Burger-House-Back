// Import necessary modules
const express = require("express"); // Web framework for Node.js
const dotenv = require("dotenv"); // Module to load environment variables from a .env file
const cors = require("cors"); // Middleware to handle Cross-Origin Resource Sharing
const mongoose = require("mongoose"); // ODM for MongoDB
const productRoutes = require("./routes/productRoutes"); // Routes for managing products
const menuRoutes = require("./routes/menuRoutes"); // Routes for managing menus
const userRoutes = require("./routes/userRoutes"); // Routes for managing users
const orderRoutes = require("./routes/orderRoutes"); // Routes for managing orders

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000; // Define the port to listen on

// Configure CORS to allow requests from the frontend
app.use(cors({
  origin: "https://burger-house-front.vercel.app", // Allowed origin
  // You can add more CORS configurations if needed
}));

// Middleware to parse JSON request bodies
app.use(express.json());

// Connect to MongoDB using the connection string from environment variables
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB")) // Success message
  .catch((err) => console.error("Could not connect to MongoDB:", err)); // Error message

// Base route to verify API functionality
app.get("/", (req, res) => {
  res.send("Welcome to the Burger Shop API!");
});

// Use defined routes for different entities
app.use("/api/menus", menuRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log error stack
  res.status(err.status || 500).send({ message: err.message || "Something broke!" }); // Send error response
});

// Start the server and listen on the defined port
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Export the app for testing or other modules
module.exports = app;
