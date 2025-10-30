const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Please enter your name'],
		trim: true
	},
	email: {
		type: String,
		required: [true, 'Please enter your email'],
		unique: true,
		lowercase: true,
		trim: true
	},
	password: {
		type: String,
		required: [true, 'Please enter your password'],
		minlength: [6, 'Password must be at least 6 characters'],
		select: false
	},
	avatar: {
		public_id: String,
		url: String
	},
	role: {
		type: String,
		enum: ['user', 'admin'],
		default: 'user'
	},
	emailVerified: {
		type: Boolean,
		default: false
	},
	emailVerificationToken: String,
	emailVerificationExpire: Date,
	resetPasswordToken: String,
	resetPasswordExpire: Date,
	createdAt: {
		type: Date,
		default: Date.now
	}
});

userSchema.pre('save', async function(next) {
	if (!this.isModified('password')) {
		next();
	}
	this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function(enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function() {
	const resetToken = crypto.randomBytes(20).toString('hex');
	this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
	this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
	return resetToken;
};

userSchema.methods.getEmailVerificationToken = function() {
	const verificationToken = crypto.randomBytes(20).toString('hex');
	this.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
	this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
	return verificationToken;
};

module.exports = mongoose.model('User', userSchema);

