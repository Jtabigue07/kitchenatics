const Product = require('../models/Product');
const cloudinary = require('cloudinary').v2;

// Get all products with filtering
exports.getProducts = async (req, res) => {
	try {
		const {
			keyword,
			category,
			brand,
			type,
			minPrice,
			maxPrice,
			page = 1,
			limit = 10
		} = req.query;

		// Build query
		const query = {};

		if (keyword) {
			query.$or = [
				{ name: { $regex: keyword, $options: 'i' } },
				{ description: { $regex: keyword, $options: 'i' } },
				{ category: { $regex: keyword, $options: 'i' } }
			];
		}

		if (category) {
			query.category = category;
		}

		if (brand) {
			query.brand = brand;
		}

		if (type) {
			query.type = type;
		}

		if (minPrice || maxPrice) {
			query.price = {};
			if (minPrice) {
				query.price.$gte = parseFloat(minPrice);
			}
			if (maxPrice) {
				query.price.$lte = parseFloat(maxPrice);
			}
		}

		// Calculate pagination
		const skip = (parseInt(page) - 1) * parseInt(limit);

		// Execute query
		const products = await Product.find(query)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(parseInt(limit))
			.populate('createdBy', 'name email');

		const totalProducts = await Product.countDocuments(query);

		res.status(200).json({
			success: true,
			products,
			totalProducts,
			currentPage: parseInt(page),
			totalPages: Math.ceil(totalProducts / parseInt(limit))
		});
	} catch (error) {
		console.error('Error fetching products:', error);
		res.status(500).json({
			success: false,
			message: error.message || 'Failed to fetch products',
			error: process.env.NODE_ENV === 'development' ? error.stack : undefined
		});
	}
};

// Get single product
exports.getProduct = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id).populate('createdBy', 'name email');

		if (!product) {
			return res.status(404).json({
				success: false,
				message: 'Product not found'
			});
		}

		res.status(200).json({
			success: true,
			product
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message
		});
	}
};

// Create product (Admin only)
exports.createProduct = async (req, res) => {
	try {
		console.log('Create product request body:', req.body);
		console.log('Create product files:', req.files);
		
		const { name, description, price, originalPrice, category, brand, type, stock } = req.body;

		// Validate required fields
		if (!name || !description || !price || !category || !brand || !type || stock === undefined) {
			console.log('Missing fields:', { name, description, price, category, brand, type, stock });
			return res.status(400).json({
				success: false,
				message: 'Please provide all required fields',
				received: { name, description, price, category, brand, type, stock }
			});
		}

		// Handle image uploads
		let images = [];
		if (req.files && req.files.length > 0) {
			try {
				for (const file of req.files) {
					const result = await new Promise((resolve, reject) => {
						const uploadStream = cloudinary.uploader.upload_stream(
							{ folder: 'products' },
							(error, result) => {
								if (error) reject(error);
								else resolve(result);
							}
						);
						uploadStream.end(file.buffer);
					});

					images.push({
						public_id: result.public_id,
						url: result.secure_url
					});
				}
			} catch (imageError) {
				console.error('Image upload error:', imageError);
				// Continue with placeholder if image upload fails
				images.push({
					public_id: 'placeholder',
					url: 'https://via.placeholder.com/300x250?text=Product'
				});
			}
		} else {
			// Default placeholder image if no images provided
			images.push({
				public_id: 'placeholder',
				url: 'https://via.placeholder.com/300x250?text=Product'
			});
		}

		const product = await Product.create({
			name,
			description,
			price: parseFloat(price),
			originalPrice: originalPrice ? parseFloat(originalPrice) : null,
			category,
			brand,
			type,
			stock: parseInt(stock),
			images,
			createdBy: req.user.id
		});

		res.status(201).json({
			success: true,
			product
		});
	} catch (error) {
		console.error('Error creating product:', error);
		res.status(500).json({
			success: false,
			message: error.message || 'Failed to create product',
			error: process.env.NODE_ENV === 'development' ? error.stack : undefined
		});
	}
};

// Update product (Admin only)
exports.updateProduct = async (req, res) => {
	try {
		let product = await Product.findById(req.params.id);

		if (!product) {
			return res.status(404).json({
				success: false,
				message: 'Product not found'
			});
		}

		const { name, description, price, originalPrice, category, brand, type, stock } = req.body;

		// Update fields
		if (name) product.name = name;
		if (description) product.description = description;
		if (price) product.price = parseFloat(price);
		if (originalPrice !== undefined) product.originalPrice = originalPrice ? parseFloat(originalPrice) : null;
		if (category) product.category = category;
		if (brand) product.brand = brand;
		if (type) product.type = type;
		if (stock !== undefined) product.stock = parseInt(stock);

		// Handle new image uploads
		if (req.files && req.files.length > 0) {
			// Delete old images from Cloudinary
			for (const img of product.images) {
				if (img.public_id !== 'placeholder') {
					await cloudinary.uploader.destroy(img.public_id);
				}
			}

			// Upload new images
			const images = [];
			for (const file of req.files) {
				const result = await new Promise((resolve, reject) => {
					const uploadStream = cloudinary.uploader.upload_stream(
						{ folder: 'products' },
						(error, result) => {
							if (error) reject(error);
							else resolve(result);
						}
					);
					uploadStream.end(file.buffer);
				});

				images.push({
					public_id: result.public_id,
					url: result.secure_url
				});
			}
			product.images = images;
		}

		await product.save();

		res.status(200).json({
			success: true,
			product
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message
		});
	}
};

// Delete product (Admin only)
exports.deleteProduct = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);

		if (!product) {
			return res.status(404).json({
				success: false,
				message: 'Product not found'
			});
		}

		// Delete images from Cloudinary
		for (const img of product.images) {
			if (img.public_id !== 'placeholder') {
				await cloudinary.uploader.destroy(img.public_id);
			}
		}

		await product.deleteOne();

		res.status(200).json({
			success: true,
			message: 'Product deleted successfully'
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message
		});
	}
};

