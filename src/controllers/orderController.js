const Order = require("../models/order");
const User = require("../models/user");

//Afficher toutes les Commandes (admin => toutes, sinon commandes personnelles)
exports.getOrders = async (req, res, next) => {
  try {
    const filter = req.user.isAdmin ? {} : { customer: req.user.id };
    const orders = await Order.find(filter)
      .populate("customer", "name email")
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    next(error);
  }
};

//Valider une Commande
exports.submitBackOrder = async (req, res, next) => {
  try {
    const { items, totalPrice } = req.body;

    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ message: "At least one item is required." });
    }

    if (typeof totalPrice !== "number") {
      return res
        .status(400)
        .json({ message: "totalPrice must be provided as a number." });
    }

    const customer = await User.findById(req.user.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    const sanitizedItems = items.map((item) => ({
      itemRef: item.itemRef,
      onModel: item.onModel,
      quantity: item.quantity,
      selectedOptions: item.selectedOptions || {},
    }));

    const invalidItem = sanitizedItems.find(
      (item) =>
        !item.itemRef ||
        !item.onModel ||
        typeof item.quantity !== "number" ||
        item.quantity < 1
    );

    if (invalidItem) {
      return res.status(400).json({ message: "Invalid order item detected." });
    }

    const newOrder = new Order({
      customer: customer._id,
      items: sanitizedItems,
      totalPrice,
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    next(error);
  }
};
