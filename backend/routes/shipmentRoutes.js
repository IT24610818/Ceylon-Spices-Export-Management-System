const express = require('express');
const {
  getShipments,
  getShipmentById,
  createShipment,
  updateShipment,
  deleteShipment,
} = require('../controllers/shipmentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getShipments);
router.get('/:id', protect, getShipmentById);
router.post('/', protect, authorizeRoles('admin', 'staff'), createShipment);
router.patch('/:id', protect, authorizeRoles('admin', 'staff'), updateShipment);
router.delete('/:id', protect, authorizeRoles('admin', 'staff'), deleteShipment);

module.exports = router;
