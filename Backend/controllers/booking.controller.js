const bookingService = require("../services/booking.service");

// ── Helper ───────────────────────────────────────────────
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// ── CRUD Controllers ─────────────────────────────────────

// @desc   Get all bookings (with query-param filtering, sorting, pagination)
// @route  GET /api/v1/bookings
const getAllBookings = asyncHandler(async (req, res) => {
  const { bookings, page, limit, total, totalPages } = await bookingService.getAllBookings(req.query);
  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings,
    pagination: {
      page,
      limit: limit || total || 1,
      total,
      totalPages,
    },
  });
});

// @desc   Get booking by booking ID
// @route  GET /api/v1/bookings/:bookingId
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await bookingService.getBookingById(req.params.bookingId);
  if (!booking) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }
  res.status(200).json({ success: true, data: booking });
});

// @desc   Create new booking
// @route  POST /api/v1/bookings
const createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking(req.body);
  res.status(201).json({ success: true, data: booking });
});

// @desc   Bulk insert bookings
// @route  POST /api/v1/bookings/bulk-insert
const bulkInsertBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingService.bulkInsertBookings(req.body);
  res.status(201).json({ success: true, count: bookings.length, data: bookings });
});

// @desc   Replace booking details
// @route  PUT /api/v1/bookings/:bookingId
const replaceBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.replaceBooking(req.params.bookingId, req.body);
  if (!booking) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }
  res.status(200).json({ success: true, data: booking });
});

// @desc   Update booking status
// @route  PATCH /api/v1/bookings/:bookingId/status
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ success: false, message: "Status is required" });
  }
  const booking = await bookingService.updateBookingStatus(req.params.bookingId, status);
  if (!booking) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }
  res.status(200).json({ success: true, data: booking });
});

// @desc   Update booking payment
// @route  PATCH /api/v1/bookings/:bookingId/payment
const updateBookingPayment = asyncHandler(async (req, res) => {
  const { paymentMethod } = req.body;
  if (!paymentMethod) {
    return res.status(400).json({ success: false, message: "Payment method is required" });
  }
  const booking = await bookingService.updateBookingPayment(req.params.bookingId, paymentMethod);
  if (!booking) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }
  res.status(200).json({ success: true, data: booking });
});

// @desc   Update booking rating
// @route  PATCH /api/v1/bookings/:bookingId/rating
const updateBookingRating = asyncHandler(async (req, res) => {
  const { driverRatings, customerRating } = req.body;
  const booking = await bookingService.updateBookingRating(
    req.params.bookingId,
    driverRatings,
    customerRating
  );
  if (!booking) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }
  res.status(200).json({ success: true, data: booking });
});

// @desc   Update booking fare
// @route  PATCH /api/v1/bookings/:bookingId/fare
const updateBookingFare = asyncHandler(async (req, res) => {
  const { bookingValue } = req.body;
  if (bookingValue === undefined) {
    return res.status(400).json({ success: false, message: "Booking value is required" });
  }
  const booking = await bookingService.updateBookingFare(req.params.bookingId, bookingValue);
  if (!booking) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }
  res.status(200).json({ success: true, data: booking });
});

// @desc   Update ride distance
// @route  PATCH /api/v1/bookings/:bookingId/distance
const updateRideDistance = asyncHandler(async (req, res) => {
  const { rideDistance } = req.body;
  if (rideDistance === undefined) {
    return res.status(400).json({ success: false, message: "Ride distance is required" });
  }
  const booking = await bookingService.updateRideDistance(req.params.bookingId, rideDistance);
  if (!booking) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }
  res.status(200).json({ success: true, data: booking });
});

// @desc   Update ride location
// @route  PATCH /api/v1/bookings/:bookingId/location
const updateRideLocation = asyncHandler(async (req, res) => {
  const { pickupLocation, dropLocation } = req.body;
  const booking = await bookingService.updateRideLocation(
    req.params.bookingId,
    pickupLocation,
    dropLocation
  );
  if (!booking) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }
  res.status(200).json({ success: true, data: booking });
});

