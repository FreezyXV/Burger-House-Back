const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number },
  inStock: { type: Boolean, default: true }, 
  imageSrc: { type: String, required: true },
  type: {
    type: String,
    enum: ["Burgers", "Boissons", "Accompagnements", 
    "Sauces", "Glaces"],
  },
});

module.exports = mongoose.model("Product", productSchema);



