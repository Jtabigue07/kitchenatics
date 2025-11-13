const express = require('express');
const router = express.Router();
const { isAuthenticated, authorizeRoles } = require('../middlewares/auth');
const {
	createOrder,
	getUserOrders,
	getOrderDetails,
	updateOrderStatus,
	getAdminOrderDetails,
	getAllOrders
} = require('../controllers/orderController');

// User routes
router.post('/checkout', isAuthenticated, createOrder);
router.get('/my-orders', isAuthenticated, getUserOrders);
router.get('/:orderId', isAuthenticated, getOrderDetails);

// Admin routes
router.get('/admin/all', isAuthenticated, authorizeRoles('admin'), getAllOrders);
router.get('/admin/:orderId', isAuthenticated, authorizeRoles('admin'), getAdminOrderDetails);
router.put('/:orderId/status', isAuthenticated, authorizeRoles('admin'), updateOrderStatus);

module.exports = router;

