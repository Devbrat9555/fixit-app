const asyncHandler = require('express-async-handler');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

// ── Create booking ────────────────────────────────────────────────────────────
const createBooking = asyncHandler(async (req, res) => {
  const { serviceId, scheduledDate, scheduledTime, address, notes, paymentMethod, isUrgent, razorpayOrderId, razorpayPaymentId } = req.body;

  const service = await Service.findById(serviceId).populate('provider', 'name');
  if (!service) { res.status(404); throw new Error('Service not found'); }
  if (!service.isActive) { res.status(400); throw new Error('This service is currently unavailable'); }

  // Platform fee: 10% of service price
  const platformFee = Math.round(service.price * 0.1);
  const providerPayout = service.price - platformFee;

  const booking = await Booking.create({
    user: req.user._id,
    provider: service.provider._id,
    service: serviceId,
    scheduledDate,
    scheduledTime,
    address,
    notes,
    paymentMethod: paymentMethod || 'cash',
    totalAmount: service.price,
    platformFee,
    providerPayout,
    isUrgent: isUrgent || false,
    status: paymentMethod === 'online' ? 'confirmed' : 'pending',
    paymentStatus: paymentMethod === 'online' ? 'paid' : 'pending',
    razorpayOrderId,
    razorpayPaymentId,
    timeline: [{ status: paymentMethod === 'online' ? 'confirmed' : 'pending', note: 'Booking created by customer' }],
  });

  await Service.findByIdAndUpdate(serviceId, { $inc: { totalBookings: 1 } });

  const populatedBooking = await Booking.findById(booking._id)
    .populate('service', 'title price image')
    .populate('provider', 'name phone avatar')
    .populate('user', 'name phone');

  // Notify provider
  await createNotification({
    recipient: service.provider._id,
    type: 'booking_created',
    title: 'New Booking Request 📋',
    message: `${req.user.name} has requested "${service.title}" on ${new Date(scheduledDate).toLocaleDateString('en-IN')}`,
    data: { bookingId: booking._id },
    icon: '📋',
  });

  res.status(201).json({ success: true, data: populatedBooking });
});

// ── Get user bookings ────────────────────────────────────────────────────────
const getMyBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const query = { user: req.user._id };
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Booking.countDocuments(query);

  const bookings = await Booking.find(query)
    .populate('service', 'title price image category')
    .populate('provider', 'name phone avatar providerProfile')
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

// ── Get provider bookings ───────────────────────────────────────────────────
const getProviderBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const query = { provider: req.user._id };
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Booking.countDocuments(query);

  const bookings = await Booking.find(query)
    .populate('service', 'title price image')
    .populate('user', 'name phone avatar address')
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

// ── Get single booking ──────────────────────────────────────────────────────
const getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('service', 'title price image description')
    .populate('provider', 'name phone avatar address providerProfile')
    .populate('user', 'name phone avatar');

  if (!booking) { res.status(404); throw new Error('Booking not found'); }

  const isOwner =
    booking.user._id.toString() === req.user._id.toString() ||
    booking.provider._id.toString() === req.user._id.toString() ||
    req.user.role === 'admin';

  if (!isOwner) { res.status(403); throw new Error('Not authorized'); }

  res.status(200).json({ success: true, data: booking });
});

// ── Update booking status (provider/admin) ──────────────────────────────────
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status, cancellationReason, note } = req.body;
  const booking = await Booking.findById(req.params.id)
    .populate('user', 'name')
    .populate('service', 'title');

  if (!booking) { res.status(404); throw new Error('Booking not found'); }

  const isProvider = booking.provider.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isProvider && !isAdmin) { res.status(403); throw new Error('Not authorized'); }

  const providerAllowed = { pending: ['confirmed', 'rejected'], confirmed: ['in_progress', 'cancelled'], in_progress: ['completed'] };
  if (isProvider && !isAdmin) {
    const allowed = providerAllowed[booking.status];
    if (!allowed?.includes(status)) {
      res.status(400); throw new Error(`Cannot change status from '${booking.status}' to '${status}'`);
    }
  }

  booking.status = status;
  if (cancellationReason) booking.cancellationReason = cancellationReason;
  booking.timeline.push({ status, note: note || `Status updated to ${status}` });

  // Handle earnings when completed
  if (status === 'completed') {
    booking.paymentStatus = booking.paymentMethod === 'cash' ? 'paid' : 'paid';
    await User.findByIdAndUpdate(booking.provider, {
      $inc: {
        'providerProfile.totalEarnings': booking.providerPayout,
        'providerProfile.pendingEarnings': booking.providerPayout,
        'providerProfile.completedJobs': 1,
      },
    });
    await Service.findByIdAndUpdate(booking.service, { $inc: { totalBookings: 0 } }); // already incremented
  }

  await booking.save();

  // Notifications
  const notifMap = {
    confirmed: { type: 'booking_confirmed', title: 'Booking Confirmed ✅', icon: '✅', msg: `Your booking for "${booking.service?.title}" has been confirmed!` },
    rejected:  { type: 'booking_rejected',  title: 'Booking Rejected ❌', icon: '❌', msg: `Your booking for "${booking.service?.title}" was rejected.` },
    in_progress: { type: 'booking_started', title: 'Service Started 🔧', icon: '🔧', msg: `Your service "${booking.service?.title}" has started.` },
    completed: { type: 'booking_completed', title: 'Service Completed 🎉', icon: '🎉', msg: `"${booking.service?.title}" completed. Please leave a review!` },
    cancelled: { type: 'booking_cancelled', title: 'Booking Cancelled', icon: '❌', msg: `Booking for "${booking.service?.title}" was cancelled.` },
  };

  if (notifMap[status]) {
    const n = notifMap[status];
    await createNotification({ recipient: booking.user, type: n.type, title: n.title, message: n.msg, data: { bookingId: booking._id }, icon: n.icon });
  }

  const updated = await Booking.findById(booking._id)
    .populate('service', 'title price image')
    .populate('provider', 'name phone avatar')
    .populate('user', 'name phone');

  res.status(200).json({ success: true, data: updated });
});

