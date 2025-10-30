const nodemailer = require('nodemailer');

// Validate required environment variables
const requiredEnvVars = {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_EMAIL: process.env.SMTP_EMAIL,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    FROM_NAME: process.env.FROM_NAME,
    FROM_EMAIL: process.env.FROM_EMAIL
};

const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars.join(', '));
}

// Create reusable transporter using SMTP config from env
const transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
        user: 'e49c424618c468',
        pass: 'b48305592237c5'
    },
    debug: true, // Enable debugging
    logger: true  // Enable logging
});

// Verify SMTP connection on startup
transporter.verify()
    .then(() => console.log('SMTP server connection successful'))
    .catch(err => console.error('SMTP server connection failed:', err.message));

/**
 * Send an email using nodemailer
 * @param {Object} options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Email body (HTML)
 */
const sendEmail = async (options) => {
    try {
        if (!options.email) {
            throw new Error('Recipient email is required');
        }

        const message = {
            from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
            to: options.email,
            subject: options.subject || 'No Subject',
            html: options.message
        };

        const info = await transporter.sendMail(message);
        console.log('Email sent successfully:', {
            messageId: info.messageId,
            to: options.email,
            subject: options.subject
        });
        return info;
    } catch (error) {
        console.error('Failed to send email:', {
            error: error.message,
            code: error.code,
            response: error.response,
            to: options.email,
            subject: options.subject
        });
        throw new Error(`Email sending failed: ${error.message}`);
    }
};

// Utility function to generate verification email content
const getVerificationEmailContent = (verificationUrl) => `
    <h1>Please verify your email</h1>
    <p>Click the link below to verify your email address:</p>
    <a href="${verificationUrl}">${verificationUrl}</a>
    <p>This link will expire in 24 hours.</p>
`;

// Utility function to generate password reset email content
const getPasswordResetEmailContent = (resetUrl) => `
    <h1>Password Reset Request</h1>
    <p>You requested a password reset. Click the link below:</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <p>This link will expire in 15 minutes.</p>
`;

module.exports = {
    sendEmail,
    getVerificationEmailContent,
    getPasswordResetEmailContent
};