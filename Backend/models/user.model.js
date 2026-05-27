const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'vehicle_bookings_jwt_secret_key_2024';

/**
 * @desc User schema for authentication and authorization
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

/**
 * @desc Hash password before saving to database
 */
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * @desc Compare entered password with hashed password in database
 * @param {string} enteredPassword - The plain text password to compare
 * @returns {Promise<boolean>} True if passwords match
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * @desc Generate a signed JWT token for the user
 * @returns {string} Signed JWT token
 */
userSchema.methods.generateToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

const User = mongoose.model('User', userSchema);

module.exports = User;