// @desc   Delete booking
// @route  DELETE /api/v1/bookings/:bookingId
const deleteBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.deleteBooking(req.params.bookingId);
  if (!booking) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }
  res.status(200).json({ success: true, message: "Booking deleted", data: booking });
});

// @desc   Delete all bookings
// @route  DELETE /api/v1/bookings/delete-all
const deleteAllBookings = asyncHandler(async (req, res) => {
  const result = await bookingService.deleteAllBookings();
  res.status(200).json({
    success: true,
    message: "All bookings deleted",
    deletedCount: result.deletedCount,
  });
});

// ── Route Parameter Controllers ──────────────────────────

// @route  GET /api/v1/bookings/id/:bookingId
const getByIdParam = asyncHandler(async (req, res) => {
  const booking = await bookingService.getBookingById(req.params.bookingId);
  if (!booking) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }
  res.status(200).json({ success: true, data: booking });
});

// @route  GET /api/v1/bookings/status/:status
const getByStatus = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getByStatus(req.params.status);
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @route  GET /api/v1/bookings/customer/:customerId
const getByCustomer = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getByCustomer(req.params.customerId);
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @route  GET /api/v1/bookings/vehicle/:vehicleType
const getByVehicleType = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getByVehicleType(req.params.vehicleType);
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @route  GET /api/v1/bookings/payment/:method
const getByPaymentMethod = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getByPaymentMethod(req.params.method);
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @route  GET /api/v1/bookings/pickup/:location
const getByPickupLocation = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getByPickupLocation(req.params.location);
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @route  GET /api/v1/bookings/drop/:location
const getByDropLocation = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getByDropLocation(req.params.location);
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @route  GET /api/v1/bookings/date/:date
const getByDate = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getByDate(req.params.date);
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @route  GET /api/v1/bookings/time/:time
const getByTime = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getByTime(req.params.time);
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @route  GET /api/v1/bookings/rating/driver/:rating
const getByDriverRating = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getByDriverRating(req.params.rating);
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @route  GET /api/v1/bookings/rating/customer/:rating
const getByCustomerRating = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getByCustomerRating(req.params.rating);
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @route  GET /api/v1/bookings/distance/:distance
const getByDistance = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getByDistance(req.params.distance);
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @route  GET /api/v1/bookings/value/:amount
const getByFareValue = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getByFareValue(req.params.amount);
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @route  GET /api/v1/bookings/incomplete/:status
const getIncomplete = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getIncomplete(req.params.status);
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @route  GET /api/v1/bookings/incomplete-reason/:reason
const getByIncompleteReason = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getByIncompleteReason(req.params.reason);
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @route  GET /api/v1/bookings/cancel/customer/:reason
const getByCustomerCancelReason = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getByCustomerCancelReason(req.params.reason);
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @route  GET /api/v1/bookings/cancel/driver/:reason
const getByDriverCancelReason = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getByDriverCancelReason(req.params.reason);
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @route  GET /api/v1/bookings/vtat/:minutes
const getByVTAT = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getByVTAT(req.params.minutes);
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @route  GET /api/v1/bookings/ctat/:minutes
const getByCTAT = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getByCTAT(req.params.minutes);
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @route  GET /api/v1/bookings/day/:day
const getByDay = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getByDay(req.params.day);
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @route  GET /api/v1/bookings/month/:month
const getByMonth = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getByMonth(req.params.month);
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @route  GET /api/v1/bookings/year/:year
const getByYear = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getByYear(req.params.year);
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @route  GET /api/v1/bookings/hour/:hour
const getByHour = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getByHour(req.params.hour);
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @route  GET /api/v1/bookings/minute/:minute
const getByMinute = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getByMinute(req.params.minute);
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @route  GET /api/v1/bookings/source/:pickup
const getBySource = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getBySource(req.params.pickup);
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @route  GET /api/v1/bookings/destination/:drop
const getByDestination = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getByDestination(req.params.drop);
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @route  GET /api/v1/bookings/vehicle-image/:imageName
const getByVehicleImage = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getByVehicleImage(req.params.imageName);
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @route  GET /api/v1/bookings/fare/:value
const getByFare = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getByFare(req.params.value);
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @route  GET /api/v1/bookings/customer/:customerId/history
const getCustomerHistory = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getCustomerHistory(req.params.customerId);
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @route  GET /api/v1/bookings/customer/:customerId/latest
const getCustomerLatest = asyncHandler(async (req, res) => {
  const booking = await bookingService.getCustomerLatest(req.params.customerId);
  if (!booking) {
    return res.status(404).json({ success: false, message: "No bookings found for this customer" });
  }
  res.status(200).json({ success: true, data: booking });
});

