const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getProviderBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking,
  addReview,
  toggleAvailability,
  getProviderEarnings,
  getNearbyBookings,
  acceptBooking,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('user'), createBooking);
router.get('/my-bookings', protect, authorize('user'), getMyBookings);
router.get('/provider-bookings', protect, authorize('provider'), getProviderBookings);
router.get('/provider-earnings', protect, authorize('provider'), getProviderEarnings);
router.get('/nearby', protect, authorize('provider'), getNearbyBookings);
router.put('/toggle-availability', protect, authorize('provider'), toggleAvailability);
router.get('/:id', protect, getBooking);
router.put('/:id/accept', protect, authorize('provider'), acceptBooking);
router.put('/:id/status', protect, authorize('provider', 'admin'), updateBookingStatus);
router.put('/:id/cancel', protect, authorize('user'), cancelBooking);
router.post('/:id/review', protect, authorize('user'), addReview);

module.exports = router;
