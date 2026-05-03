const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  getCategories,
} = require('../controllers/productController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

const { storage } = require('../config/cloudinary');

const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, authorizeRoles('admin', 'staff'), createProduct);
router.put('/:id', protect, authorizeRoles('admin', 'staff'), updateProduct);
router.delete('/:id', protect, authorizeRoles('admin'), deleteProduct);
router.post(
  '/:id/upload-image',
  protect,
  authorizeRoles('admin', 'staff'),
  upload.single('image'),
  uploadProductImage
);

// Category routes (Nested under product module)
router.get('/categories/all', getCategories);

module.exports = router;
