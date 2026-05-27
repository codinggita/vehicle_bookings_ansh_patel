const express = require('express');
const router = express.Router();
const auth = require('../controllers/auth.controller');
const { protect, authorize } = require('../middlewares/auth');

/**
 * @desc JWT routes for token management, profile, dashboard, and role-based access
 */

// Public routes (no protect needed)
router.post('/generate-token', auth.generateJWTToken);
router.post('/verify-token', auth.verifyJWTToken);

// Protected routes
router.get('/profile', protect, auth.getProfile);
router.get('/dashboard', protect, auth.getDashboard);
router.post('/refresh-token', protect, auth.refreshToken);
router.get('/admin', protect, authorize('admin'), auth.getAdminRoute);
router.get('/user', protect, auth.getUserRoute);
router.delete('/logout', protect, auth.logout);

module.exports = router;
