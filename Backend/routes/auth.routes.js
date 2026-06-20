const express = require('express');
const router = express.Router();
const auth = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth');

/**
 * @desc Auth routes for user registration, login, and account management
 */

// Public routes
router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/logout', auth.logout);
router.post('/refresh-token', auth.refreshToken);

// Protected routes
router.get('/me', protect, auth.getMe);
router.put('/profile', protect, auth.updateProfile);
router.put('/change-password', protect, auth.changePassword);
router.delete('/account', protect, auth.deleteAccount);

// Admin-only user management routes
const { authorize } = require('../middlewares/auth');
router.get('/users', protect, authorize('admin'), auth.getUsers);
router.post('/users', protect, authorize('admin'), auth.createUserAdmin);
router.put('/users/:id', protect, authorize('admin'), auth.updateUserAdmin);
router.delete('/users/:id', protect, authorize('admin'), auth.deleteUserAdmin);

module.exports = router;

