const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middlewares/auth');

// Routes
router.get('/', auth, orderController.getOrders);  
router.post('/add', auth, orderController.submitBackOrder);  

module.exports = router;
