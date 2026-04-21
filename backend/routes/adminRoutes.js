const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  getAllUsers,
  toggleUserActive,
  getPendingProviders,
  updateProviderApproval,
  getAllBookings,
  deleteUser,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require admin role
router.use(protect, authorize('admin'));

router.get('/analytics', getAnalytics);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-active', toggleUserActive);
router.delete('/users/:id', deleteUser);
router.get('/providers/pending', getPendingProviders);
router.put('/providers/:id/approval', updateProviderApproval);
router.get('/bookings', getAllBookings);

module.exports = router;