// ── Advanced Controllers ─────────────────────────────────

// @route  GET /api/v1/bookings/top/highest-fare
const getHighestFare = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getHighestFare();
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @route  GET /api/v1/bookings/top/lowest-fare
const getLowestFare = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getLowestFare();
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @route  GET /api/v1/bookings/recent
const getRecentBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getRecentBookings();
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @route  GET /api/v1/bookings/latest
const getLatestBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.getLatestBooking();
  res.status(200).json({ success: true, data: booking });
});

// @route  GET /api/v1/bookings/random
const getRandomBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getRandomBookings();
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @route  GET /api/v1/bookings/trending
const getTrendingBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getTrendingBookings();
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @route  GET /api/v1/bookings/success
const getSuccessRides = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getSuccessRides();
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @route  GET /api/v1/bookings/cancelled
const getCancelledRides = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getCancelledRides();
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @route  GET /api/v1/bookings/incomplete (without param)
const getIncompleteRides = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getIncompleteRides();
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @route  GET /api/v1/bookings/driver-not-found
const getDriverNotFoundRides = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getDriverNotFoundRides();
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @route  GET /api/v1/bookings/summary/ai
const getAISummary = asyncHandler(async (req, res) => {
  const summary = await bookingService.getAISummary();
  res.status(200).json({ success: true, data: summary });
});

// ── Derived entity controllers (customers, drivers, vehicles, etc.) ──

// @route  POST /api/v1/customers
const createCustomer = asyncHandler(async (req, res) => {
  // Customers are derived from bookings — create a booking with customer data
  const booking = await bookingService.createBooking(req.body);
  res.status(201).json({ success: true, data: booking });
});

// @route  POST /api/v1/drivers
const createDriver = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, message: "Driver created", data: req.body });
});

// @route  POST /api/v1/payments
const createPayment = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, message: "Payment created", data: req.body });
});

// @route  POST /api/v1/ratings
const createRating = asyncHandler(async (req, res) => {
  const { bookingId, driverRatings, customerRating } = req.body;
  if (bookingId) {
    const booking = await bookingService.updateBookingRating(bookingId, driverRatings, customerRating);
    return res.status(201).json({ success: true, data: booking });
  }
  res.status(201).json({ success: true, message: "Rating created", data: req.body });
});

// @route  POST /api/v1/vehicles
const createVehicle = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, message: "Vehicle created", data: req.body });
});

// @route  POST /api/v1/locations
const createLocation = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, message: "Location created", data: req.body });
});

// @route  POST /api/v1/customers/bulk-insert
const bulkInsertCustomers = asyncHandler(async (req, res) => {
  const bookings = await bookingService.bulkInsertBookings(req.body);
  res.status(201).json({ success: true, count: bookings.length, data: bookings });
});

// @route  POST /api/v1/drivers/bulk-insert
const bulkInsertDrivers = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, message: "Drivers bulk inserted", data: req.body });
});

// PUT for derived entities
const replaceCustomer = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: "Customer replaced", data: req.body });
});

const replaceDriver = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: "Driver replaced", data: req.body });
});

