const express = require('express');
const {
  getClients,
  getClientById,
  getClientOrders,
  createClient,
  updateClient,
  deleteClient,
  toggleUserStatus,
} = require('../controllers/clientController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, authorizeRoles('admin', 'staff'), getClients);
router.get('/:id', protect, authorizeRoles('admin', 'staff'), getClientById);
router.get('/:id/orders', protect, authorizeRoles('admin', 'staff'), getClientOrders);
router.post('/', protect, authorizeRoles('admin', 'staff'), createClient); // Allowed staff to create clients too
router.put('/:id', protect, authorizeRoles('admin', 'staff'), updateClient);
router.delete('/:id', protect, authorizeRoles('admin', 'staff'), deleteClient);
router.patch('/:id/status', protect, authorizeRoles('admin', 'staff'), toggleUserStatus);

module.exports = router;
