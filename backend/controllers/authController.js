const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { sendTokenResponse } = require('../utils/tokenUtils');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  // Validate role - admin cannot self-register unless they have the special email
  const isAdminEmail = email === 'vrat1087@gmail.com';
  const allowedRoles = isAdminEmail ? ['user', 'provider', 'admin'] : ['user', 'provider'];
  const userRole = allowedRoles.includes(role) ? role : (isAdminEmail ? 'admin' : 'user');

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: userRole,
    isApproved: true, // Auto-approve all roles as requested
  });

  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('Your account has been deactivated. Please contact support.');
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({ success: true, data: user });
});

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    name: req.body.name,
    phone: req.body.phone,
    address: req.body.address,
    avatar: req.body.avatar,
  };

  if (req.body.providerProfile && req.user.role === 'provider') {
    fieldsToUpdate.providerProfile = req.body.providerProfile;
  }

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(
    (key) => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  const user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: user });
});

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Complete user/provider setup
// @route   POST /api/auth/complete-setup
// @access  Private
const completeSetup = asyncHandler(async (req, res) => {
  const { role, phone, address, providerProfile } = req.body;

  const isAdminEmail = req.user.email === 'vrat1087@gmail.com';
  const validRoles = isAdminEmail ? ['user', 'provider', 'admin'] : ['user', 'provider'];

  if (!validRoles.includes(role)) {
    res.status(400);
    throw new Error('Invalid role selected');
  }

  const updateData = {
    role,
    phone,
    address,
    hasFinishedSetup: true,
  };

  if (role === 'provider' && providerProfile) {
    updateData.providerProfile = providerProfile;
  }
  
  updateData.isApproved = true; // Auto-approve as requested

  const user = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: user });
});

// @desc    Get providers by skill/category
// @route   GET /api/auth/providers
// @access  Private
const getProviders = asyncHandler(async (req, res) => {
  const { skill, city } = req.query;
  const query = { role: 'provider', isApproved: true, isActive: true };
  
  if (skill) {
    // Flexible match: "Electrical" matches "Electrician", "Appliances" matches "Appliance Repair"
    const skillBase = skill.toLowerCase().substring(0, 5); 
    query['providerProfile.skills'] = { $regex: new RegExp(skillBase, 'i') };
  }
  
  if (city) {
    query['address.city'] = { $regex: city, $options: 'i' };
  }

  let providers = await User.find(query).select('-password');
  res.status(200).json({ success: true, data: providers });
});

// @desc    Get single provider by ID
// @route   GET /api/auth/providers/:id
// @access  Private
const getProviderById = asyncHandler(async (req, res) => {
  const provider = await User.findById(req.params.id).select('-password');
  if (!provider || provider.role !== 'provider') {
    res.status(404);
    throw new Error('Provider not found');
  }
  res.status(200).json({ success: true, data: provider });
});

const promoteUser = asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ success: false, message: 'Not allowed in production' });
  }
  const { role } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { role }, { new: true });
  res.status(200).json({ success: true, data: user });
});

module.exports = { 
  register, 
  login, 
  getMe, 
  updateProfile, 
  changePassword, 
  completeSetup, 
  getProviders, 
  getProviderById,
  promoteUser
};
