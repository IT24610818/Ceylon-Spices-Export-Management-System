const express = require('express');
const {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
  hideOrderForClient,
  updateOrderItems,
} = require('../controllers/orderController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getOrders);
router.get('/:id', protect, getOrderById);
router.post('/', protect, authorizeRoles('client'), createOrder);
router.put('/:id', protect, authorizeRoles('client'), updateOrderItems);
router.patch('/:id/status', protect, authorizeRoles('admin', 'staff'), updateOrderStatus);
router.patch('/:id/cancel', protect, authorizeRoles('client'), cancelOrder);
router.patch('/:id/hide', protect, authorizeRoles('client'), hideOrderForClient);
router.delete('/:id', protect, authorizeRoles('admin'), deleteOrder);

module.exports = router;
