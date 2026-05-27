/**
 * Validation middleware for booking creation and updates
 * Validates booking fields against expected formats and value ranges
 */
const validateBooking = (req, res, next) => {
  const { bookingId, date, customerId, vehicleType, bookingValue, rideDistance, pickupLocation, dropLocation, paymentMethod, driverRatings, customerRating } = req.body;
  const errors = [];

  // Validate booking ID format (starts with CNR)
  if (bookingId && !/^CNR\d+$/.test(bookingId)) {
    errors.push('Booking ID must start with CNR followed by digits');
  }

  // Validate booking date
  if (date && isNaN(new Date(date).getTime())) {
    errors.push('Invalid booking date format');
  }

  // Validate customer ID format (starts with CID)
  if (customerId && !/^CID\d+$/.test(customerId)) {
    errors.push('Customer ID must start with CID followed by digits');
  }

  // Validate vehicle type
  const validVehicleTypes = ['Bike', 'eBike', 'Auto', 'Mini', 'Prime Sedan', 'Prime Plus', 'Prime SUV'];
  if (vehicleType && !validVehicleTypes.includes(vehicleType)) {
    errors.push(`Vehicle type must be one of: ${validVehicleTypes.join(', ')}`);
  }

  // Validate booking value
  if (bookingValue !== undefined && (isNaN(bookingValue) || bookingValue < 0)) {
    errors.push('Booking value must be a positive number');
  }

  // Validate ride distance
  if (rideDistance !== undefined && (isNaN(rideDistance) || rideDistance < 0)) {
    errors.push('Ride distance must be a positive number');
  }

  // Validate pickup location
  if (pickupLocation !== undefined && typeof pickupLocation !== 'string') {
    errors.push('Pickup location must be a string');
  }

  // Validate drop location
  if (dropLocation !== undefined && typeof dropLocation !== 'string') {
    errors.push('Drop location must be a string');
  }

  // Validate payment method
  const validPaymentMethods = ['Cash', 'UPI', 'Credit Card', 'Debit Card', null];
  if (paymentMethod && !validPaymentMethods.includes(paymentMethod)) {
    errors.push(`Payment method must be one of: ${validPaymentMethods.filter(Boolean).join(', ')}`);
  }

  // Validate ratings range (0-5)
  if (driverRatings !== undefined && driverRatings !== null && (isNaN(driverRatings) || driverRatings < 0 || driverRatings > 5)) {
    errors.push('Driver ratings must be between 0 and 5');
  }
  if (customerRating !== undefined && customerRating !== null && (isNaN(customerRating) || customerRating < 0 || customerRating > 5)) {
    errors.push('Customer rating must be between 0 and 5');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

module.exports = { validateBooking };
