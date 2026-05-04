const asyncHandler = require('express-async-handler');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

const sendSMS = require('../utils/sendSMS');
const sendEmail = require('../utils/sendEmail');

// ── Create booking ────────────────────────────────────────────────────────────
const createBooking = asyncHandler(async (req, res) => {
  const { 
    serviceId, scheduledDate, scheduledTime, address, notes, 
    paymentMethod, isUrgent, razorpayOrderId, razorpayPaymentId, 
    providerId, userLocation 
  } = req.body;

  if (req.user.role !== 'user' && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Expert accounts cannot book services. Please use a customer or admin account.');
  }

  const service = await Service.findById(serviceId).populate('provider', 'name');
  if (!service) { res.status(404); throw new Error('Service not found'); }
  if (!service.isActive) { res.status(400); throw new Error('This service is currently unavailable'); }

  // Platform fee: 10% of service price
  const platformFee = Math.round(service.price * 0.1);
  const providerPayout = service.price - platformFee;

  const booking = await Booking.create({
    user: req.user._id,
    provider: providerId || null,
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
    status: 'pending',
    userLocation: userLocation || null,
    paymentStatus: paymentMethod === 'online' ? 'paid' : 'pending',
    razorpayOrderId,
    razorpayPaymentId,
    timeline: [{ 
      status: 'pending', 
      note: providerId ? `Direct request sent to professional` : 'Booking broadcasted to nearby providers' 
    }],
  });

  // ── Notify Provider ──────────────────────────────────────────────────
  if (booking.provider) {
    const provider = await User.findById(booking.provider);
    if (provider) {
      // Internal Notification
      await createNotification({
        recipient: provider._id,
        type: 'new_booking',
        title: 'New Booking Request 📩',
        message: `You have a new booking request for ${service.title} from ${req.user.name}`,
        data: { bookingId: booking._id },
        icon: '📩'
      });

      // External Notifications (SMS & Email)
      sendSMS(provider.phone, `Fixit: New job request for ${service.title} from ${req.user.name}. View in dashboard.`);
      
      try {
        await sendEmail({
          email: provider.email,
          subject: 'New Job Request - Fixit',
          message: `Hi ${provider.name}, you have a new job request for ${service.title}.`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
              <h2 style="color: #6366f1;">New Job Request! 📩</h2>
              <p>Hi <strong>${provider.name}</strong>,</p>
              <p>You have received a new booking request from <strong>${req.user.name}</strong>.</p>
              <div style="background: #fdfdfd; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #f0f0f0;">
                <p style="margin: 0;"><strong>Service:</strong> ${service.title}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(scheduledDate).toLocaleDateString()}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${scheduledTime}</p>
                <p style="margin: 5px 0;"><strong>Location:</strong> ${address.street}, ${address.city}</p>
              </div>
              <p>Please login to your dashboard to accept or reject this request.</p>
              <a href="http://localhost:5173/provider/dashboard" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">View Dashboard</a>
            </div>
          `
        });
      } catch (err) {
        console.error('Provider email failed:', err.message);
      }
    }
  }

  await Service.findByIdAndUpdate(serviceId, { $inc: { totalBookings: 1 } });

  // Emit socket event to notify all providers
  const io = req.app.get('io');
  if (io) {
    io.emit('new_booking_broadcast', { bookingId: booking._id, service: service.title });
  }

  const populatedBooking = await Booking.findById(booking._id)
    .populate('service', 'title price image')
    .populate('user', 'name phone');

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

  const providerAllowed = { 
    pending: ['accepted', 'rejected'], 
    accepted: ['on_the_way', 'cancelled'], 
    on_the_way: ['arrived', 'cancelled'], 
    arrived: ['completed'] 
  };
  if (isProvider && !isAdmin) {
    const allowed = providerAllowed[booking.status];
    if (!allowed?.includes(status)) {
      res.status(400); throw new Error(`Cannot change status from '${booking.status}' to '${status}'`);
    }
  }

  booking.status = status;
  if (cancellationReason) booking.cancellationReason = cancellationReason;
  booking.timeline.push({ status, note: note || `Status updated to ${status.replace('_', ' ')}` });

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
    accepted:    { type: 'booking_accepted',  title: 'Booking Accepted ✅', icon: '✅', msg: `Expert is assigned for "${booking.service?.title}"!` },
    on_the_way:  { type: 'expert_on_way',     title: 'Expert On The Way 🛵', icon: '🛵', msg: `Your professional is heading towards your location.` },
    arrived:     { type: 'expert_arrived',    title: 'Expert Arrived 📍', icon: '📍', msg: `Your professional has arrived at the location.` },
    completed:   { type: 'booking_completed', title: 'Service Completed 🎉', icon: '🎉', msg: `"${booking.service?.title}" completed. Please leave a review!` },
    rejected:    { type: 'booking_rejected',  title: 'Booking Rejected ❌', icon: '❌', msg: `Your booking for "${booking.service?.title}" was rejected.` },
    cancelled:   { type: 'booking_cancelled', title: 'Booking Cancelled',   icon: '❌', msg: `Booking for "${booking.service?.title}" was cancelled.` },
  };

  if (notifMap[status]) {
    const n = notifMap[status];
    await createNotification({ recipient: booking.user, type: n.type, title: n.title, message: n.msg, data: { bookingId: booking._id }, icon: n.icon });
  }

  const updated = await Booking.findById(booking._id)
    .populate('service', 'title price image')
    .populate('provider', 'name phone avatar')
    .populate('user', 'name phone');

  // Emit socket event for real-time update
  const io = req.app.get('io');
  if (io) {
    io.to(booking._id.toString()).emit('status_updated', { 
      status: status, 
      bookingId: booking._id,
      note: note || `Status updated to ${status.replace('_', ' ')}`
    });
  }

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

// ── Get nearby unassigned bookings ──────────────────────────────────────────
const getNearbyBookings = asyncHandler(async (req, res) => {
  // Find bookings pending acceptance where no specific provider is assigned (broadcasts)
  const bookings = await Booking.find({ 
    status: 'pending',
    provider: null 
  })
    .populate('service', 'title price image category')
    .populate('user', 'name phone avatar address')
    .sort('-createdAt')
    .limit(50); // limit to recent

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings,
  });
});

// ── Accept broadcasted booking ──────────────────────────────────────────────
const acceptBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('user', 'name')
    .populate('service', 'title');

  if (!booking) { res.status(404); throw new Error('Booking not found'); }
  if (booking.status !== 'pending') {
    res.status(400); throw new Error('Booking is no longer available');
  }

  // Assign provider and update status
  booking.provider = req.user._id;
  booking.status = 'accepted';
  if (req.body.providerLocation) {
    booking.providerLocation = req.body.providerLocation;
  }
  booking.timeline.push({ status: 'accepted', note: `Accepted by provider ${req.user.name}` });
  await booking.save();

  // Notify User (Internal, SMS, Email)
  await createNotification({
    recipient: booking.user._id,
    type: 'booking_accepted',
    title: 'Provider Found! 🎉',
    message: `${req.user.name} has accepted your booking for "${booking.service.title}".`,
    data: { bookingId: booking._id },
    icon: '✅',
  });

  // Mock External Notifications
  const user = await User.findById(booking.user._id);
  if (user) {
    sendSMS(user.phone, `Fixit: ${req.user.name} has accepted your booking for ${booking.service.title}. Tracking link: http://fixit.com/tracking/${booking._id}`);
    
    // Real Email Notification
    try {
      await sendEmail({
        email: user.email,
        subject: 'Provider Found - Fixit',
        message: `Hi ${user.name}, ${req.user.name} is assigned to your booking. Check your dashboard for live tracking.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; borderRadius: 10px;">
            <h2 style="color: #6366f1;">Provider Found! 🎉</h2>
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>Great news! <strong>${req.user.name}</strong> has accepted your booking for <strong>${booking.service.title}</strong>.</p>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Scheduled For:</strong> ${new Date(booking.scheduledDate).toLocaleDateString()} at ${booking.scheduledTime}</p>
            </div>
            <p>You can track your professional in real-time on your dashboard.</p>
            <a href="http://localhost:5173/dashboard" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to Dashboard</a>
          </div>
        `
      });
    } catch (err) {
      console.error('Email failed:', err.message);
    }
  }

  // Emit socket event to specific user
  const io = req.app.get('io');
  if (io) {
    io.to(booking._id.toString()).emit('booking_accepted', { provider: req.user.name, bookingId: booking._id });
  }

  res.status(200).json({ success: true, message: 'Booking accepted', data: booking });
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
  getNearbyBookings,
  acceptBooking,
};
