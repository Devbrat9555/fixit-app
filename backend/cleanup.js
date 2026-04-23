const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const dotenv = require('dotenv');
const User = require('./models/User');
const Booking = require('./models/Booking');
const Service = require('./models/Service');
const Category = require('./models/Category');
const Notification = require('./models/Notification');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const cleanup = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { family: 4 });
    console.log('Connected to MongoDB for cleanup...');

    // Clear collections
    await User.deleteMany({});
    await Booking.deleteMany({});
    await Service.deleteMany({});
    await Category.deleteMany({});
    await Notification.deleteMany({});
    console.log('All collections cleared.');

    // Create Admin User
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@fixit.com',
      password: 'adminpassword123',
      role: 'admin',
      isApproved: true,
      hasFinishedSetup: true,
      phone: '9876543210'
    });

    console.log('Admin user created:');
    console.log('Email: admin@fixit.com');
    console.log('Password: adminpassword123');

    process.exit();
  } catch (err) {
    console.error('Cleanup failed:', err);
    process.exit(1);
  }
};

cleanup();
