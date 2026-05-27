const Booking = require("../models/booking.model");

// ── Field mapping: sort param names -> schema field names ──
const SORT_FIELD_MAP = {
  Booking_Value: "bookingValue",
  Ride_Distance: "rideDistance",
  Driver_Ratings: "driverRatings",
  Customer_Rating: "customerRating",
  Date: "date",
  Vehicle_Type: "vehicleType",
  Payment_Method: "paymentMethod",
  Pickup_Location: "pickupLocation",
  Drop_Location: "dropLocation",
  Booking_Status: "bookingStatus",
};

// ── CRUD Operations ──────────────────────────────────────

// Get all bookings with full query-parameter filtering, sorting, pagination
const getAllBookings = async (queryParams) => {
  const filter = {};

  // ── Basic filters ──
  if (queryParams.status) filter.bookingStatus = queryParams.status;
  if (queryParams.vehicle) filter.vehicleType = queryParams.vehicle;
  if (queryParams.payment) filter.paymentMethod = queryParams.payment;
  if (queryParams.pickup) filter.pickupLocation = queryParams.pickup;
  if (queryParams.drop) filter.dropLocation = queryParams.drop;
  if (queryParams.customer) filter.customerId = queryParams.customer;
  if (queryParams.time) filter.time = queryParams.time;

  // ── Date filter ──
  if (queryParams.date) {
    const dateObj = new Date(queryParams.date);
    const nextDay = new Date(dateObj);
    nextDay.setDate(nextDay.getDate() + 1);
    filter.date = { $gte: dateObj, $lt: nextDay };
  }

  // ── Rating filters ──
  if (queryParams.driverRating) {
    filter.driverRatings = parseFloat(queryParams.driverRating);
  }
  if (queryParams.customerRating) {
    filter.customerRating = parseFloat(queryParams.customerRating);
  }
  if (queryParams.minRating) {
    filter.driverRatings = {
      ...filter.driverRatings,
      $gte: parseFloat(queryParams.minRating),
    };
  }
  if (queryParams.maxRating) {
    filter.driverRatings = {
      ...filter.driverRatings,
      $lte: parseFloat(queryParams.maxRating),
    };
  }

  // ── Fare range filters ──
  if (queryParams.minFare || queryParams.maxFare) {
    filter.bookingValue = {};
    if (queryParams.minFare)
      filter.bookingValue.$gte = parseInt(queryParams.minFare);
    if (queryParams.maxFare)
      filter.bookingValue.$lte = parseInt(queryParams.maxFare);
  }

  // ── Distance filters ──
  if (queryParams.minDistance || queryParams.maxDistance) {
    filter.rideDistance = {};
    if (queryParams.minDistance)
      filter.rideDistance.$gte = parseInt(queryParams.minDistance);
    if (queryParams.maxDistance)
      filter.rideDistance.$lte = parseInt(queryParams.maxDistance);
  }
  if (queryParams.distanceAbove) {
    filter.rideDistance = {
      ...filter.rideDistance,
      $gt: parseInt(queryParams.distanceAbove),
    };
  }
  if (queryParams.distanceBelow) {
    filter.rideDistance = {
      ...filter.rideDistance,
      $lt: parseInt(queryParams.distanceBelow),
    };
  }

  // ── Incomplete filter ──
  if (queryParams.incomplete) {
    filter.incompleteRides = queryParams.incomplete;
  }

  // ── Cancelled filters ──
  if (queryParams.cancelledByDriver === "true") {
    filter.canceledRidesByDriver = { $ne: null };
  }
  if (queryParams.cancelledByCustomer === "true") {
    filter.canceledRidesByCustomer = { $ne: null };
  }

  // ── Date-part filters ──
  if (queryParams.month) {
    const month = parseInt(queryParams.month);
    filter.$expr = { ...(filter.$expr || {}), $eq: [{ $month: "$date" }, month] };
  }
  if (queryParams.year) {
    const year = parseInt(queryParams.year);
    if (filter.$expr && filter.$expr.$eq) {
      // Already have a $expr, use $and
      const existing = filter.$expr;
      filter.$expr = {
        $and: [existing, { $eq: [{ $year: "$date" }, year] }],
      };
    } else {
      filter.$expr = { $eq: [{ $year: "$date" }, year] };
    }
  }
  if (queryParams.hour) {
    const hour = parseInt(queryParams.hour);
    if (filter.$expr) {
      const existing = filter.$expr;
      filter.$expr = filter.$expr.$and
        ? { $and: [...filter.$expr.$and, { $eq: [{ $hour: "$date" }, hour] }] }
        : { $and: [existing, { $eq: [{ $hour: "$date" }, hour] }] };
    } else {
      filter.$expr = { $eq: [{ $hour: "$date" }, hour] };
    }
  }

  // ── Build query ──
  let query = Booking.find(filter);

  // ── Field Selection (Projection) ──
  if (queryParams.fields) {
    const fields = queryParams.fields.split(",").join(" ");
    query = query.select(fields);
  }

  // ── Sorting ──
  if (queryParams.sort) {
    const sortParam = queryParams.sort;
    const isDescending = sortParam.startsWith("-");
    const rawField = isDescending ? sortParam.substring(1) : sortParam;
    const schemaField = SORT_FIELD_MAP[rawField] || rawField;
    const sortOrder = isDescending ? -1 : 1;
    query = query.sort({ [schemaField]: sortOrder });
  }

  // ── Pagination ──
  const page = parseInt(queryParams.page) || 1;
  const limit = parseInt(queryParams.limit) || 0; // 0 = no limit (return all)
  if (limit > 0) {
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
  }

  const bookings = await query;
  return { bookings, page, limit };
};