// ── Cancel booking (user) ────────────────────────────────────────────────────
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('service', 'title').populate('provider');

  if (!booking) { res.status(404); throw new Error('Booking not found'); }
  if (booking.user.toString() !== req.user._id.toString()) { res.status(403); throw new Error('Not authorized'); }
  if (['completed', 'cancelled', 'rejected'].includes(booking.status)) {
    res.status(400); throw new Error(`Booking with status '${booking.status}' cannot be cancelled`);
  }

  booking.status = 'cancelled';
  booking.cancellationReason = req.body.reason || 'Cancelled by user';
  booking.timeline.push({ status: 'cancelled', note: booking.cancellationReason });
  await booking.save();

  // Notify provider
  await createNotification({
    recipient: booking.provider._id,
    type: 'booking_cancelled',
    title: 'Booking Cancelled',
    message: `${req.user.name} cancelled the booking for "${booking.service?.title}"`,
    data: { bookingId: booking._id },
    icon: '❌',
  });

  res.status(200).json({ success: true, message: 'Booking cancelled', data: booking });
});

// ── Add review ───────────────────────────────────────────────────────────────
const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const booking = await Booking.findById(req.params.id).populate('service').populate('provider');

  if (!booking) { res.status(404); throw new Error('Booking not found'); }
  if (booking.user.toString() !== req.user._id.toString()) { res.status(403); throw new Error('Not authorized'); }
  if (booking.status !== 'completed') { res.status(400); throw new Error('You can only review completed bookings'); }
  if (booking.review) { res.status(400); throw new Error('Already reviewed'); }

  booking.review = { rating, comment };
  await booking.save();

  // Update service rating
  const service = await Service.findById(booking.service._id);
  if (service) {
    const newTotal = service.totalRatings + 1;
    service.rating = Math.round(((service.rating * service.totalRatings + rating) / newTotal) * 10) / 10;
    service.totalRatings = newTotal;
    await service.save();
  }

  // Update provider rating
  const provider = await User.findById(booking.provider._id);
  if (provider) {
    const curr = provider.providerProfile.totalRatings;
    const currRating = provider.providerProfile.rating;
    provider.providerProfile.totalRatings = curr + 1;
    provider.providerProfile.rating = Math.round(((currRating * curr + rating) / (curr + 1)) * 10) / 10;
    await provider.save();
  }

  await createNotification({
    recipient: booking.provider._id,
    type: 'new_review',
    title: 'New Review ⭐',
    message: `${req.user.name} rated your service ${rating}/5 stars`,
    data: { bookingId: booking._id },
    icon: '⭐',
  });

  res.status(200).json({ success: true, message: 'Review added', data: booking });
});

// ── Provider availability toggle ─────────────────────────────────────────────
const toggleAvailability = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.providerProfile.isOnline = !user.providerProfile.isOnline;
  await user.save();
  res.status(200).json({
    success: true,
    isOnline: user.providerProfile.isOnline,
    message: user.providerProfile.isOnline ? 'You are now online' : 'You are now offline',
  });
});

// ── Provider earnings ────────────────────────────────────────────────────────
const getProviderEarnings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ provider: req.user._id, status: 'completed' })
    .select('totalAmount providerPayout platformFee createdAt')
    .sort('-createdAt');

  const totalEarnings = bookings.reduce((sum, b) => sum + (b.providerPayout || 0), 0);
  const thisMonth = new Date();
  thisMonth.setDate(1); thisMonth.setHours(0, 0, 0, 0);
  const monthlyEarnings = bookings
    .filter(b => new Date(b.createdAt) >= thisMonth)
    .reduce((sum, b) => sum + (b.providerPayout || 0), 0);

  // Monthly breakdown for chart
  const monthly = {};
  bookings.forEach(b => {
    const key = `${new Date(b.createdAt).getFullYear()}-${String(new Date(b.createdAt).getMonth() + 1).padStart(2, '0')}`;
    monthly[key] = (monthly[key] || 0) + (b.providerPayout || 0);
  });

  res.status(200).json({
    success: true,
    data: {
      totalEarnings,
      monthlyEarnings,
      completedJobs: bookings.length,
      monthlyBreakdown: Object.entries(monthly).map(([month, amount]) => ({ month, amount })),
      recentTransactions: bookings.slice(0, 10),
    },
  });
});

module.exports = {
  createBooking,
  getMyBookings,
  getProviderBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking,
  addReview,
  toggleAvailability,
  getProviderEarnings,
};
