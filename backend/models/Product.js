const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Please enter product name'],
		trim: true,
		maxlength: [200, 'Product name cannot exceed 200 characters']
	},
	description: {
		type: String,
		required: [true, 'Please enter product description'],
		trim: true
	},
	price: {
		type: Number,
		required: [true, 'Please enter product price'],
		maxlength: [8, 'Price cannot exceed 8 characters']
	},
	originalPrice: {
		type: Number,
		default: null
	},
	rating: {
		type: Number,
		default: 0,
		min: 0,
		max: 5
	},
	images: [{
		public_id: {
			type: String,
			required: true
		},
		url: {
			type: String,
			required: true
		}
	}],
	category: {
		type: String,
		required: [true, 'Please enter product category'],
		trim: true
	},
	brand: {
		type: String,
		required: [true, 'Please enter product brand'],
		trim: true
	},
	type: {
		type: String,
		required: [true, 'Please enter product type'],
		trim: true
	},
	stock: {
		type: Number,
		required: [true, 'Please enter product stock'],
		default: 0,
		min: [0, 'Stock cannot be negative']
	},
	numOfReviews: {
		type: Number,
		default: 0
	},
	reviews: [{
		user: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			required: true
		},
		name: {
			type: String,
			required: true
		},
		rating: {
			type: Number,
			required: true
		},
		comment: {
			type: String,
			required: true
		}
	}],
	createdBy: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: true
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model('Product', productSchema);

