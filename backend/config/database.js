const mongoose = require('mongoose');

const connectDatabase = () => {
    const mongoURI = process.env.DB_URI;
    
    if (!mongoURI) {
        console.error('MongoDB URI is not defined in environment variables');
        process.exit(1);
    }
    
    mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    }).then(con => {
        console.log(`MongoDB Database connected with HOST: ${con.connection.host}`);
    }).catch(err => {
        console.error('MongoDB connection error:', err.message);
        // Retry connection after 5 seconds
        setTimeout(connectDatabase, 5000);
    });
    
    // Handle connection events
    mongoose.connection.on('connected', () => {
        console.log('MongoDB connected successfully');
    });
    
    mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
    });
    
    // Handle application termination
    process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    });
}

module.exports = connectDatabase