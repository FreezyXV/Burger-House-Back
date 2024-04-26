const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Routes
router.get('/', orderController.getOrders);  
router.post('/add', orderController.submitBackOrder);  

module.exports = router;