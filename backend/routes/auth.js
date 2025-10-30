const express = require('express');
const router = express.Router();
const {
	register,
	login,
	forgotPassword,
	resetPassword,
	getMe,
	verifyEmail
} = require('../controllers/authController');
const upload = require('../utils/upload');
const { isAuthenticated } = require('../middlewares/auth');

router.post('/register', upload.single('avatar'), register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', isAuthenticated, getMe);
router.get('/verify-email/:token', verifyEmail);

module.exports = router;

