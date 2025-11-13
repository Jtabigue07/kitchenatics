const express = require('express');
const router = express.Router();

console.log('Loading receipt routes...');
const receiptController = require('../controllers/receiptController');
console.log('receiptController imported:', receiptController);
console.log('downloadReceipt type:', typeof receiptController.downloadReceipt);
console.log('getReceiptStatus type:', typeof receiptController.getReceiptStatus);

const { downloadReceipt, getReceiptStatus } = receiptController;

console.log('Loading auth middleware...');
const authMiddleware = require('../middlewares/auth');
console.log('authMiddleware imported:', authMiddleware);
console.log('isAuthenticated type:', typeof authMiddleware.isAuthenticated);

const { isAuthenticated } = authMiddleware;

// Download PDF receipt for an order
router.get('/download/:orderId', isAuthenticated, downloadReceipt);

// Check if receipt is available for an order
router.get('/status/:orderId', isAuthenticated, getReceiptStatus);

module.exports = router;
