const asyncHandler = require('express-async-handler');
const Service = require('../models/Service');
const User = require('../models/User');

// @desc    Get all services (with search, filter, pagination)
// @route   GET /api/services
// @access  Public
const getServices = asyncHandler(async (req, res) => {
  const { search, category, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;

  const query = { isActive: true };

  // Search
  if (search) {
    query.$text = { $search: search };
  }

  // Filter by category
  if (category) {
    query.category = category;
  }

  // Filter by price range
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Sort options
  let sortOption = '-createdAt';
  if (sort === 'price_asc') sortOption = 'price';
  if (sort === 'price_desc') sortOption = '-price';
  if (sort === 'rating') sortOption = '-rating';
  if (sort === 'popular') sortOption = '-totalBookings';

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Service.countDocuments(query);

  const services = await Service.find(query)
    .populate('category', 'name icon')
    .populate('provider', 'name avatar providerProfile.rating')
    .sort(sortOption)
    .skip(skip)
    .limit(Number(limit));

  res.status(200).json({
    success: true,
    count: services.length,
    total,
    totalPages: Math.ceil(total / Number(limit)),
    currentPage: Number(page),
    data: services,
  });
});

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
const getService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id)
    .populate('category', 'name icon description')
    .populate('provider', 'name avatar phone providerProfile address');

  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  res.status(200).json({ success: true, data: service });
});

// @desc    Create service (Provider only)
// @route   POST /api/services
// @access  Private/Provider
const createService = asyncHandler(async (req, res) => {
  req.body.provider = req.user._id;

  const service = await Service.create(req.body);

  // Add service to provider's profile
  await User.findByIdAndUpdate(req.user._id, {
    $push: { 'providerProfile.servicesOffered': service._id },
  });

  const populatedService = await Service.findById(service._id)
    .populate('category', 'name icon')
    .populate('provider', 'name avatar');

  res.status(201).json({ success: true, data: populatedService });
});

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private/Provider (own service) or Admin
const updateService = asyncHandler(async (req, res) => {
  let service = await Service.findById(req.params.id);

  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  // Check ownership
  if (service.provider.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this service');
  }

  service = await Service.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate('category', 'name icon')
    .populate('provider', 'name avatar');

  res.status(200).json({ success: true, data: service });
});

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private/Provider (own) or Admin
const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  if (service.provider.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this service');
  }

  await service.deleteOne();

  res.status(200).json({ success: true, message: 'Service deleted successfully' });
});

// @desc    Get services by current provider
// @route   GET /api/services/my-services
// @access  Private/Provider
const getMyServices = asyncHandler(async (req, res) => {
  const services = await Service.find({ provider: req.user._id })
    .populate('category', 'name icon')
    .sort('-createdAt');

  res.status(200).json({ success: true, count: services.length, data: services });
});

// @desc    Get featured services
// @route   GET /api/services/featured
// @access  Public
const getFeaturedServices = asyncHandler(async (req, res) => {
  const services = await Service.find({ isActive: true })
    .populate('category', 'name icon')
    .populate('provider', 'name avatar')
    .sort('-rating -totalBookings')
    .limit(8);

  res.status(200).json({ success: true, data: services });
});

module.exports = {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  getMyServices,
  getFeaturedServices,
};
