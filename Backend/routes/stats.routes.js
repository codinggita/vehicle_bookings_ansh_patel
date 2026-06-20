const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');

/**
 * @route   GET /stats/total-bookings
 * @desc    Get total number of bookings
 */
router.get('/total-bookings', statsController.totalBookings);

/**
 * @route   GET /stats/success-rides
 * @desc    Get count of successful rides
 */
router.get('/success-rides', statsController.successRides);

/**
 * @route   GET /stats/cancelled-rides
 * @desc    Get count of cancelled rides
 */
router.get('/cancelled-rides', statsController.cancelledRides);

/**
 * @route   GET /stats/incomplete-rides
 * @desc    Get count of incomplete rides
 */
router.get('/incomplete-rides', statsController.incompleteRides);

/**
 * @route   GET /stats/driver-not-found
 * @desc    Get count of driver not found bookings
 */
router.get('/driver-not-found', statsController.driverNotFound);

/**
 * @route   GET /stats/total-customers
 * @desc    Get total number of unique customers
 */
router.get('/total-customers', statsController.totalCustomers);

/**
 * @route   GET /stats/top-vehicle
 * @desc    Get the most frequently booked vehicle type
 */
router.get('/top-vehicle', statsController.topVehicle);

/**
 * @route   GET /stats/top-payment-method
 * @desc    Get the most frequently used payment method
 */
router.get('/top-payment-method', statsController.topPaymentMethod);

/**
 * @route   GET /stats/highest-fare
 * @desc    Get the booking with the highest fare
 */
router.get('/highest-fare', statsController.highestFare);

/**
 * @route   GET /stats/lowest-fare
 * @desc    Get the booking with the lowest fare
 */
router.get('/lowest-fare', statsController.lowestFare);

/**
 * @desc    Get cancellation stats and reasons
 */
router.get('/cancellations', statsController.cancellationStats);

module.exports = router;
