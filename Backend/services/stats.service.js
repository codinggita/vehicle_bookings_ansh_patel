const Booking = require('../models/booking.model');

/**
 * Get total number of bookings
 * @returns {Promise<number>} Total booking count
 */
const getTotalBookings = async () => {
  const count = await Booking.countDocuments();
  return count;
};

/**
 * Get count of successful rides
 * @returns {Promise<number>} Success ride count
 */
const getSuccessRides = async () => {
  const count = await Booking.countDocuments({ bookingStatus: 'Success' });
  return count;
};

/**
 * Get count of cancelled rides (by driver or customer)
 * @returns {Promise<number>} Cancelled ride count
 */
const getCancelledRides = async () => {
  const count = await Booking.countDocuments({
    $or: [
      { bookingStatus: 'Canceled by Driver' },
      { bookingStatus: 'Canceled by Customer' }
    ]
  });
  return count;
};

/**
 * Get count of incomplete rides
 * @returns {Promise<number>} Incomplete ride count
 */
const getIncompleteRides = async () => {
  const count = await Booking.countDocuments({ incompleteRides: 'Yes' });
  return count;
};

/**
 * Get count of rides where driver was not found
 * @returns {Promise<number>} Driver not found count
 */
const getDriverNotFound = async () => {
  const count = await Booking.countDocuments({ bookingStatus: 'Driver Not Found' });
  return count;
};

/**
 * Get total number of unique customers
 * @returns {Promise<number>} Unique customer count
 */
const getTotalCustomers = async () => {
  const result = await Booking.aggregate([
    { $group: { _id: '$customerId' } },
    { $count: 'totalCustomers' }
  ]);
  return result.length > 0 ? result[0].totalCustomers : 0;
};

/**
 * Get the most frequently booked vehicle type
 * @returns {Promise<Object>} Top vehicle type with count
 */
const getTopVehicle = async () => {
  const result = await Booking.aggregate([
    { $group: { _id: '$vehicleType', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 },
    { $project: { _id: 0, vehicleType: '$_id', count: '$count', totalBookings: '$count' } }
  ]);
  return result.length > 0 ? result[0] : null;
};

/**
 * Get the most frequently used payment method
 * @returns {Promise<Object>} Top payment method with count
 */
const getTopPaymentMethod = async () => {
  const result = await Booking.aggregate([
    { $match: { paymentMethod: { $ne: null } } },
    { $group: { _id: '$paymentMethod', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 },
    { $project: { _id: 0, paymentMethod: '$_id', count: '$count', totalBookings: '$count' } }
  ]);
  return result.length > 0 ? result[0] : null;
};

/**
 * Get the booking with the highest fare
 * @returns {Promise<Object>} Booking with highest bookingValue
 */
const getHighestFare = async () => {
  const result = await Booking.findOne().sort({ bookingValue: -1 });
  return result;
};

/**
 * Get the booking with the lowest fare (where bookingValue > 0)
 * @returns {Promise<Object>} Booking with lowest positive bookingValue
 */
const getLowestFare = async () => {
  const result = await Booking.findOne({ bookingValue: { $gt: 0 } }).sort({ bookingValue: 1 });
  return result;
};

/**
 * Get cancellation and incomplete reasons statistics
 * @returns {Promise<Object>} Object containing customer cancels, driver cancels, and incomplete stats
 */
const getCancellationStats = async () => {
  const customerCancel = await Booking.aggregate([
    { $match: { canceledRidesByCustomer: { $ne: null } } },
    { $group: { _id: '$canceledRidesByCustomer', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const driverCancel = await Booking.aggregate([
    { $match: { canceledRidesByDriver: { $ne: null } } },
    { $group: { _id: '$canceledRidesByDriver', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const incomplete = await Booking.aggregate([
    { $match: { incompleteRidesReason: { $ne: null } } },
    { $group: { _id: '$incompleteRidesReason', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  return { customerCancel, driverCancel, incomplete };
};

module.exports = {
  getTotalBookings,
  getSuccessRides,
  getCancelledRides,
  getIncompleteRides,
  getDriverNotFound,
  getTotalCustomers,
  getTopVehicle,
  getTopPaymentMethod,
  getHighestFare,
  getLowestFare,
  getCancellationStats
};

