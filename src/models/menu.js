const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
  title: { type: "string", required: true },
  description: { type: "string" },
  price: { type: "number" },
  size: {
    type: "string",
    enum: ["medium", "large"],
    default: "medium",
  },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
});

module.exports = mongoose.model("Menu", menuSchema);
