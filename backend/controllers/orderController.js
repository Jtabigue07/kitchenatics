const mongoose = require('mongoose');
const OrderInfo = require('../models/OrderInfo');
const OrderLine = require('../models/OrderLine');
const Cart = require('../models/Cart');
const User = require('../models/User');
const Product = require('../models/Product');
const { sendOrderConfirmation, sendOrderStatusUpdate } = require('../services/emailService');
const { generateOrderReceipt } = require('../services/pdfService');

// Create order from cart (checkout)
exports.createOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.user.id;
        const { paymentMethod = 'cash_on_delivery', notes } = req.body;

        // Get user's cart
        const cart = await Cart.findOne({ user: userId }).populate('items.product').session(session);
        if (!cart || cart.items.length === 0) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }

        // Get user details
        const user = await User.findById(userId).session(session);
        if (!user) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Calculate totals
        const subtotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        const tax = subtotal * 0.08; // 8% tax
        const totalAmount = subtotal + tax;

        // Generate unique order number
        const orderNumber = OrderInfo.generateOrderNumber();

        // Create OrderInfo
        const orderInfo = new OrderInfo({
            orderNumber,
            user: userId,
            customerDetails: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                zipCode: user.zipCode
            },
            totalAmount,
            subtotal,
            tax,
            paymentMethod,
            notes,
            status: 'pending'
        });

        const savedOrderInfo = await orderInfo.save({ session });

        // Create OrderLine items
        const orderLines = cart.items.map(item => ({
            order: savedOrderInfo._id,
            product: item.product._id,
            productDetails: {
                name: item.product.name,
                brand: item.product.brand,
                category: item.product.category,
                image: item.product.images && item.product.images.length > 0 ? item.product.images[0].url : null
            },
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity
        }));

        const savedOrderLines = await OrderLine.insertMany(orderLines, { session });

        // Clear the cart
        await Cart.findOneAndDelete({ user: userId }).session(session);

        // Commit transaction
        await session.commitTransaction();

        // Send order confirmation email with PDF receipt (outside transaction)
        try {
            const pdfBuffer = await generateOrderReceipt(savedOrderInfo, savedOrderLines);
            // Note: In a real implementation, you'd attach the PDF to the email
            await sendOrderConfirmation(savedOrderInfo, savedOrderLines, user.email);
        } catch (emailError) {
            console.error('Failed to send order confirmation email:', emailError);
            // Don't fail the order creation if email fails
        }

        // Populate order details for response
        await savedOrderInfo.populate('user');

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order: savedOrderInfo,
            orderLines: savedOrderLines
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create order'
        });
    } finally {
        session.endSession();
    }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get orders with aggregation to include order lines
        const orders = await OrderInfo.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId) } },
            {
                $lookup: {
                    from: 'orderlines',
                    localField: '_id',
                    foreignField: 'order',
                    as: 'orderLines'
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit }
        ]);

        const totalOrders = await OrderInfo.countDocuments({ user: userId });
        const totalPages = Math.ceil(totalOrders / limit);

        res.status(200).json({
            success: true,
            orders,
            pagination: {
                currentPage: page,
                totalPages,
                totalOrders,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get orders'
        });
    }
};

// Get single order details
exports.getOrderDetails = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        const order = await OrderInfo.findOne({
            _id: orderId,
            user: userId
        }).populate('user');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const orderLines = await OrderLine.find({ order: orderId }).populate('product');

        res.status(200).json({
            success: true,
            order,
            orderLines
        });

    } catch (error) {
        console.error('Get order details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get order details'
        });
    }
};

// Update order status (Admin only)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, notes } = req.body;

        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const order = await OrderInfo.findById(orderId).populate('user');
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const oldStatus = order.status;
        order.status = status;
        if (notes) {
            order.notes = notes;
        }
        await order.save();

        // Send status update email if status changed
        if (oldStatus !== status) {
            try {
                // Fetch order lines with product details for email
                const orderLines = await OrderLine.find({ order: orderId }).populate('product');
                
                // Transform order lines for email service
                const orderLinesForEmail = orderLines.map(line => ({
                    productDetails: {
                        name: line.product?.name || 'Product',
                        description: line.product?.description || ''
                    },
                    quantity: line.quantity,
                    price: line.price,
                    total: line.quantity * line.price
                }));

                await sendOrderStatusUpdate(order, status, order.customerDetails.email, orderLinesForEmail);
            } catch (emailError) {
                console.error('Failed to send status update email:', emailError);
                // Don't fail the status update if email fails
            }
        }

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            order
        });

    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update order status'
        });
    }
};

// Get admin order details (Admin only)
exports.getAdminOrderDetails = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await OrderInfo.findById(orderId).populate('user');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const orderLines = await OrderLine.find({ order: orderId }).populate('product');

        res.status(200).json({
            success: true,
            order,
            orderLines
        });

    } catch (error) {
        console.error('Get admin order details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get order details'
        });
    }
};

// Get all orders (Admin only)
exports.getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const status = req.query.status;
        const search = req.query.search;

        let matchQuery = {};

        if (status && status !== 'all') {
            matchQuery.status = status;
        }

        if (search) {
            matchQuery.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { 'customerDetails.name': { $regex: search, $options: 'i' } },
                { 'customerDetails.email': { $regex: search, $options: 'i' } }
            ];
        }

        const orders = await OrderInfo.aggregate([
            { $match: matchQuery },
            {
                $lookup: {
                    from: 'orderlines',
                    localField: '_id',
                    foreignField: 'order',
                    as: 'orderLines'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit }
        ]);

        const totalOrders = await OrderInfo.countDocuments(matchQuery);
        const totalPages = Math.ceil(totalOrders / limit);

        res.status(200).json({
            success: true,
            orders,
            pagination: {
                currentPage: page,
                totalPages,
                totalOrders,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get orders'
        });
    }
};
