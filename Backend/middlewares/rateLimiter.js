const rateLimit = require('express-rate-limit');

/**
 * General rate limiter - 100 requests per 15 minutes
 * Applied to most API endpoints
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Auth rate limiter - 20 requests per 15 minutes
 * Applied to login/register endpoints to prevent brute force
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many authentication attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Search rate limiter - 50 requests per 15 minutes
 * Applied to search/filter endpoints
 */
const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { success: false, message: 'Too many search requests, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Admin rate limiter - 30 requests per 15 minutes
 * Applied to admin-specific endpoints
 */
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many admin requests, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Upload rate limiter - 10 requests per 15 minutes
 * Applied to file upload endpoints
 */
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many upload requests, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { generalLimiter, authLimiter, searchLimiter, adminLimiter, uploadLimiter };
