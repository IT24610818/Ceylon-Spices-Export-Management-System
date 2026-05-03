const express = require('express');
const multer = require('multer');
const {
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  hideDocument,
} = require('../controllers/documentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { documentStorage } = require('../config/cloudinary');

const router = express.Router();

const upload = multer({
  storage: documentStorage,
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and images (JPG, PNG) are allowed'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

router.get('/', protect, getDocuments);
router.get('/:id', protect, getDocumentById);
router.post('/', protect, authorizeRoles('admin', 'staff'), upload.single('file'), createDocument);
router.patch('/:id', protect, authorizeRoles('admin', 'staff'), upload.single('file'), updateDocument);
router.delete('/:id', protect, authorizeRoles('admin', 'staff'), deleteDocument);
router.patch('/:id/hide', protect, authorizeRoles('client'), hideDocument);

module.exports = router;
