const mongoose = require("mongoose");

const producSchema = new mongoose.Schema({
  title: { type: "string", required: true },
  description: { type: "string" },
  price: { type: "number" },
  inStock: { type: "boolean", default: false },
  type: {
    type: "string",
    enum: ["Burger", "Drink", "Potato", "Salad", "Sauce", "IceCream"],
  },
});

module.exports = mongoose.model("Product", producSchema);
