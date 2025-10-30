const app = require('./app');
const connectDatabase = require('./config/database')
const cloudinary = require('cloudinary').v2;

require('dotenv').config({path: './config/.env'})

connectDatabase();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// On startup, verify Cloudinary connectivity and log status
const cloudName = process.env.CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

if (!cloudName || !apiKey || !apiSecret) {
    console.error('Cloudinary env vars missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET')
} else {
    const maskedKey = apiKey.length > 4 ? `${apiKey.slice(0, 2)}***${apiKey.slice(-2)}` : '***'
    cloudinary.api.ping()
        .then(() => {
            console.log(`Cloudinary connected as ${cloudName} (key ${maskedKey})`)
        })
        .catch((err) => {
            const message = (err && err.error && err.error.message) || err.message || 'Unknown error'
            const code = (err && err.error && err.error.http_code) || err.http_code || 'N/A'
            console.error(`Cloudinary connection failed: ${message} (code ${code})`)
        })
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});