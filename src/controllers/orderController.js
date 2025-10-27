const Order = require("../models/order");
const User = require("../models/user");

//Afficher toutes les Commandes
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({}).populate("customer", "name email");
    res.json({ orders });
  } catch (error) {
    next(error);
  }
};

//Valider une Commande
exports.submitBackOrder = async (req, res, next) => {
  try {
    const { customer, items, totalPrice } = req.body;
    if (!customer || !items.length || totalPrice === undefined) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    let foundCustomer = await User.findById(customer._id);
    if (!foundCustomer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();
    console.log("Order saved successfully", savedOrder); // Log the saved order
    res.status(201).json(savedOrder);
  } catch (error) {
    next(error);
  }
};
