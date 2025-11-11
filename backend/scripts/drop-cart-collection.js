const mongoose = require('mongoose');
require('dotenv').config();

const dropCartCollection = async () => {
    try {
        await mongoose.connect(process.env.DB_URI || 'mongodb://localhost:27017/kitchenatics');

        console.log('Connected to MongoDB');

        // Drop the carts collection
        await mongoose.connection.db.dropCollection('carts');
        console.log('Carts collection dropped successfully');

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error dropping carts collection:', error);
        process.exit(1);
    }
};

dropCartCollection();
