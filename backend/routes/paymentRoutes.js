const express = require('express');
const multer = require('multer');
const {
  simulatedPay,
  getPayments,
  getPaymentById,
  updatePaymentStatus,
  deletePayment,
  hidePayment,
  uploadReceiptImage,
} = require('../controllers/paymentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { storage } = require('../config/cloudinary');

const router = express.Router();

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get('/', protect, getPayments);
router.get('/:id', protect, getPaymentById);
router.post('/simulated-pay', protect, authorizeRoles('client'), simulatedPay);
router.patch('/:id', protect, authorizeRoles('admin', 'staff'), updatePaymentStatus);
router.delete('/:id', protect, authorizeRoles('admin'), deletePayment);
router.post('/:id/upload-receipt', protect, authorizeRoles('client'), upload.single('image'), uploadReceiptImage);
router.patch('/:id/hide', protect, authorizeRoles('client'), hidePayment);

module.exports = router;
