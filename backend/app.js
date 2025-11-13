const express = require('express');
const app = express();
const cors = require('cors')
const cloudinary = require('cloudinary').v2

const products = require('./routes/product');
const auth = require('./routes/auth');
const order = require('./routes/order');
const admin = require('./routes/admin');
const cart = require('./routes/cart');
const receipt = require('./routes/receipt');



app.use(cors());
app.use(express.json({limit:'50mb'}));
app.use(express.urlencoded({limit: "50mb", extended: true }));

app.use('/api/v1', products);
// Mount auth routes under /api/v1/auth so frontend paths like /api/v1/auth/register match
app.use('/api/v1/auth', auth);
app.use('/api/v1/orders', order);
// Admin routes (user management)
app.use('/api/v1/admin', admin);
// Cart routes
app.use('/api/v1/cart', cart);
// Receipt routes
app.use('/api/v1/receipt', receipt);


// Health check: verify Cloudinary credentials/connectivity
app.get('/api/v1/health/cloudinary', async (req, res) => {
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        })
        const ping = await cloudinary.api.ping()
        return res.status(200).json({
            ok: true,
            service: 'cloudinary',
            cloudName: cloudinary.config().cloud_name,
            result: ping
        })
    } catch (err) {
        return res.status(500).json({
            ok: false,
            service: 'cloudinary',
            error: err?.message || 'Cloudinary connection failed'
        })
    }
})

// Basic health endpoint to verify frontend-backend connectivity
app.get('/api/v1/health', (req, res) => {
    return res.status(200).json({ ok: true, service: 'backend', timestamp: Date.now() })
})



module.exports = app
