const authService = require('../services/auth.service');

/**
 * @desc Wraps async route handlers to catch errors and forward to Express error handler
 * @param {Function} fn - Async route handler function
 * @returns {Function} Express middleware
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const { user, token } = await authService.registerUser(name, email, password);

  res.status(201).json({
    success: true,
    data: { user, token },
  });
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return token
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password',
    });
  }

  try {
    const { user, token } = await authService.loginUser(email, password);

    res.status(200).json({
      success: true,
      data: { user, token },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Public
 */
const logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email (placeholder)
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Password reset email sent',
  });
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset user password (placeholder)
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Password reset successful',
  });
});

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh JWT token
 * @access  Private
 */
const refreshToken = asyncHandler(async (req, res) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided',
    });
  }

  const decoded = authService.verifyToken(token);
  const user = await authService.getUserById(decoded.id);
  const newToken = authService.refreshToken(user);

  res.status(200).json({
    success: true,
    data: { token: newToken },
  });
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user profile
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

/**
 * @route   DELETE /api/auth/account
 * @desc    Delete current user's account
 * @access  Private
 */
const deleteAccount = asyncHandler(async (req, res) => {
  await authService.deleteUser(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully',
  });
});

/**
 * @route   GET /api/jwt/profile
 * @desc    Get user profile (JWT routes)
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

/**
 * @route   GET /api/jwt/dashboard
 * @desc    Get user dashboard
 * @access  Private
 */
const getDashboard = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Dashboard accessed',
    user: req.user,
  });
});

/**
 * @route   POST /api/jwt/generate-token
 * @desc    Generate a JWT token by logging in with credentials
 * @access  Public
 */
const generateJWTToken = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password',
    });
  }

  try {
    const { user, token } = await authService.loginUser(email, password);

    res.status(200).json({
      success: true,
      data: { token },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  }
});

/**
 * @route   POST /api/jwt/verify-token
 * @desc    Verify a JWT token and return decoded payload
 * @access  Public
 */
const verifyJWTToken = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a token',
    });
  }

  try {
    const decoded = authService.verifyToken(token);

    res.status(200).json({
      success: true,
      data: { decoded },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
});

/**
 * @route   GET /api/jwt/admin
 * @desc    Admin-only route
 * @access  Private (Admin)
 */
const getAdminRoute = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin access granted',
  });
});

/**
 * @route   GET /api/jwt/user
 * @desc    Authenticated user route
 * @access  Private
 */
const getUserRoute = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User access granted',
  });
});

module.exports = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  refreshToken,
  getMe,
  deleteAccount,
  getProfile,
  getDashboard,
  generateJWTToken,
  verifyJWTToken,
  getAdminRoute,
  getUserRoute,
};
