const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;
const { sendEmail, getVerificationEmailContent, getPasswordResetEmailContent } = require('../utils/nodemailer');

const getJwtToken = (userId) => {
	return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'your-secret-key-change-in-production', {
		expiresIn: process.env.JWT_EXPIRE || '7d'
	});
};

// Register user
exports.register = async (req, res) => {
	try {
		const { name, email, password } = req.body;

		// Check if user exists
		let user = await User.findOne({ email });
		if (user) {
			return res.status(400).json({
				success: false,
				message: 'User already exists'
			});
		}

		// Upload avatar to Cloudinary if provided
		let avatarData = {};
		if (req.file) {
			const result = await new Promise((resolve, reject) => {
				const uploadStream = cloudinary.uploader.upload_stream(
					{ folder: 'avatars' },
					(error, result) => {
						if (error) reject(error);
						else resolve(result);
					}
				);
				uploadStream.end(req.file.buffer);
			});

			avatarData = {
				public_id: result.public_id,
				url: result.secure_url
			};
		}

		// Create user
		user = await User.create({
			name,
			email,
			password,
			avatar: avatarData
		});

		// Generate email verification token
		const verificationToken = user.getEmailVerificationToken();
		await user.save({ validateBeforeSave: false });

		// Send verification email
		const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`;
		const message = getVerificationEmailContent(verificationUrl);

		try {
			await sendEmail({
				email: user.email,
				subject: 'Email Verification',
				message
			});

			res.status(201).json({
				success: true,
				message: 'Registration successful. Please verify your email.'
			});
		} catch (emailError) {
			user.emailVerificationToken = undefined;
			user.emailVerificationExpire = undefined;
			await user.save({ validateBeforeSave: false });

			return res.status(500).json({
				success: false,
				message: 'Email could not be sent'
			});
		}
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message
		});
	}
};

// Login user
exports.login = async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({
				success: false,
				message: 'Please provide email and password'
			});
		}

		const user = await User.findOne({ email }).select('+password');

		if (!user) {
			return res.status(401).json({
				success: false,
				message: 'Invalid email or password'
			});
		}

		const isPasswordMatched = await user.comparePassword(password);

		if (!isPasswordMatched) {
			return res.status(401).json({
				success: false,
				message: 'Invalid email or password'
			});
		}

		const token = getJwtToken(user._id);

		res.status(200).json({
			success: true,
			token,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				emailVerified: user.emailVerified,
				avatar: user.avatar
			}
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message
		});
	}
};

// Forgot password
exports.forgotPassword = async (req, res) => {
	try {
		const user = await User.findOne({ email: req.body.email });

		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found'
			});
		}

		const resetToken = user.getResetPasswordToken();
		await user.save({ validateBeforeSave: false });

		const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
		const message = getPasswordResetEmailContent(resetUrl);

		try {
			await sendEmail({
				email: user.email,
				subject: 'Password Reset',
				message
			});

			res.status(200).json({
				success: true,
				message: 'Password reset email sent'
			});
		} catch (error) {
			user.resetPasswordToken = undefined;
			user.resetPasswordExpire = undefined;
			await user.save({ validateBeforeSave: false });

			return res.status(500).json({
				success: false,
				message: 'Email could not be sent'
			});
		}
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message
		});
	}
};

// Reset password
exports.resetPassword = async (req, res) => {
	try {
		const resetPasswordToken = crypto
			.createHash('sha256')
			.update(req.body.token)
			.digest('hex');

		const user = await User.findOne({
			resetPasswordToken,
			resetPasswordExpire: { $gt: Date.now() }
		});

		if (!user) {
			return res.status(400).json({
				success: false,
				message: 'Invalid or expired reset token'
			});
		}

		user.password = req.body.password;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpire = undefined;
		await user.save();

		res.status(200).json({
			success: true,
			message: 'Password reset successful'
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message
		});
	}
};

// Get current user
exports.getMe = async (req, res) => {
	try {
		const user = await User.findById(req.user.id);

		res.status(200).json({
			success: true,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				emailVerified: user.emailVerified,
				avatar: user.avatar
			}
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message
		});
	}
};

// Verify email
exports.verifyEmail = async (req, res) => {
	try {
		const { token } = req.params;
		
		if (!token) {
			return res.status(400).json({
				success: false,
				message: 'Verification token is required'
			});
		}

		console.log('Verifying email token:', token);

		const emailVerificationToken = crypto
			.createHash('sha256')
			.update(token)
			.digest('hex');

		console.log('Hashed token:', emailVerificationToken);

		const user = await User.findOne({
			emailVerificationToken,
			emailVerificationExpire: { $gt: Date.now() }
		});

		if (!user) {
			// Log the verification attempt for debugging
			const expiredUser = await User.findOne({ emailVerificationToken });
			if (expiredUser) {
				console.log('Token expired. Expiry:', expiredUser.emailVerificationExpire, 'Current:', Date.now());
			} else {
				console.log('No user found with token:', emailVerificationToken);
			}

			return res.status(400).json({
				success: false,
				message: 'Invalid or expired verification token'
			});
		}

		console.log('Found user:', user.email);

		user.emailVerified = true;
		user.emailVerificationToken = undefined;
		user.emailVerificationExpire = undefined;
		await user.save();

		res.status(200).json({
			success: true,
			message: 'Email verified successfully'
		});
	} catch (error) {
		console.error('Email verification error:', error);
		res.status(500).json({
			success: false,
			message: error.message
		});
	}
};

