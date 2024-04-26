const Order = require("../models/order");
const User = require("../models/user");  

//Afficher toutes les Commandes
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('customer', 'name email'); 
        res.json({ orders });
    } catch (error) {
        console.error('Failed to retrieve orders:', error);
        res.status(500).json({ message: 'Failed to get orders', error: error.message });
    }
};

//Valider une Commande
exports.submitBackOrder = async (req, res) => {
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
        console.error("Error submitting order:", error);
        res.status(500).json({ message: "Failed to submit order", error: error.message });
    }
};


  
  