// Get booking by bookingId
const getBookingById = async (bookingId) => {
  const booking = await Booking.findOne({ bookingId });
  return booking;
};

// Create new booking
const createBooking = async (data) => {
  const booking = await Booking.create(data);
  return booking;
};

// Bulk insert bookings
const bulkInsertBookings = async (data) => {
  const bookings = await Booking.insertMany(data, { ordered: false });
  return bookings;
};

// Replace booking (PUT)
const replaceBooking = async (bookingId, data) => {
  const booking = await Booking.findOneAndReplace({ bookingId }, data, {
    new: true,
    runValidators: true,
  });
  return booking;
};

// Update booking status (PATCH)
const updateBookingStatus = async (bookingId, status) => {
  const booking = await Booking.findOneAndUpdate(
    { bookingId },
    { bookingStatus: status },
    { new: true, runValidators: true }
  );
  return booking;
};

// Update booking payment (PATCH)
const updateBookingPayment = async (bookingId, paymentMethod) => {
  const booking = await Booking.findOneAndUpdate(
    { bookingId },
    { paymentMethod },
    { new: true, runValidators: true }
  );
  return booking;
};

// Update booking rating (PATCH)
const updateBookingRating = async (bookingId, driverRatings, customerRating) => {
  const update = {};
  if (driverRatings !== undefined) update.driverRatings = driverRatings;
  if (customerRating !== undefined) update.customerRating = customerRating;
  const booking = await Booking.findOneAndUpdate({ bookingId }, update, {
    new: true,
    runValidators: true,
  });
  return booking;
};

// Update booking fare (PATCH)
const updateBookingFare = async (bookingId, bookingValue) => {
  const booking = await Booking.findOneAndUpdate(
    { bookingId },
    { bookingValue },
    { new: true, runValidators: true }
  );
  return booking;
};

// Update ride distance (PATCH)
const updateRideDistance = async (bookingId, rideDistance) => {
  const booking = await Booking.findOneAndUpdate(
    { bookingId },
    { rideDistance },
    { new: true, runValidators: true }
  );
  return booking;
};

// Update ride location (PATCH)
const updateRideLocation = async (bookingId, pickupLocation, dropLocation) => {
  const update = {};
  if (pickupLocation) update.pickupLocation = pickupLocation;
  if (dropLocation) update.dropLocation = dropLocation;
  const booking = await Booking.findOneAndUpdate({ bookingId }, update, {
    new: true,
    runValidators: true,
  });
  return booking;
};

// Delete booking
const deleteBooking = async (bookingId) => {
  const booking = await Booking.findOneAndDelete({ bookingId });
  return booking;
};

// Soft delete booking (sets isDeleted flag instead of removing)
const softDeleteBooking = async (bookingId) => {
  const booking = await Booking.findOneAndUpdate(
    { bookingId },
    { isDeleted: true },
    { new: true }
  );
  return booking;
};

