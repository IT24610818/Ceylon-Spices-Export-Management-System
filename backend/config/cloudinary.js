const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ceylon-spices-products',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  },
});

const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ceylon-spices-documents',
    resource_type: 'auto', // This allows PDFs and other raw files
  },
});

module.exports = { cloudinary, storage, documentStorage };
