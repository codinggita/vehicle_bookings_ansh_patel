const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, "Booking date is required"],
    },
    time: {
      type: String,
      required: [true, "Booking time is required"],
    },
    bookingId: {
      type: String,
      required: [true, "Booking ID is required"],
      unique: true,
      trim: true,
    },
    bookingStatus: {
      type: String,
      required: [true, "Booking status is required"],
      enum: [
        "Success",
        "Canceled by Driver",
        "Canceled by Customer",
        "Driver Not Found",
      ],
    },
    customerId: {
      type: String,
      required: [true, "Customer ID is required"],
      trim: true,
    },
    vehicleType: {
      type: String,
      required: [true, "Vehicle type is required"],
      enum: [
        "Bike",
        "eBike",
        "Auto",
        "Mini",
        "Prime Sedan",
        "Prime Plus",
        "Prime SUV",
      ],
    },
    pickupLocation: {
      type: String,
      required: [true, "Pickup location is required"],
      trim: true,
    },
    dropLocation: {
      type: String,
      required: [true, "Drop location is required"],
      trim: true,
    },
    vTAT: {
      type: Number,
      default: null,
    },
    cTAT: {
      type: Number,
      default: null,
    },
    canceledRidesByCustomer: {
      type: String,
      default: null,
    },
    canceledRidesByDriver: {
      type: String,
      default: null,
    },
    incompleteRides: {
      type: String,
      default: null,
      enum: ["Yes", "No", null],
    },
    incompleteRidesReason: {
      type: String,
      default: null,
    },
    bookingValue: {
      type: Number,
      required: [true, "Booking value is required"],
    },
    paymentMethod: {
      type: String,
      default: null,
      enum: ["Cash", "UPI", "Credit Card", "Debit Card", null],
    },
    rideDistance: {
      type: Number,
      default: 0,
    },
    driverRatings: {
      type: Number,
      default: null,
    },
    customerRating: {
      type: Number,
      default: null,
    },
    vehicleImages: {
      type: String,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Tracks createdAt and updatedAt automatically
  }
);

// ── Indexes ──────────────────────────────────────────────
bookingSchema.index({ customerId: 1 });
bookingSchema.index({ bookingStatus: 1 });
bookingSchema.index({ vehicleType: 1 });
bookingSchema.index({ date: 1 });
bookingSchema.index({ pickupLocation: 1 });
bookingSchema.index({ dropLocation: 1 });
bookingSchema.index({ paymentMethod: 1 });

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
