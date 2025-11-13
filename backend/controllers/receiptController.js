const OrderInfo = require('../models/OrderInfo');
const OrderLine = require('../models/OrderLine');
const { generatePDFReceipt } = require('../services/emailService');

// Download PDF receipt for an order
exports.downloadReceipt = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;

        // Find the order and verify ownership
        const order = await OrderInfo.findOne({
            _id: orderId,
            user: userId
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found or access denied'
            });
        }

        // Get order lines
        const orderLines = await OrderLine.find({ orderId: order._id });

        // Generate PDF receipt
        const pdfBuffer = await generatePDFReceipt(order, orderLines);

        // Set headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Receipt-${order.orderNumber}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length);

        // Send the PDF buffer
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Error in receipt download:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to download receipt'
        });
    }
};

// Get receipt availability for an order
exports.getReceiptStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;

        // Check if order exists and belongs to user
        const order = await OrderInfo.findOne({
            _id: orderId,
            user: userId
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found or access denied'
            });
        }

        res.status(200).json({
            success: true,
            available: true,
            orderNumber: order.orderNumber,
            message: 'Receipt is available for download'
        });

    } catch (error) {
        console.error('Error checking receipt status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check receipt status'
        });
    }
};
