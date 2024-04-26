const mongoose = require("mongoose");
const orderItemSchema = require("./orderItem");

const orderSchema = new mongoose.Schema(
  {
    items: [orderItemSchema],
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "processed", "ready"],
      default: "pending",
    },
    customer: {type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
