const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const bookingController = require('../controllers/booking.controller');

/**
 * @route   GET /protected/bookings
 * @desc    Get all bookings (authenticated users)
 * @access  Private
 */
router.get('/bookings', protect, bookingController.getAllBookings);

/**
 * @route   POST /protected/bookings
 * @desc    Create a new booking (authenticated users)
 * @access  Private
 */
router.post('/bookings', protect, bookingController.createBooking);

/**
 * @route   DELETE /protected/bookings/:bookingId
 * @desc    Delete a booking by bookingId (authenticated users)
 * @access  Private
 */
router.delete('/bookings/:bookingId', protect, bookingController.deleteBooking);

module.exports = router;
