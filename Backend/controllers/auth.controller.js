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
 * @desc    Generate a password reset token for the user
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an email address',
    });
  }

  const { resetToken } = await authService.forgotPassword(email);

  res.status(200).json({
    success: true,
    resetToken,
  });
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset user password using a valid reset token
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Please provide token and newPassword',
    });
  }

  await authService.resetPassword(token, newPassword);

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


/**
 * @desc    Change current user's own password (requires current password verification)
 * @route   PUT /api/v1/auth/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Please provide currentPassword and newPassword',
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 6 characters',
    });
  }

  await authService.changePassword(req.user._id, currentPassword, newPassword);
  res.status(200).json({ success: true, message: 'Password changed successfully' });
});

/**
 * @desc    Update current logged-in user profile
 * @route   PUT /api/v1/auth/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const updatedUser = await authService.updateUser(req.user._id, req.body);
  res.status(200).json({ success: true, data: updatedUser });
});

/**
 * @desc    Get all users
 * @route   GET /api/v1/auth/users
 * @access  Private (Admin)
 */
const getUsers = asyncHandler(async (req, res) => {
  const users = await authService.getAllUsers();
  res.status(200).json({ success: true, data: users });
});

/**
 * @desc    Create user
 * @route   POST /api/v1/auth/users
 * @access  Private (Admin)
 */
const createUserAdmin = asyncHandler(async (req, res) => {
  const user = await authService.createUser(req.body);
  res.status(201).json({ success: true, data: user });
});

/**
 * @desc    Update user details by ID
 * @route   PUT /api/v1/auth/users/:id
 * @access  Private (Admin)
 */
const updateUserAdmin = asyncHandler(async (req, res) => {
  const user = await authService.updateUser(req.params.id, req.body);
  res.status(200).json({ success: true, data: user });
});

/**
 * @desc    Delete user by ID
 * @route   DELETE /api/v1/auth/users/:id
 * @access  Private (Admin)
 */
const deleteUserAdmin = asyncHandler(async (req, res) => {
  await authService.deleteUser(req.params.id);
  res.status(200).json({ success: true, message: 'User deleted successfully' });
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
  updateProfile,
  changePassword,
  getUsers,
  createUserAdmin,
  updateUserAdmin,
  deleteUserAdmin,
};
