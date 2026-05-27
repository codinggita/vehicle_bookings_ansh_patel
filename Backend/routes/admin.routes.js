const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const paginationController = require('../controllers/pagination.controller');
const bookingController = require('../controllers/booking.controller');

/**
 * @route   GET /admin/bookings
 * @desc    Get all bookings with admin-level pagination (default limit=50)
 * @access  Private
 */
router.get('/bookings', protect, paginationController.getAdminBookings);

/**
 * @route   POST /admin/bookings
 * @desc    Create a new booking (admin only)
 * @access  Private/Admin
 */
router.post('/bookings', protect, authorize('admin'), bookingController.createBooking);

/**
 * @route   DELETE /admin/bookings/:bookingId
 * @desc    Delete a booking by bookingId (admin only)
 * @access  Private/Admin
 */
router.delete('/bookings/:bookingId', protect, authorize('admin'), bookingController.deleteBooking);

/**
 * @route   PATCH /admin/bookings/:bookingId
 * @desc    Update/replace a booking by bookingId (admin only)
 * @access  Private/Admin
 */
router.patch('/bookings/:bookingId', protect, authorize('admin'), bookingController.replaceBooking);

/**
 * @route   GET /admin/dashboard
 * @desc    Get admin dashboard info
 * @access  Private/Admin
 */
router.get('/dashboard', protect, authorize('admin'), (req, res) => {
  res.status(200).json({ success: true, message: 'Admin dashboard', user: req.user });
});

module.exports = router;
