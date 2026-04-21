const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    phone: {
      type: String,
      match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number'],
    },
    role: {
      type: String,
      enum: ['user', 'provider', 'admin'],
      default: 'user',
    },
    avatar: { type: String, default: '' },

    // Address (shared by user and provider)
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },

    isApproved: {
      type: Boolean,
      default: function () {
        return this.role !== 'provider';
      },
    },
    isActive: { type: Boolean, default: true },

    // ── Provider-specific fields ──────────────────────────────────────────────
    providerProfile: {
      bio: { type: String, maxlength: 500 },
      experience: { type: Number, default: 0 },
      rating: { type: Number, default: 0, min: 0, max: 5 },
      totalRatings: { type: Number, default: 0 },
      servicesOffered: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],

      // Availability
      isOnline: { type: Boolean, default: false },
      serviceArea: {
        city: String,
        radius: { type: Number, default: 20 }, // km
      },

      // Earnings
      totalEarnings: { type: Number, default: 0 },
      pendingEarnings: { type: Number, default: 0 },
      withdrawnEarnings: { type: Number, default: 0 },

      // Verification
      isVerified: { type: Boolean, default: false },
      verificationDocs: [String],
      completedJobs: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
