const express = require('express');
const router = express.Router();
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  getMyServices,
  getFeaturedServices,
} = require('../controllers/serviceController');
const { protect, authorize, requireApproved } = require('../middleware/auth');

router.get('/featured', getFeaturedServices);
router.get('/my-services', protect, authorize('provider'), getMyServices);
router.get('/', getServices);
router.get('/:id', getService);
router.post('/', protect, authorize('provider'), requireApproved, createService);
router.put('/:id', protect, authorize('provider', 'admin'), updateService);
router.delete('/:id', protect, authorize('provider', 'admin'), deleteService);

module.exports = router;
