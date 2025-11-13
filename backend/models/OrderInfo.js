const mongoose = require('mongoose');

const orderInfoSchema = new mongoose.Schema({
	orderNumber: {
		type: String,
		required: true,
		unique: true
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	customerDetails: {
		name: {
			type: String,
			required: true
		},
		email: {
			type: String,
			required: true
		},
		phone: String,
		address: String,
		zipCode: String
	},
	totalAmount: {
		type: Number,
		required: true,
		min: 0
	},
	subtotal: {
		type: Number,
		required: true,
		min: 0
	},
	tax: {
		type: Number,
		default: 0,
		min: 0
	},
	status: {
		type: String,
		enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
		default: 'pending'
	},
	paymentMethod: {
		type: String,
		default: 'cash_on_delivery'
	},
	notes: String,
	createdAt: {
		type: Date,
		default: Date.now
	},
	updatedAt: {
		type: Date,
		default: Date.now
	}
});

// Update the updatedAt field before saving
orderInfoSchema.pre('save', function(next) {
	this.updatedAt = Date.now();
	next();
});

// Generate unique order number
orderInfoSchema.statics.generateOrderNumber = function() {
	const timestamp = Date.now();
	const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
	return `ORD-${timestamp}-${random}`;
};

module.exports = mongoose.model('OrderInfo', orderInfoSchema);
