const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController'); // Adjust the path as necessary
const auth = require('../middlewares/auth');

router.post('/add', auth, productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.put('/modify/:id', auth, productController.updateProduct);
router.delete('/delete/:id', auth,  productController.deleteProduct);

module.exports = router;



