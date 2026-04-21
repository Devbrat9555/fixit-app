const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Category = require('../models/Category');

// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalProviders,
    totalServices,
    totalBookings,
    pendingProviders,
    totalRevenue,
    recentBookings,
    bookingsByStatus,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'provider' }),
    Service.countDocuments({ isActive: true }),
    Booking.countDocuments(),
    User.countDocuments({ role: 'provider', isApproved: false }),
    Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Booking.find()
      .populate('user', 'name email')
      .populate('service', 'title price')
      .sort('-createdAt')
      .limit(5),
    Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  const monthlyRevenue = await Booking.aggregate([
    { $match: { status: 'completed' } },
    {
      $group: {
        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        revenue: { $sum: '$totalAmount' },
        bookings: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 },
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalProviders,
      totalServices,
      totalBookings,
      pendingProviders,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentBookings,
      bookingsByStatus,
      monthlyRevenue,
    },
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const { role, isActive, page = 1, limit = 20, search } = req.query;
  const query = {};

  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await User.countDocuments(query);
  const users = await User.find(query).sort('-createdAt').skip(skip).limit(Number(limit));

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    totalPages: Math.ceil(total / Number(limit)),
    data: users,
  });
});

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle-active
// @access  Private/Admin
const toggleUserActive = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role === 'admin') {
    res.status(400);
    throw new Error('Cannot deactivate admin accounts');
  }

  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
    data: user,
  });
});

// @desc    Get pending providers
// @route   GET /api/admin/providers/pending
// @access  Private/Admin
const getPendingProviders = asyncHandler(async (req, res) => {
  const providers = await User.find({ role: 'provider', isApproved: false }).sort('-createdAt');
  res.status(200).json({ success: true, count: providers.length, data: providers });
});

// @desc    Approve/Reject provider
// @route   PUT /api/admin/providers/:id/approval
// @access  Private/Admin
const updateProviderApproval = asyncHandler(async (req, res) => {
  const { isApproved } = req.body;
  const provider = await User.findOne({ _id: req.params.id, role: 'provider' });

  if (!provider) {
    res.status(404);
    throw new Error('Provider not found');
  }

  provider.isApproved = isApproved;
  await provider.save();

  res.status(200).json({
    success: true,
    message: `Provider ${isApproved ? 'approved' : 'rejected'} successfully`,
    data: provider,
  });
});

// @desc    Get all bookings (admin)
// @route   GET /api/admin/bookings
// @access  Private/Admin
const getAllBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Booking.countDocuments(query);

  const bookings = await Booking.find(query)
    .populate('user', 'name email phone')
    .populate('provider', 'name email phone')
    .populate('service', 'title price')
    .sort('-createdAt')
    .skip(skip)
    .limit(Number(limit));

  res.status(200).json({
    success: true,
    count: bookings.length,
    total,
    totalPages: Math.ceil(total / Number(limit)),
    data: bookings,
  });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (user.role === 'admin') {
    res.status(400);
    throw new Error('Cannot delete admin accounts');
  }
  await user.deleteOne();
  res.status(200).json({ success: true, message: 'User deleted successfully' });
});

module.exports = {
  getAnalytics,
  getAllUsers,
  toggleUserActive,
  getPendingProviders,
  updateProviderApproval,
  getAllBookings,
  deleteUser,
};
