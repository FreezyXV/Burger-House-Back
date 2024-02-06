const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const Menu = require("./models/menu");
const Product = require("./models/product");

dotenv.config();

const app = express();

const PORT = process.env.PORT;

app.use(bodyParser.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI);

app.get("/", (req, res) => {
  res.send("Welcome to the Burger Shop API!");
});

app.get("/menus", async (req, res) => {
  try {
    const menus = await Menu.find().populate("products");

    res.json(menus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});
