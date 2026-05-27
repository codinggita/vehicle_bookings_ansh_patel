const Booking = require('../models/booking.model');

/**
 * Async handler wrapper to catch errors in async route handlers
 */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/**
 * @desc    Get all customers aggregated from bookings with pagination
 * @route   GET /api/customers
 * @access  Public
 */
const getCustomers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const [results, totalCount] = await Promise.all([
    Booking.aggregate([
      { $group: { _id: '$customerId', totalBookings: { $sum: 1 } } },
      { $sort: { totalBookings: -1 } },
      { $skip: skip },
      { $limit: limit },
      { $project: { _id: 0, customerId: '$_id', totalBookings: 1 } },
    ]),
    Booking.aggregate([
      { $group: { _id: '$customerId' } },
      { $count: 'total' },
    ]),
  ]);

  const total = totalCount.length > 0 ? totalCount[0].total : 0;

  res.status(200).json({
    success: true,
    count: results.length,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: results,
  });
});

/**
 * @desc    Get all vehicle types aggregated from bookings with pagination
 * @route   GET /api/vehicles
 * @access  Public
 */
const getVehicles = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const [results, totalCount] = await Promise.all([
    Booking.aggregate([
      { $group: { _id: '$vehicleType', totalBookings: { $sum: 1 } } },
      { $sort: { totalBookings: -1 } },
      { $skip: skip },
      { $limit: limit },
      { $project: { _id: 0, vehicleType: '$_id', totalBookings: 1 } },
    ]),
    Booking.aggregate([
      { $group: { _id: '$vehicleType' } },
      { $count: 'total' },
    ]),
  ]);

  const total = totalCount.length > 0 ? totalCount[0].total : 0;

  res.status(200).json({
    success: true,
    count: results.length,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: results,
  });
});

/**
 * @desc    Get all successful rides with pagination
 * @route   GET /api/success-rides
 * @access  Public
 */
const getSuccessRides = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = { bookingStatus: 'Success' };

  const [data, total] = await Promise.all([
    Booking.find(filter).skip(skip).limit(limit).lean(),
    Booking.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: data.length,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data,
  });
});

/**
 * @desc    Get all cancelled rides with pagination
 * @route   GET /api/cancelled-rides
 * @access  Public
 */
const getCancelledRides = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = { bookingStatus: { $in: ['Canceled by Driver', 'Canceled by Customer'] } };

  const [data, total] = await Promise.all([
    Booking.find(filter).skip(skip).limit(limit).lean(),
    Booking.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: data.length,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data,
  });
});

/**
 * @desc    Get all incomplete rides with pagination
 * @route   GET /api/incomplete-rides
 * @access  Public
 */
const getIncompleteRides = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = { incompleteRides: 'Yes' };

  const [data, total] = await Promise.all([
    Booking.find(filter).skip(skip).limit(limit).lean(),
    Booking.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: data.length,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data,
  });
});

/**
 * @desc    Get all bookings with driver ratings (non-null) with pagination
 * @route   GET /api/ratings
 * @access  Public
 */
const getRatings = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = { driverRatings: { $ne: null } };

  const [data, total] = await Promise.all([
    Booking.find(filter)
      .select('bookingId customerId vehicleType driverRatings customerRating bookingStatus')
      .skip(skip)
      .limit(limit)
      .lean(),
    Booking.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: data.length,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data,
  });
});

/**
 * @desc    Get payment methods aggregated from bookings with pagination
 * @route   GET /api/payments
 * @access  Public
 */
const getPayments = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const [results, totalCount] = await Promise.all([
    Booking.aggregate([
      { $match: { paymentMethod: { $ne: null } } },
      { $group: { _id: '$paymentMethod', totalBookings: { $sum: 1 }, totalValue: { $sum: '$bookingValue' } } },
      { $sort: { totalBookings: -1 } },
      { $skip: skip },
      { $limit: limit },
      { $project: { _id: 0, paymentMethod: '$_id', totalBookings: 1, totalValue: 1 } },
    ]),
    Booking.aggregate([
      { $match: { paymentMethod: { $ne: null } } },
      { $group: { _id: '$paymentMethod' } },
      { $count: 'total' },
    ]),
  ]);

  const total = totalCount.length > 0 ? totalCount[0].total : 0;

  res.status(200).json({
    success: true,
    count: results.length,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: results,
  });
});

/**
 * @desc    Get all bookings for admin with pagination (larger default limit)
 * @route   GET /admin/bookings
 * @access  Private/Admin
 */
const getAdminBookings = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Booking.find().skip(skip).limit(limit).lean(),
    Booking.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    count: data.length,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data,
  });
});

module.exports = {
  getCustomers,
  getVehicles,
  getSuccessRides,
  getCancelledRides,
  getIncompleteRides,
  getRatings,
  getPayments,
  getAdminBookings,
};
