const mongoose = require('mongoose');

const orderLineSchema = new mongoose.Schema({
	order: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'OrderInfo',
		required: true
	},
	product: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Product',
		required: true
	},
	productDetails: {
		name: {
			type: String,
			required: true
		},
		brand: String,
		category: String,
		image: String
	},
	quantity: {
		type: Number,
		required: true,
		min: 1
	},
	price: {
		type: Number,
		required: true,
		min: 0
	},
	total: {
		type: Number,
		required: true,
		min: 0
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
});

// Calculate total before saving
orderLineSchema.pre('save', function(next) {
	this.total = this.price * this.quantity;
	next();
});

module.exports = mongoose.model('OrderLine', orderLineSchema);
