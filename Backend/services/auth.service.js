const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user.model');

const JWT_SECRET = process.env.JWT_SECRET || 'vehicle_bookings_jwt_secret_key_2024';

/**
 * @desc Register a new user and return user data with token
 * @param {string} name - User's name
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<{user: object, token: string}>}
 */
const registerUser = async (name, email, password) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('User already exists with this email');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(user);

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    token,
  };
};

/**
 * @desc Authenticate user by email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<{user: object, token: string}>}
 */
const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user);

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    token,
  };
};

/**
 * @desc Get user by ID (excluding password)
 * @param {string} id - User's MongoDB ObjectId
 * @returns {Promise<object>}
 */
const getUserById = async (id) => {
  const user = await User.findById(id).select('-password');
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

/**
 * @desc Delete user by ID
 * @param {string} id - User's MongoDB ObjectId
 * @returns {Promise<object>}
 */
const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

/**
 * @desc Generate JWT token for a user
 * @param {object} user - User document
 * @returns {string} Signed JWT token
 */
const generateToken = (user) => {
  return user.generateToken();
};

/**
 * @desc Verify a JWT token and return decoded payload
 * @param {string} token - JWT token string
 * @returns {object} Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

/**
 * @desc Generate a fresh token for an existing user
 * @param {object} user - User document
 * @returns {string} New signed JWT token
 */
const refreshToken = (user) => {
  return generateToken(user);
};

/**
 * @desc Generate a reset token for the user matching the given email
 * @param {string} email - User's email
 * @returns {Promise<{resetToken: string}>}
 */
const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('No user found with that email');
    error.statusCode = 404;
    throw error;
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  return { resetToken };
};

/**
 * @desc Reset user password using a valid reset token
 * @param {string} token - Unhashed reset token
 * @param {string} newPassword - New password to set
 * @returns {Promise<void>}
 */
const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    const error = new Error('Invalid or expired reset token');
    error.statusCode = 400;
    throw error;
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
};

/**
 * @desc Get all registered users (excluding passwords)
 * @returns {Promise<Array>} List of all users
 */
const getAllUsers = async () => {
  return await User.find({}).select('-password');
};

/**
 * @desc Update a user by ID
 * @param {string} id - User ID
 * @param {object} data - Fields to update (name, email, role, password)
 * @returns {Promise<object>} Updated user details
 */
const updateUser = async (id, data) => {
  const user = await User.findById(id);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (data.name) user.name = data.name;
  if (data.email) {
    const existingUser = await User.findOne({ email: data.email.toLowerCase(), _id: { $ne: id } });
    if (existingUser) {
      const error = new Error('Email is already taken');
      error.statusCode = 400;
      throw error;
    }
    user.email = data.email.toLowerCase();
  }
  if (data.role && ['user', 'admin'].includes(data.role)) {
    user.role = data.role;
  }
  if (data.password) {
    user.password = data.password;
  }

  await user.save();
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

/**
 * @desc Change the logged-in user's own password (requires current password verification)
 * @param {string} id - User ID
 * @param {string} currentPassword - User's current password
 * @param {string} newPassword - New password to set
 * @returns {Promise<void>}
 */
const changePassword = async (id, currentPassword, newPassword) => {
  const user = await User.findById(id);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    const error = new Error('Current password is incorrect');
    error.statusCode = 400;
    throw error;
  }

  user.password = newPassword;
  await user.save();
};

/**
 * @desc Create a user (Admin only action)
 * @param {object} data - User creation fields
 * @returns {Promise<object>} Created user details
 */
const createUser = async (data) => {
  const existingUser = await User.findOne({ email: data.email.toLowerCase() });
  if (existingUser) {
    const error = new Error('User already exists with this email');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.create({
    name: data.name,
    email: data.email.toLowerCase(),
    password: data.password,
    role: data.role || 'user'
  });

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

module.exports = {
  registerUser,
  loginUser,
  verifyToken,
  getUserById,
  refreshToken,
  forgotPassword,
  resetPassword,
  getAllUsers,
  updateUser,
  createUser,
  deleteUser,
  changePassword,
};
