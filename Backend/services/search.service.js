const Booking = require('../models/booking.model');

/**
 * Search across multiple fields using a keyword with case-insensitive regex
 * @param {string} keyword - The search keyword
 * @returns {Promise<Array>} Matching bookings
 */
const searchByKeyword = async (keyword) => {
  const regex = new RegExp(keyword, 'i');
  const results = await Booking.find({
    $or: [
      { pickupLocation: { $regex: regex } },
      { dropLocation: { $regex: regex } },
      { vehicleType: { $regex: regex } },
      { bookingStatus: { $regex: regex } },
      { paymentMethod: { $regex: regex } },
      { bookingId: { $regex: regex } },
      { customerId: { $regex: regex } }
    ]
  });
  return results;
};

/**
 * Find a booking by its bookingId
 * @param {string} bookingId - The booking ID to search for
 * @returns {Promise<Array>} Matching bookings
 */
const searchBookingById = async (bookingId) => {
  const results = await Booking.find({ bookingId });
  return results;
};

/**
 * Find all bookings for a specific customer
 * @param {string} customerId - The customer ID to search for
 * @returns {Promise<Array>} Matching bookings
 */
const searchCustomerById = async (customerId) => {
  const results = await Booking.find({ customerId });
  return results;
};

/**
 * Find bookings by payment method
 * @param {string} method - The payment method to search for
 * @returns {Promise<Array>} Matching bookings
 */
const searchByPaymentMethod = async (method) => {
  const results = await Booking.find({ paymentMethod: method });
  return results;
};

/**
 * Find bookings by vehicle type
 * @param {string} type - The vehicle type to search for
 * @returns {Promise<Array>} Matching bookings
 */
const searchByVehicleType = async (type) => {
  const results = await Booking.find({ vehicleType: type });
  return results;
};

/**
 * Find bookings by pickup location
 * @param {string} pickup - The pickup location to search for
 * @returns {Promise<Array>} Matching bookings
 */
const searchByPickupLocation = async (pickup) => {
  const results = await Booking.find({ pickupLocation: pickup });
  return results;
};

/**
 * Find bookings by drop location
 * @param {string} drop - The drop location to search for
 * @returns {Promise<Array>} Matching bookings
 */
const searchByDropLocation = async (drop) => {
  const results = await Booking.find({ dropLocation: drop });
  return results;
};

/**
 * Search cancel reasons across both customer and driver cancellation fields
 * @param {string} reason - The cancel reason to search for
 * @returns {Promise<Array>} Matching bookings
 */
const searchByCancelReason = async (reason) => {
  const regex = new RegExp(reason, 'i');
  const results = await Booking.find({
    $or: [
      { canceledRidesByCustomer: { $regex: regex } },
      { canceledRidesByDriver: { $regex: regex } }
    ]
  });
  return results;
};

/**
 * Search incomplete rides by reason
 * @param {string} reason - The incomplete ride reason to search for
 * @returns {Promise<Array>} Matching bookings
 */
const searchIncompleteReason = async (reason) => {
  const regex = new RegExp(reason, 'i');
  const results = await Booking.find({ incompleteRidesReason: { $regex: regex } });
  return results;
};

/**
 * Find bookings by driver rating
 * @param {string|number} rating - The driver rating to search for
 * @returns {Promise<Array>} Matching bookings
 */
const searchByDriverRating = async (rating) => {
  const results = await Booking.find({ driverRatings: parseFloat(rating) });
  return results;
};

/**
 * Find bookings by customer rating
 * @param {string|number} rating - The customer rating to search for
 * @returns {Promise<Array>} Matching bookings
 */
const searchByCustomerRating = async (rating) => {
  const results = await Booking.find({ customerRating: parseFloat(rating) });
  return results;
};

module.exports = {
  searchByKeyword,
  searchBookingById,
  searchCustomerById,
  searchByPaymentMethod,
  searchByVehicleType,
  searchByPickupLocation,
  searchByDropLocation,
  searchByCancelReason,
  searchIncompleteReason,
  searchByDriverRating,
  searchByCustomerRating
};
