const cloudinary = require('./cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Storage Config
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'lostfound-app',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
    },
});

module.exports = storage;