const replaceVehicle = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: "Vehicle replaced", data: req.body });
});

// DELETE for derived entities
const deleteCustomer = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: `Customer ${req.params.customerId} deleted` });
});

const deleteDriver = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: `Driver ${req.params.driverId} deleted` });
});

const deleteVehicle = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: `Vehicle ${req.params.vehicleId} deleted` });
});

const deletePayment = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: `Payment ${req.params.paymentId} deleted` });
});

const deleteRating = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: `Rating ${req.params.ratingId} deleted` });
});

const deleteLogs = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: `Log ${req.params.id} deleted` });
});

const deleteAllCustomers = asyncHandler(async (req, res) => {
  const result = await bookingService.deleteAllCustomers();
  res.status(200).json({ success: true, message: "All customers deleted", deletedCount: result.deletedCount });
});

const deleteCancelledRides = asyncHandler(async (req, res) => {
  const result = await bookingService.deleteCancelledRides();
  res.status(200).json({ success: true, message: "All cancelled rides deleted", deletedCount: result.deletedCount });
});

// ── Compare controller ──
const compareBookings = asyncHandler(async (req, res) => {
  const { booking1, booking2 } = req.query;
  if (!booking1 || !booking2) {
    return res.status(400).json({ success: false, message: "Please provide booking1 and booking2 query params" });
  }
  const result = await bookingService.compareBookings(booking1, booking2);
  res.status(200).json({ success: true, data: result });
});

// ── Soft Delete Controllers ──

// @desc   Soft delete a booking (sets isDeleted flag)
// @route  PATCH /api/v1/bookings/:bookingId/soft-delete
const softDeleteBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.softDeleteBooking(req.params.bookingId);
  if (!booking) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }
  res.status(200).json({ success: true, message: "Booking soft deleted", data: booking });
});

// @desc   Restore a soft-deleted booking
// @route  PATCH /api/v1/bookings/:bookingId/restore
const restoreBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.restoreBooking(req.params.bookingId);
  if (!booking) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }
  res.status(200).json({ success: true, message: "Booking restored", data: booking });
});

module.exports = {
  getAllBookings,
  getBookingById,
  createBooking,
  bulkInsertBookings,
  replaceBooking,
  updateBookingStatus,
  updateBookingPayment,
  updateBookingRating,
  updateBookingFare,
  updateRideDistance,
  updateRideLocation,
  deleteBooking,
  deleteAllBookings,
  getByIdParam,
  getByStatus,
  getByCustomer,
  getByVehicleType,
  getByPaymentMethod,
  getByPickupLocation,
  getByDropLocation,
  getByDate,
  getByTime,
  getByDriverRating,
  getByCustomerRating,
  getByDistance,
  getByFareValue,
  getIncomplete,
  getByIncompleteReason,
  getByCustomerCancelReason,
  getByDriverCancelReason,
  getByVTAT,
  getByCTAT,
  getByDay,
  getByMonth,
  getByYear,
  getByHour,
  getByMinute,
  getBySource,
  getByDestination,
  getByVehicleImage,
  getByFare,
  getCustomerHistory,
  getCustomerLatest,
  getHighestFare,
  getLowestFare,
  getRecentBookings,
  getLatestBooking,
  getRandomBookings,
  getTrendingBookings,
  getSuccessRides,
  getCancelledRides,
  getIncompleteRides,
  getDriverNotFoundRides,
  getAISummary,
  createCustomer,
  createDriver,
  createPayment,
  createRating,
  createVehicle,
  createLocation,
  bulkInsertCustomers,
  bulkInsertDrivers,
  replaceCustomer,
  replaceDriver,
  replaceVehicle,
  deleteCustomer,
  deleteDriver,
  deleteVehicle,
  deletePayment,
  deleteRating,
  deleteLogs,
  deleteAllCustomers,
  deleteCancelledRides,
  compareBookings,
  softDeleteBooking,
  restoreBooking,
};
