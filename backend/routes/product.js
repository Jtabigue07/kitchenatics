const express = require('express');
const router = express.Router();
const {
	getProducts,
	getProduct,
	createProduct,
	updateProduct,
	deleteProduct
} = require('../controllers/productController');
const { isAuthenticated, authorizeRoles } = require('../middlewares/auth');
const upload = require('../utils/upload');

// Public routes - must be before /:id route
router.get('/products', getProducts);

// Admin routes - must be before /:id route
router.post(
	'/products',
	isAuthenticated,
	authorizeRoles('admin'),
	upload.array('images', 5),
	createProduct
);

// Get single product - must be last
router.get('/products/:id', getProduct);

router.put(
	'/products/:id',
	isAuthenticated,
	authorizeRoles('admin'),
	upload.array('images', 5),
	updateProduct
);

router.delete(
	'/products/:id',
	isAuthenticated,
	authorizeRoles('admin'),
	deleteProduct
);

module.exports = router;

