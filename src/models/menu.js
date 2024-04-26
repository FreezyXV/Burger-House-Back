const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number },
  inStock: { type: Boolean, default: true },
  imageSrc: { type: String, required: true },
  type: {
    type: String,
    enum: ["Menu"], 
    default: "Menu", 
  },  
  size: {
    type: String,
    enum: ["medium", "large"],
    default: "medium",
  },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
});

const Menu = mongoose.model("Menu", menuSchema);
module.exports = Menu;
