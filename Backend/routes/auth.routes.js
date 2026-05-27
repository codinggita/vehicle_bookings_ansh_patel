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
router.post('/forgot-password', auth.forgotPassword);
router.post('/reset-password', auth.resetPassword);
router.post('/refresh-token', auth.refreshToken);

// Protected routes
router.get('/me', protect, auth.getMe);
router.delete('/account', protect, auth.deleteAccount);

module.exports = router;
