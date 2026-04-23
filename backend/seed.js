const mongoose = require('mongoose');
const Category = require('./models/Category');
const Service = require('./models/Service');
const User = require('./models/User');
require('dotenv').config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB for seeding...');

    // Clear existing
    await Category.deleteMany();
    await Service.deleteMany();

    const categories = await Category.insertMany([
      { name: 'Electrical', icon: '⚡', description: 'Electricians for your home' },
      { name: 'Plumbing', icon: '🔧', description: 'Plumbers for leaks and repairs' },
      { name: 'Cleaning', icon: '🧹', description: 'Deep cleaning for houses' },
      { name: 'Painting', icon: '🎨', description: 'Home painting services' },
      { name: 'AC Repair', icon: '❄️', description: 'Air conditioning maintenance' },
    ]);

    console.log('Categories seeded!');

    // Find an existing provider or create a dummy one
    let provider = await User.findOne({ role: 'provider' });
    if (!provider) {
      provider = await User.findOne({ role: 'user' }); // Fallback to any user
    }

    if (provider) {
      await Service.insertMany([
        {
          title: 'Full House Deep Cleaning',
          description: 'Thorough cleaning of all rooms, bathrooms and kitchen.',
          category: categories[2]._id,
          provider: provider._id,
          price: 2499,
          priceType: 'fixed',
          duration: 240,
          isActive: true,
          rating: 4.8,
          totalRatings: 120,
        },
        {
          title: 'AC Gas Charging',
          description: 'Complete gas refill and leak testing for 1.5 ton AC.',
          category: categories[4]._id,
          provider: provider._id,
          price: 1500,
          priceType: 'fixed',
          duration: 60,
          isActive: true,
          rating: 4.5,
          totalRatings: 85,
        },
        {
          title: 'Emergency Plumbing Repair',
          description: 'Fixing burst pipes, major leaks and clogged drains.',
          category: categories[1]._id,
          provider: provider._id,
          price: 499,
          priceType: 'starting_from',
          duration: 45,
          isActive: true,
          rating: 4.9,
          totalRatings: 210,
        }
      ]);
      console.log('Services seeded!');
    } else {
      console.log('No provider found to link services. Create a provider first.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
