const jwt = require('jsonwebtoken');
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

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  deleteUser,
  generateToken,
  verifyToken,
  refreshToken,
};
