const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); 
const auth = require('../middlewares/auth');
const requireAdmin = require('../middlewares/requireAdmin');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/', auth, requireAdmin, userController.getAllUsers);
router.get('/:id', auth, userController.getUser);
router.put('/:id', auth, userController.updateUser);
router.delete('/:id', auth, requireAdmin, userController.deleteUser);
router.put('/change-password/:userId', auth, userController.changePassword);
router.post('/forgot-password', userController.requestPasswordReset);
router.post('/reset-password', userController.resetPassword);

module.exports = router;

