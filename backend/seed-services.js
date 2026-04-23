const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Service = require('./models/Service');
const Category = require('./models/Category');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config();

const categoriesToEnsure = [
  { name: 'Electrical', icon: '⚡' },
  { name: 'Plumbing', icon: '🔧' },
  { name: 'Cleaning', icon: '🧹' },
  { name: 'Painting', icon: '🎨' },
  { name: 'Carpentry', icon: '🪚' },
  { name: 'AC Maintenance', icon: '❄️' },
  { name: 'Pest Control', icon: '🐜' },
  { name: 'Appliance Repair', icon: '⚙️' },
  { name: 'Salon at Home', icon: '💇' },
  { name: 'Massage Therapy', icon: '💆' },
  { name: 'Home Automation', icon: '🏠' }
];

const skillToCategoryMap = {
  'Electrician': 'Electrical',
  'AC Repair': 'AC Maintenance',
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB...');

    // 1. Ensure categories exist
    for (const cat of categoriesToEnsure) {
      const existing = await Category.findOne({ name: cat.name });
      if (!existing) {
        await Category.create(cat);
        console.log(`Created category: ${cat.name}`);
      }
    }

    const provider = await User.findOne({ email: 'devbrat2022@gmail.com' });
    if (!provider) {
      console.log('Provider devbrat2022@gmail.com not found.');
      process.exit(1);
    }

    console.log(`Found provider: ${provider.name} (${provider._id})`);
    const skills = provider.providerProfile.skills || [];

    for (const skill of skills) {
      const categoryName = skillToCategoryMap[skill] || skill;
      const category = await Category.findOne({ name: { $regex: new RegExp(`^${categoryName}$`, 'i') } });

      if (!category) {
        console.log(`No category found for skill: ${skill} (mapped to ${categoryName}). Skipping...`);
        continue;
      }

      const existing = await Service.findOne({ provider: provider._id, category: category._id });
      if (existing) {
        console.log(`Service already exists for ${skill}.`);
        continue;
      }

      const service = await Service.create({
        title: `Premium ${skill} Expert`,
        description: `Elite ${skill} solutions by our gold-certified professional ${provider.name}. Guaranteed satisfaction and luxury precision.`,
        category: category._id,
        provider: provider._id,
        price: 499 + Math.floor(Math.random() * 1000),
        duration: 60,
        isUrgent: false,
      });

      console.log(`Created service: ${service.title}`);
      provider.providerProfile.servicesOffered.push(service._id);
    }

    await provider.save();
    console.log('Seeding completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