// Restore soft-deleted booking
const restoreBooking = async (bookingId) => {
  const booking = await Booking.findOneAndUpdate(
    { bookingId },
    { isDeleted: false },
    { new: true }
  );
  return booking;
};

// Delete all bookings
const deleteAllBookings = async () => {
  const result = await Booking.deleteMany({});
  return result;
};

// Delete all cancelled rides
const deleteCancelledRides = async () => {
  const result = await Booking.deleteMany({
    bookingStatus: { $in: ["Canceled by Driver", "Canceled by Customer"] },
  });
  return result;
};

// ── Route Parameter Queries ──────────────────────────────

const getByStatus = async (status) => {
  return await Booking.find({ bookingStatus: status });
};

const getByCustomer = async (customerId) => {
  return await Booking.find({ customerId });
};

const getByVehicleType = async (vehicleType) => {
  return await Booking.find({ vehicleType });
};

const getByPaymentMethod = async (method) => {
  return await Booking.find({ paymentMethod: method });
};

const getByPickupLocation = async (location) => {
  return await Booking.find({ pickupLocation: location });
};

const getByDropLocation = async (location) => {
  return await Booking.find({ dropLocation: location });
};

const getByDate = async (date) => {
  const dateObj = new Date(date);
  const nextDay = new Date(dateObj);
  nextDay.setDate(nextDay.getDate() + 1);
  return await Booking.find({ date: { $gte: dateObj, $lt: nextDay } });
};

const getByTime = async (time) => {
  return await Booking.find({ time });
};

const getByDriverRating = async (rating) => {
  return await Booking.find({ driverRatings: parseFloat(rating) });
};

const getByCustomerRating = async (rating) => {
  return await Booking.find({ customerRating: parseFloat(rating) });
};

const getByDistance = async (distance) => {
  return await Booking.find({ rideDistance: parseInt(distance) });
};

const getByFareValue = async (amount) => {
  return await Booking.find({ bookingValue: parseInt(amount) });
};

const getIncomplete = async (status) => {
  if (status.toLowerCase() === "yes") {
    return await Booking.find({ incompleteRides: "Yes" });
  } else if (status.toLowerCase() === "no") {
    return await Booking.find({ incompleteRides: "No" });
  }
  return await Booking.find({ incompleteRides: { $in: ["Yes", "No"] } });
};

const getByIncompleteReason = async (reason) => {
  return await Booking.find({
    incompleteRidesReason: { $regex: reason, $options: "i" },
  });
};

const getByCustomerCancelReason = async (reason) => {
  return await Booking.find({
    canceledRidesByCustomer: { $regex: reason, $options: "i" },
  });
};

const getByDriverCancelReason = async (reason) => {
  return await Booking.find({
    canceledRidesByDriver: { $regex: reason, $options: "i" },
  });
};

const getByVTAT = async (minutes) => {
  return await Booking.find({ vTAT: parseInt(minutes) });
};

const getByCTAT = async (minutes) => {
  return await Booking.find({ cTAT: parseInt(minutes) });
};

const getByDay = async (day) => {
  return await Booking.find({
    $expr: { $eq: [{ $dayOfMonth: "$date" }, parseInt(day)] },
  });
};

const getByMonth = async (month) => {
  return await Booking.find({
    $expr: { $eq: [{ $month: "$date" }, parseInt(month)] },
  });
};

const getByYear = async (year) => {
  return await Booking.find({
    $expr: { $eq: [{ $year: "$date" }, parseInt(year)] },
  });
};

const getByHour = async (hour) => {
  return await Booking.find({
    $expr: { $eq: [{ $hour: "$date" }, parseInt(hour)] },
  });
};

const getByMinute = async (minute) => {
  return await Booking.find({
    $expr: { $eq: [{ $minute: "$date" }, parseInt(minute)] },
  });
};

const getBySource = async (pickup) => {
  return await Booking.find({ pickupLocation: pickup });
};

const getByDestination = async (drop) => {
  return await Booking.find({ dropLocation: drop });
};

const getByVehicleImage = async (imageName) => {
  return await Booking.find({
    vehicleImages: { $regex: imageName, $options: "i" },
  });
};

const getByFare = async (value) => {
  return await Booking.find({ bookingValue: parseInt(value) });
};

