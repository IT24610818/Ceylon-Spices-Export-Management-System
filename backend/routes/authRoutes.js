const express = require('express');
const { register, login, me, updateProfile, uploadProfilePhoto, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const { storage } = require('../config/cloudinary');

const upload = multer({ storage });
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, me);
router.put('/profile', protect, updateProfile);
router.post('/profile/photo', protect, upload.single('photo'), uploadProfilePhoto);
router.put('/change-password', protect, changePassword);

module.exports = router;
