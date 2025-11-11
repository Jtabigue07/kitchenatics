require('dotenv').config({ path: './config/.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

async function makeAdmin(userId) {
    try {
        await mongoose.connect(process.env.DB_URI);
        console.log('Connected to database');

        const user = await User.findById(userId);
        if (!user) {
            console.error('❌ User not found with ID:', userId);
            process.exit(1);
        }

        // Save original values for comparison
        const original = {
            role: user.role,
            emailVerified: user.emailVerified
        };

        // Update user to admin
        user.role = 'admin';
        user.emailVerified = true; // Ensure admin can login immediately
        await user.save();
        
        console.log('✅ Successfully updated user to admin');
        console.log('User details:', {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role + (original.role === 'admin' ? ' (no change)' : ' (was: ' + original.role + ')'),
            emailVerified: user.emailVerified + (original.emailVerified ? ' (no change)' : ' (was: false)')
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

// Allow passing userId as first CLI argument: node make-admin.js <userId>
const userIdFromArg = process.argv[2]
if (!userIdFromArg) {
    console.error('Usage: node make-admin.js <userId>')
    process.exit(1)
}

makeAdmin(userIdFromArg);