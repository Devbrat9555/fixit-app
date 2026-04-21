const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'booking_created',
        'booking_confirmed',
        'booking_rejected',
        'booking_started',
        'booking_completed',
        'booking_cancelled',
        'provider_approved',
        'provider_rejected',
        'new_review',
        'payment_received',
        'system',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} }, // booking id, service id etc.
    isRead: { type: Boolean, default: false },
    icon: { type: String, default: '🔔' },
  },
  { timestamps: true }
);

// Auto-delete notifications older than 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 3600 });

module.exports = mongoose.model('Notification', notificationSchema);
