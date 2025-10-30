require('dotenv').config({ path: './config/.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

async function createAdmin(name, email, password) {
    try {
        await mongoose.connect(process.env.DB_URI);
        console.log('Connected to database');

        // Check if user exists
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            console.error('❌ User already exists:', email);
            process.exit(1);
        }

        // Create admin user
        const user = await User.create({
            name,
            email,
            password,
            role: 'admin',
            emailVerified: true // Pre-verify admin accounts
        });

        console.log('✅ Successfully created admin user:');
        console.log('Details:', {
            name: user.name,
            email: user.email,
            role: user.role,
            emailVerified: user.emailVerified
        });
        console.log('You can now login with these credentials.');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

// Get arguments from command line
const [name, email, password] = process.argv.slice(2);
if (!name || !email || !password) {
    console.error('❌ Please provide name, email and password:');
    console.error('Usage: node create-admin.js "Admin Name" admin@example.com password123');
    process.exit(1);
}

createAdmin(name, email, password);