const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Add item to cart
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        const userId = req.user.id;

        // Validate product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Find or create cart
        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = new Cart({
                user: userId,
                items: []
            });
        }

        // Check if product already in cart
        const existingItemIndex = cart.items.findIndex(
            item => item.product && item.product.toString() === productId
        );

        if (existingItemIndex > -1) {
            // Update quantity
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            // Add new item
            cart.items.push({
                product: productId,
                quantity,
                price: product.price,
                name: product.name,
                brand: product.brand,
                category: product.category,
                image: product.images && product.images.length > 0 ? product.images[0].url : null
            });
        }

        await cart.save();

        // Try to populate but don't fail if it doesn't work
        try {
            await cart.populate('items.product');
        } catch (e) {
            console.warn('Populate warning in addToCart:', e.message);
        }

        res.status(200).json({
            success: true,
            message: 'Item added to cart successfully',
            cart
        });

    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add item to cart',
            error: error.message
        });
    }
};

// Get user's cart
exports.getCart = async (req, res) => {
    try {
        const userId = req.user.id;

        // First check if cart exists
        let cart = await Cart.findOne({ user: userId });
        
        if (!cart) {
            // Return empty cart if none exists
            return res.status(200).json({
                success: true,
                cart: { items: [], totalPrice: 0 }
            });
        }

        // Populate product details with error handling
        try {
            cart = await Cart.findOne({ user: userId }).populate({
                path: 'items.product',
                model: 'Product',
                select: 'name price brand category images'
            });
        } catch (populateError) {
            // If populate fails, return cart without populated products
            console.warn('Cart populate error (returning basic cart):', populateError.message);
            return res.status(200).json({
                success: true,
                cart: {
                    items: cart.items || [],
                    totalPrice: cart.totalPrice || 0
                }
            });
        }

        res.status(200).json({
            success: true,
            cart
        });

    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve cart',
            error: error.message
        });
    }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;
        const userId = req.user.id;

        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be at least 1'
            });
        }

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        const itemIndex = cart.items.findIndex(
            item => item._id.toString() === itemId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        cart.items[itemIndex].quantity = quantity;
        await cart.save();

        // Try to populate but don't fail if it doesn't work
        try {
            await cart.populate('items.product');
        } catch (e) {
            console.warn('Populate warning in updateCartItem:', e.message);
        }

        res.status(200).json({
            success: true,
            message: 'Cart item updated successfully',
            cart
        });

    } catch (error) {
        console.error('Update cart item error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update cart item',
            error: error.message
        });
    }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.params;
        const userId = req.user.id;

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        cart.items = cart.items.filter(
            item => item._id.toString() !== itemId
        );

        await cart.save();

        // Try to populate but don't fail if it doesn't work
        try {
            await cart.populate('items.product');
        } catch (e) {
            console.warn('Populate warning in removeFromCart:', e.message);
        }

        res.status(200).json({
            success: true,
            message: 'Item removed from cart successfully',
            cart
        });

    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove item from cart',
            error: error.message
        });
    }
};

// Clear entire cart
exports.clearCart = async (req, res) => {
    try {
        const userId = req.user.id;

        await Cart.findOneAndDelete({ user: userId });

        res.status(200).json({
            success: true,
            message: 'Cart cleared successfully'
        });

    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear cart',
            error: error.message
        });
    }
};
