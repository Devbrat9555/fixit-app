const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Category = require('./models/Category');
const Service = require('./models/Service');
const Booking = require('./models/Booking');
const Notification = require('./models/Notification');
const connectDB = require('./config/db');

const categories = [
  { name: 'Electrical', description: 'Wiring, repair, installation & panel setup', icon: '⚡', image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600' },
  { name: 'Plumbing', description: 'Leak fix, pipe fitting & bathroom installation', icon: '🔧', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600' },
  { name: 'Cleaning', description: 'Deep cleaning, sofa, carpet & kitchen cleaning', icon: '🧹', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600' },
  { name: 'Painting', description: 'Interior, exterior & waterproofing painting', icon: '🎨', image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600' },
  { name: 'Carpentry', description: 'Furniture assembly, repair & custom woodwork', icon: '🪚', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600' },
  { name: 'AC & Appliances', description: 'AC service, refrigerator & washing machine repair', icon: '❄️', image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600' },
  { name: 'Pest Control', description: 'Cockroach, termite, rat & bed bug treatment', icon: '🐛', image: 'https://images.unsplash.com/photo-1604594849809-dfedbc827105?w=600' },
  { name: 'Gardening', description: 'Lawn care, landscaping & plant maintenance', icon: '🌿', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600' },
];

const seed = async () => {
  try {
    await connectDB();
    console.log('\n🌱 Seeding database...\n');

    await User.deleteMany({});
    await Category.deleteMany({});
    await Service.deleteMany({});
    await Booking.deleteMany({});
    await Notification.deleteMany({});
    console.log('🗑️  Cleared all collections');

    const cats = await Category.insertMany(categories);
    console.log(`✅ ${cats.length} categories`);

    // Admin
    const admin = await User.create({
      name: 'Admin Fixit', email: 'admin@fixit.com', password: 'admin123',
      role: 'admin', phone: '9999999999', isApproved: true,
    });

    // Customer
    const customer = await User.create({
      name: 'Rahul Sharma', email: 'user@fixit.com', password: 'user1234',
      role: 'user', phone: '9876543210', isApproved: true,
      address: { street: '12 MG Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
    });

    // Providers
    const providerData = [
      { name: 'Ramesh Kumar', email: 'ramesh@fixit.com', bio: '8+ yrs expert electrician. Wiring, MCB, fan installation specialist.', exp: 8, rating: 4.7, ratings: 134, city: 'Mumbai', earnings: 85000, jobs: 134, cat: 'Electrical', online: true },
      { name: 'Suresh Patel', email: 'suresh@fixit.com', bio: 'Professional plumber. Specializes in bathroom renovation & pipe fitting.', exp: 6, rating: 4.4, ratings: 89, city: 'Mumbai', earnings: 62000, jobs: 89, cat: 'Plumbing', online: false },
      { name: 'Priya Verma', email: 'priya@fixit.com', bio: 'Home & office cleaning specialist. Eco-friendly products. Trained staff team.', exp: 4, rating: 4.9, ratings: 212, city: 'Mumbai', earnings: 124000, jobs: 212, cat: 'Cleaning', online: true },
      { name: 'Arjun Singh', email: 'arjun@fixit.com', bio: 'Interior & exterior painter. Quality Asian Paints work guaranteed.', exp: 5, rating: 4.5, ratings: 67, city: 'Delhi', earnings: 48000, jobs: 67, cat: 'Painting', online: true },
      { name: 'Mohan Das', email: 'mohan@fixit.com', bio: 'AC service expert. All brands. Annual maintenance contracts available.', exp: 7, rating: 4.6, ratings: 156, city: 'Bangalore', earnings: 95000, jobs: 156, cat: 'AC & Appliances', online: false },
    ];

    const providers = [];
    for (const p of providerData) {
      const catDoc = cats.find(c => c.name === p.cat);
      const prov = await User.create({
        name: p.name, email: p.email, password: 'provider123',
        role: 'provider', phone: `98${Math.floor(10000000 + Math.random() * 89999999)}`,
        isApproved: true,
        address: { city: p.city, state: 'Maharashtra', pincode: '400001' },
        providerProfile: {
          bio: p.bio, experience: p.exp, rating: p.rating,
          totalRatings: p.ratings, isOnline: p.online, isVerified: true,
          serviceArea: { city: p.city, radius: 15 },
          totalEarnings: p.earnings, completedJobs: p.jobs,
        },
      });
      providers.push({ doc: prov, cat: catDoc });
    }
    console.log(`✅ ${providers.length} providers`);

    // Services
    const elCat   = cats.find(c => c.name === 'Electrical');
    const plCat   = cats.find(c => c.name === 'Plumbing');
    const clCat   = cats.find(c => c.name === 'Cleaning');
    const paCat   = cats.find(c => c.name === 'Painting');
    const acCat   = cats.find(c => c.name === 'AC & Appliances');
    const pesCat  = cats.find(c => c.name === 'Pest Control');

    const rKumar = providers[0].doc;
    const sPatel = providers[1].doc;
    const pVerma = providers[2].doc;
    const asingh = providers[3].doc;
    const mDas   = providers[4].doc;

    const services = await Service.insertMany([
      { title: 'Full Home Electrical Wiring', description: 'Complete electrical wiring for new homes & renovations. Includes MCB panel, fan/light points, socket installation. 1-year warranty on work.', category: elCat._id, provider: rKumar._id, price: 2500, priceType: 'starting_from', duration: 240, rating: 4.7, totalRatings: 89, totalBookings: 134, image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600', tags: ['wiring', 'electrical', 'MCB', 'panel'] },
      { title: 'Switch & Socket Repair', description: 'Quick replacement of faulty switches, sockets, MCB breakers. Same-day service. All brands available.', category: elCat._id, provider: rKumar._id, price: 350, priceType: 'fixed', duration: 60, rating: 4.8, totalRatings: 112, totalBookings: 210, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600', tags: ['switch', 'socket', 'repair', 'quick'] },
      { title: 'Bathroom Plumbing Fix', description: 'Fix leaky taps, blocked drains, faulty flush tanks. Transparent pricing. Clean & professional work.', category: plCat._id, provider: sPatel._id, price: 499, priceType: 'starting_from', duration: 90, rating: 4.4, totalRatings: 78, totalBookings: 89, image: 'https://images.unsplash.com/photo-1603796846097-bee99e4a601f?w=600', tags: ['plumbing', 'bathroom', 'leak', 'drain'] },
      { title: 'Full Home Deep Cleaning', description: 'Thorough cleaning of all rooms, kitchen, bathrooms, balconies. Professional equipment, eco-friendly products. Includes scrubbing, mopping, dusting.', category: clCat._id, provider: pVerma._id, price: 1499, priceType: 'starting_from', duration: 300, rating: 4.9, totalRatings: 156, totalBookings: 212, image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600', tags: ['cleaning', 'deep clean', 'home', 'eco'] },
      { title: 'Kitchen Deep Cleaning', description: 'Specialized kitchen cleaning: chimney, stove, countertops, sink. Removes stubborn grease and grime. Before-after guarantee.', category: clCat._id, provider: pVerma._id, price: 799, priceType: 'fixed', duration: 120, rating: 4.9, totalRatings: 98, totalBookings: 145, image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600', tags: ['kitchen', 'chimney', 'cleaning'] },
      { title: '2BHK Interior Painting', description: 'Complete interior painting for 2BHK. Wall prep, primer coat, 2 coats Asian Paints Royale. Neat masking. Furniture protection included.', category: paCat._id, provider: asingh._id, price: 8999, priceType: 'starting_from', duration: 1440, rating: 4.5, totalRatings: 45, totalBookings: 67, image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600', tags: ['painting', 'interior', '2BHK', 'Asian Paints'] },
      { title: 'AC Service & Cleaning', description: 'Complete AC service: filter cleaning, gas top-up check, coil cleaning, performance test. All brands. Annual contract available.', category: acCat._id, provider: mDas._id, price: 599, priceType: 'fixed', duration: 90, rating: 4.6, totalRatings: 134, totalBookings: 156, image: 'https://images.unsplash.com/photo-1631545807034-528a7af5c3c8?w=600', tags: ['AC', 'service', 'cleaning', 'all brands'] },
      { title: 'Cockroach Control Treatment', description: 'Gel-based cockroach treatment. Safe for family & pets. Effective for 3 months. Re-treatment guarantee if needed.', category: pesCat._id, provider: rKumar._id, price: 699, priceType: 'fixed', duration: 60, rating: 4.3, totalRatings: 67, totalBookings: 89, image: 'https://images.unsplash.com/photo-1604594849809-dfedbc827105?w=600', tags: ['pest control', 'cockroach', 'safe', 'gel'] },
    ]);
    console.log(`✅ ${services.length} services`);

    // Sample booking
    await Booking.create({
      user: customer._id, provider: rKumar._id, service: services[0]._id,
      scheduledDate: new Date(Date.now() + 2 * 24 * 3600 * 1000),
      scheduledTime: '10:00 AM',
      address: { street: '12 MG Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
      status: 'confirmed', totalAmount: 2500, providerPayout: 2250, platformFee: 250,
      paymentMethod: 'cash',
      timeline: [
        { status: 'pending', note: 'Booking created' },
        { status: 'confirmed', note: 'Provider accepted' },
      ],
    });
    console.log(`✅ 1 sample booking`);

    console.log('\n🎉 Seed complete!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Demo Credentials:');
    console.log('  👑 Admin:    admin@fixit.com   / admin123');
    console.log('  👤 User:     user@fixit.com    / user1234');
    console.log('  🔧 Provider: ramesh@fixit.com  / provider123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    process.exit(0);
  } catch (e) {
    console.error('❌ Seed error:', e);
    process.exit(1);
  }
};

seed();
