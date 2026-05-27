const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');

/**
 * @route   GET /search
 * @desc    Search bookings across multiple fields by keyword
 * @query   keyword - The search keyword
 */
router.get('/', searchController.searchKeyword);

/**
 * @route   GET /search/bookings
 * @desc    Search booking by bookingId
 * @query   bookingId - The booking ID to search for
 */
router.get('/bookings', searchController.searchBookingById);

/**
 * @route   GET /search/customers
 * @desc    Search bookings by customerId
 * @query   customerId - The customer ID to search for
 */
router.get('/customers', searchController.searchCustomerById);

/**
 * @route   GET /search/payment
 * @desc    Search bookings by payment method
 * @query   method - The payment method to search for
 */
router.get('/payment', searchController.searchPayment);

/**
 * @route   GET /search/vehicle
 * @desc    Search bookings by vehicle type
 * @query   type - The vehicle type to search for
 */
router.get('/vehicle', searchController.searchVehicle);

/**
 * @route   GET /search/location
 * @desc    Search bookings by pickup or drop location
 * @query   pickup - The pickup location to search for
 * @query   drop - The drop location to search for
 */
router.get('/location', searchController.searchLocation);

/**
 * @route   GET /search/cancel-reason
 * @desc    Search bookings by cancellation reason
 * @query   reason - The cancel reason to search for
 */
router.get('/cancel-reason', searchController.searchCancelReason);

/**
 * @route   GET /search/incomplete
 * @desc    Search bookings by incomplete ride reason
 * @query   reason - The incomplete ride reason to search for
 */
router.get('/incomplete', searchController.searchIncomplete);

/**
 * @route   GET /search/rating
 * @desc    Search bookings by driver or customer rating
 * @query   driver - The driver rating to search for
 * @query   customer - The customer rating to search for
 */
router.get('/rating', searchController.searchRating);

module.exports = router;
