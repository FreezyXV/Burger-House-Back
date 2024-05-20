const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const productRoutes = require("./routes/productRoutes");
const menuRoutes = require("./routes/menuRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 2233;

app.use(cors({
  origin: "https://burger-house-front.vercel.app", 
}));

app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB:", err));

app.get("/", (req, res) => {
  res.send("Welcome to the Burger Shop API!");
});

app.use("/api/menus", menuRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).send({ message: err.message || "Something broke!" });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

module.exports = app;
