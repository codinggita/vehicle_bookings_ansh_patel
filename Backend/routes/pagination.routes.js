const express = require('express');
const router = express.Router();
const paginationController = require('../controllers/pagination.controller');

/**
 * @route   GET /api/customers
 * @desc    Get all customers aggregated from bookings
 */
router.get('/customers', paginationController.getCustomers);

/**
 * @route   GET /api/vehicles
 * @desc    Get all vehicle types aggregated from bookings
 */
router.get('/vehicles', paginationController.getVehicles);

/**
 * @route   GET /api/success-rides
 * @desc    Get all successful rides
 */
router.get('/success-rides', paginationController.getSuccessRides);

/**
 * @route   GET /api/cancelled-rides
 * @desc    Get all cancelled rides
 */
router.get('/cancelled-rides', paginationController.getCancelledRides);

/**
 * @route   GET /api/incomplete-rides
 * @desc    Get all incomplete rides
 */
router.get('/incomplete-rides', paginationController.getIncompleteRides);

/**
 * @route   GET /api/ratings
 * @desc    Get all bookings with ratings data
 */
router.get('/ratings', paginationController.getRatings);

/**
 * @route   GET /api/payments
 * @desc    Get payment methods aggregated from bookings
 */
router.get('/payments', paginationController.getPayments);

module.exports = router;
