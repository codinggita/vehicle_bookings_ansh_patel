const statsService = require('../services/stats.service');

/**
 * Async handler wrapper to catch errors and forward to Express error middleware
 * @param {Function} fn - Async route handler
 * @returns {Function} Wrapped handler
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * @desc    Get total number of bookings
 * @route   GET /stats/total-bookings
 */
const totalBookings = asyncHandler(async (req, res) => {
  const count = await statsService.getTotalBookings();
  res.status(200).json({ success: true, data: { totalBookings: count } });
});

/**
 * @desc    Get count of successful rides
 * @route   GET /stats/success-rides
 */
const successRides = asyncHandler(async (req, res) => {
  const count = await statsService.getSuccessRides();
  res.status(200).json({ success: true, data: { successRides: count } });
});

/**
 * @desc    Get count of cancelled rides
 * @route   GET /stats/cancelled-rides
 */
const cancelledRides = asyncHandler(async (req, res) => {
  const count = await statsService.getCancelledRides();
  res.status(200).json({ success: true, data: { cancelledRides: count } });
});

/**
 * @desc    Get count of incomplete rides
 * @route   GET /stats/incomplete-rides
 */
const incompleteRides = asyncHandler(async (req, res) => {
  const count = await statsService.getIncompleteRides();
  res.status(200).json({ success: true, data: { incompleteRides: count } });
});

/**
 * @desc    Get count of driver not found bookings
 * @route   GET /stats/driver-not-found
 */
const driverNotFound = asyncHandler(async (req, res) => {
  const count = await statsService.getDriverNotFound();
  res.status(200).json({ success: true, data: { driverNotFound: count } });
});

/**
 * @desc    Get total number of unique customers
 * @route   GET /stats/total-customers
 */
const totalCustomers = asyncHandler(async (req, res) => {
  const count = await statsService.getTotalCustomers();
  res.status(200).json({ success: true, data: { totalCustomers: count } });
});

/**
 * @desc    Get the most frequently booked vehicle type
 * @route   GET /stats/top-vehicle
 */
const topVehicle = asyncHandler(async (req, res) => {
  const result = await statsService.getTopVehicle();
  res.status(200).json({ success: true, data: result });
});

/**
 * @desc    Get the most frequently used payment method
 * @route   GET /stats/top-payment-method
 */
const topPaymentMethod = asyncHandler(async (req, res) => {
  const result = await statsService.getTopPaymentMethod();
  res.status(200).json({ success: true, data: result });
});

/**
 * @desc    Get the booking with the highest fare
 * @route   GET /stats/highest-fare
 */
const highestFare = asyncHandler(async (req, res) => {
  const result = await statsService.getHighestFare();
  res.status(200).json({ success: true, data: result });
});

/**
 * @desc    Get the booking with the lowest fare
 * @route   GET /stats/lowest-fare
 */
const lowestFare = asyncHandler(async (req, res) => {
  const result = await statsService.getLowestFare();
  res.status(200).json({ success: true, data: result });
});

/**
 * @desc    Get cancellation reasons and statistics
 * @route   GET /stats/cancellations
 */
const cancellationStats = asyncHandler(async (req, res) => {
  const result = await statsService.getCancellationStats();
  res.status(200).json({ success: true, data: result });
});

module.exports = {
  totalBookings,
  successRides,
  cancelledRides,
  incompleteRides,
  driverNotFound,
  totalCustomers,
  topVehicle,
  topPaymentMethod,
  highestFare,
  lowestFare,
  cancellationStats
};

