const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

const timelineSchema = new mongoose.Schema({
  status: String,
  timestamp: { type: Date, default: Date.now },
  note: String,
});

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },

    scheduledDate: { type: Date, required: [true, 'Scheduled date is required'] },
    scheduledTime: { type: String, required: [true, 'Scheduled time is required'] },

    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected'],
      default: 'pending',
    },

    // Status timeline for tracking
    timeline: [timelineSchema],

    totalAmount: { type: Number, required: true },

    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'online'],
      default: 'cash',
    },

    notes: { type: String, maxlength: 500 },
    cancellationReason: String,

    // OTP for job start verification
    startOtp: { type: String, select: false },
    otpVerified: { type: Boolean, default: false },

    // Priority
    isUrgent: { type: Boolean, default: false },

    review: reviewSchema,

    // Payment gateway
    razorpayOrderId: String,
    razorpayPaymentId: String,

    // Provider payout
    providerPayout: { type: Number, default: 0 },
    platformFee: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto-push to timeline on status change
bookingSchema.pre('save', function () {
  if (this.isModified('status')) {
    this.timeline.push({ status: this.status });
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
