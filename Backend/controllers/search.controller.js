const searchService = require('../services/search.service');

/**
 * Async handler wrapper to catch errors and forward to Express error middleware
 * @param {Function} fn - Async route handler
 * @returns {Function} Wrapped handler
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * @desc    Search bookings across multiple fields by keyword
 * @route   GET /search?keyword=...
 */
const searchKeyword = asyncHandler(async (req, res) => {
  const results = await searchService.searchByKeyword(req.query.keyword);
  res.status(200).json({ success: true, count: results.length, data: results });
});

/**
 * @desc    Search booking by bookingId
 * @route   GET /search/bookings?bookingId=...
 */
const searchBookingById = asyncHandler(async (req, res) => {
  const results = await searchService.searchBookingById(req.query.bookingId);
  res.status(200).json({ success: true, count: results.length, data: results });
});

/**
 * @desc    Search bookings by customerId
 * @route   GET /search/customers?customerId=...
 */
const searchCustomerById = asyncHandler(async (req, res) => {
  const results = await searchService.searchCustomerById(req.query.customerId);
  res.status(200).json({ success: true, count: results.length, data: results });
});

/**
 * @desc    Search bookings by payment method
 * @route   GET /search/payment?method=...
 */
const searchPayment = asyncHandler(async (req, res) => {
  const results = await searchService.searchByPaymentMethod(req.query.method);
  res.status(200).json({ success: true, count: results.length, data: results });
});

/**
 * @desc    Search bookings by vehicle type
 * @route   GET /search/vehicle?type=...
 */
const searchVehicle = asyncHandler(async (req, res) => {
  const results = await searchService.searchByVehicleType(req.query.type);
  res.status(200).json({ success: true, count: results.length, data: results });
});

/**
 * @desc    Search bookings by pickup location
 * @route   GET /search/location?pickup=...
 */
const searchPickupLocation = asyncHandler(async (req, res) => {
  const results = await searchService.searchByPickupLocation(req.query.pickup);
  res.status(200).json({ success: true, count: results.length, data: results });
});

/**
 * @desc    Search bookings by drop location
 * @route   GET /search/location?drop=...
 */
const searchDropLocation = asyncHandler(async (req, res) => {
  const results = await searchService.searchByDropLocation(req.query.drop);
  res.status(200).json({ success: true, count: results.length, data: results });
});

/**
 * @desc    Search bookings by pickup or drop location (combined handler)
 * @route   GET /search/location?pickup=... OR GET /search/location?drop=...
 */
const searchLocation = asyncHandler(async (req, res) => {
  let results = [];
  if (req.query.pickup) {
    results = await searchService.searchByPickupLocation(req.query.pickup);
  } else if (req.query.drop) {
    results = await searchService.searchByDropLocation(req.query.drop);
  }
  res.status(200).json({ success: true, count: results.length, data: results });
});

/**
 * @desc    Search bookings by cancellation reason
 * @route   GET /search/cancel-reason?reason=...
 */
const searchCancelReason = asyncHandler(async (req, res) => {
  const results = await searchService.searchByCancelReason(req.query.reason);
  res.status(200).json({ success: true, count: results.length, data: results });
});

/**
 * @desc    Search bookings by incomplete ride reason
 * @route   GET /search/incomplete?reason=...
 */
const searchIncomplete = asyncHandler(async (req, res) => {
  const results = await searchService.searchIncompleteReason(req.query.reason);
  res.status(200).json({ success: true, count: results.length, data: results });
});

/**
 * @desc    Search bookings by driver rating
 * @route   GET /search/rating?driver=...
 */
const searchDriverRating = asyncHandler(async (req, res) => {
  const results = await searchService.searchByDriverRating(req.query.driver);
  res.status(200).json({ success: true, count: results.length, data: results });
});

/**
 * @desc    Search bookings by customer rating
 * @route   GET /search/rating?customer=...
 */
const searchCustomerRating = asyncHandler(async (req, res) => {
  const results = await searchService.searchByCustomerRating(req.query.customer);
  res.status(200).json({ success: true, count: results.length, data: results });
});

/**
 * @desc    Search bookings by driver or customer rating (combined handler)
 * @route   GET /search/rating?driver=... OR GET /search/rating?customer=...
 */
const searchRating = asyncHandler(async (req, res) => {
  let results = [];
  if (req.query.driver) {
    results = await searchService.searchByDriverRating(req.query.driver);
  } else if (req.query.customer) {
    results = await searchService.searchByCustomerRating(req.query.customer);
  }
  res.status(200).json({ success: true, count: results.length, data: results });
});

module.exports = {
  searchKeyword,
  searchBookingById,
  searchCustomerById,
  searchPayment,
  searchVehicle,
  searchPickupLocation,
  searchDropLocation,
  searchLocation,
  searchCancelReason,
  searchIncomplete,
  searchDriverRating,
  searchCustomerRating,
  searchRating
};
