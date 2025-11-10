const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController'); // Adjust the path as necessary
const auth = require('../middlewares/auth');
const requireAdmin = require('../middlewares/requireAdmin');

router.post('/add', auth, requireAdmin, productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.put('/modify/:id', auth, requireAdmin, productController.updateProduct);
router.delete('/delete/:id', auth, requireAdmin,  productController.deleteProduct);

module.exports = router;