const getCustomerHistory = async (customerId) => {
  return await Booking.find({ customerId }).sort({ date: -1 });
};

const getCustomerLatest = async (customerId) => {
  return await Booking.findOne({ customerId }).sort({ date: -1 });
};

// ── Advanced Queries ─────────────────────────────────────

const getHighestFare = async () => {
  return await Booking.find().sort({ bookingValue: -1 }).limit(10);
};

const getLowestFare = async () => {
  return await Booking.find({ bookingValue: { $gt: 0 } })
    .sort({ bookingValue: 1 })
    .limit(10);
};

const getRecentBookings = async () => {
  return await Booking.find().sort({ date: -1 }).limit(20);
};

const getLatestBooking = async () => {
  return await Booking.findOne().sort({ date: -1 });
};

const getRandomBookings = async () => {
  return await Booking.aggregate([{ $sample: { size: 10 } }]);
};

const getTrendingBookings = async () => {
  // Trending = most common vehicle type in recent bookings
  return await Booking.aggregate([
    { $sort: { date: -1 } },
    { $limit: 1000 },
    { $group: { _id: "$vehicleType", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
};

const getSuccessRides = async () => {
  return await Booking.find({ bookingStatus: "Success" });
};

const getCancelledRides = async () => {
  return await Booking.find({
    bookingStatus: { $in: ["Canceled by Driver", "Canceled by Customer"] },
  });
};

const getIncompleteRides = async () => {
  return await Booking.find({ incompleteRides: "Yes" });
};

const getDriverNotFoundRides = async () => {
  return await Booking.find({ bookingStatus: "Driver Not Found" });
};

const compareBookings = async (bookingId1, bookingId2) => {
  const booking1 = await Booking.findOne({ bookingId: bookingId1 });
  const booking2 = await Booking.findOne({ bookingId: bookingId2 });
  return { booking1, booking2 };
};

const getAISummary = async () => {
  const totalBookings = await Booking.countDocuments();
  const successCount = await Booking.countDocuments({ bookingStatus: "Success" });
  const cancelledCount = await Booking.countDocuments({
    bookingStatus: { $in: ["Canceled by Driver", "Canceled by Customer"] },
  });
  const incompleteCount = await Booking.countDocuments({ incompleteRides: "Yes" });
  const driverNotFoundCount = await Booking.countDocuments({ bookingStatus: "Driver Not Found" });

  const avgFare = await Booking.aggregate([
    { $match: { bookingValue: { $gt: 0 } } },
    { $group: { _id: null, avgFare: { $avg: "$bookingValue" } } },
  ]);

  const avgDistance = await Booking.aggregate([
    { $match: { rideDistance: { $gt: 0 } } },
    { $group: { _id: null, avgDistance: { $avg: "$rideDistance" } } },
  ]);

  const topVehicle = await Booking.aggregate([
    { $group: { _id: "$vehicleType", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 },
  ]);

  const topPayment = await Booking.aggregate([
    { $match: { paymentMethod: { $ne: null } } },
    { $group: { _id: "$paymentMethod", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 },
  ]);

  return {
    summary: "AI-Generated Booking Summary",
    totalBookings,
    successRate: `${((successCount / totalBookings) * 100).toFixed(1)}%`,
    cancellationRate: `${((cancelledCount / totalBookings) * 100).toFixed(1)}%`,
    incompleteRate: `${((incompleteCount / totalBookings) * 100).toFixed(1)}%`,
    driverNotFoundRate: `${((driverNotFoundCount / totalBookings) * 100).toFixed(1)}%`,
    averageFare: avgFare[0] ? avgFare[0].avgFare.toFixed(2) : 0,
    averageDistance: avgDistance[0] ? avgDistance[0].avgDistance.toFixed(2) : 0,
    topVehicleType: topVehicle[0] ? topVehicle[0]._id : "N/A",
    topPaymentMethod: topPayment[0] ? topPayment[0]._id : "N/A",
  };
};

// ── Bulk operations for derived entities ─────────────────

const deleteAllCustomers = async () => {
  // Since customers are derived from bookings, this clears all bookings
  const result = await Booking.deleteMany({});
  return result;
};

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
  deleteCancelledRides,
  deleteAllCustomers,
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
  compareBookings,
  getAISummary,
  softDeleteBooking,
  restoreBooking,
};
