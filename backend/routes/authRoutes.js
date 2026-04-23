const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  updateProfile, 
  changePassword, 
  completeSetup, 
  getProviders, 
  getProviderById,
  promoteUser
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/complete-setup', protect, completeSetup);
router.put('/password', protect, changePassword);
router.get('/providers', protect, getProviders);
router.get('/providers/:id', protect, getProviderById);
router.post('/promote', protect, promoteUser);

module.exports = router;
