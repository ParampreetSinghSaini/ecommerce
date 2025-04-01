// routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const cartController = require('../controller/cartController'); // Ensure the correct path
const { verifyToken } = require('../middleware/auth'); // Authentication middleware

// Define the cart routes
router.post('/', verifyToken, cartController.addItemToCart);      // Add item to cart
router.get('/', verifyToken, cartController.getCart);               // Get user's cart
router.put('/:itemId', verifyToken, cartController.updateCartItem); // Update cart item quantity
router.delete('/:itemId', verifyToken, cartController.removeCartItem); // Remove item from cart
router.post('/sync', verifyToken, cartController.syncCart);
router.post('/checkout', verifyToken, cartController.checkout);
router.post('/webhook', cartController.webhook);


module.exports = router;


