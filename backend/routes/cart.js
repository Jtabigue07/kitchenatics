const express = require('express');
const router = express.Router();
const { addToCart, getCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cartController');
const { isAuthenticated } = require('../middlewares/auth');

// All cart routes require authentication
router.use(isAuthenticated);

// Add item to cart
router.post('/', addToCart);

// Get user's cart
router.get('/', getCart);

// Update cart item quantity
router.put('/:itemId', updateCartItem);

// Remove item from cart
router.delete('/:itemId', removeFromCart);

// Clear entire cart
router.delete('/', clearCart);

module.exports = router;
