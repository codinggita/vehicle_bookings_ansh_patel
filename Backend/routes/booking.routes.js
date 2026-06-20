const express = require("express");
const router = express.Router();
const controller = require("../controllers/booking.controller");
const { validateBooking } = require("../middlewares/validate");
const { protect, authorize } = require("../middlewares/auth");

router.use(protect);
const adminOnly = authorize("admin");

// ── Advanced Routes (MUST come before dynamic :bookingId) ──
router.get("/top/highest-fare", controller.getHighestFare);
router.get("/top/lowest-fare", controller.getLowestFare);
router.get("/recent", controller.getRecentBookings);
router.get("/latest", controller.getLatestBooking);
router.get("/random", controller.getRandomBookings);
router.get("/trending", controller.getTrendingBookings);
router.get("/success", controller.getSuccessRides);
router.get("/cancelled", controller.getCancelledRides);
router.get("/incomplete-rides", controller.getIncompleteRides);
router.get("/driver-not-found", controller.getDriverNotFoundRides);
router.get("/summary/ai", controller.getAISummary);
router.get("/compare", controller.compareBookings);

// ── Bulk & Mass Operations ──
router.post("/bulk-insert", adminOnly, controller.bulkInsertBookings);
router.delete("/delete-all", adminOnly, controller.deleteAllBookings);

// ── Route Parameter Routes (MUST come before dynamic :bookingId) ──

// Customer history & latest (must come before /customer/:customerId)
router.get("/customer/:customerId/history", controller.getCustomerHistory);
router.get("/customer/:customerId/latest", controller.getCustomerLatest);

// Specific-path routes
router.get("/id/:bookingId", controller.getByIdParam);
router.get("/status/:status", controller.getByStatus);
router.get("/customer/:customerId", controller.getByCustomer);
router.get("/vehicle/:vehicleType", controller.getByVehicleType);
router.get("/payment/:method", controller.getByPaymentMethod);
router.get("/pickup/:location", controller.getByPickupLocation);
router.get("/drop/:location", controller.getByDropLocation);
router.get("/date/:date", controller.getByDate);
router.get("/time/:time", controller.getByTime);
router.get("/rating/driver/:rating", controller.getByDriverRating);
router.get("/rating/customer/:rating", controller.getByCustomerRating);
router.get("/distance/:distance", controller.getByDistance);
router.get("/value/:amount", controller.getByFareValue);
router.get("/incomplete/:status", controller.getIncomplete);
router.get("/incomplete-reason/:reason", controller.getByIncompleteReason);
router.get("/cancel/customer/:reason", controller.getByCustomerCancelReason);
router.get("/cancel/driver/:reason", controller.getByDriverCancelReason);
router.get("/vtat/:minutes", controller.getByVTAT);
router.get("/ctat/:minutes", controller.getByCTAT);
router.get("/day/:day", controller.getByDay);
router.get("/month/:month", controller.getByMonth);
router.get("/year/:year", controller.getByYear);
router.get("/hour/:hour", controller.getByHour);
router.get("/minute/:minute", controller.getByMinute);
router.get("/source/:pickup", controller.getBySource);
router.get("/destination/:drop", controller.getByDestination);
router.get("/vehicle-image/:imageName", controller.getByVehicleImage);
router.get("/fare/:value", controller.getByFare);

// ── Basic CRUD Routes ────────────────────────────────────

router.get("/", controller.getAllBookings);
router.post("/", adminOnly, validateBooking, controller.createBooking);
router.get("/:bookingId", controller.getBookingById);
router.put("/:bookingId", adminOnly, controller.replaceBooking);
router.patch("/:bookingId/status", adminOnly, controller.updateBookingStatus);
router.patch("/:bookingId/payment", adminOnly, controller.updateBookingPayment);
router.patch("/:bookingId/rating", adminOnly, controller.updateBookingRating);
router.patch("/:bookingId/fare", adminOnly, controller.updateBookingFare);
router.patch("/:bookingId/distance", adminOnly, controller.updateRideDistance);
router.patch("/:bookingId/location", adminOnly, controller.updateRideLocation);
router.delete("/:bookingId", adminOnly, controller.deleteBooking);

// ── Soft Delete Routes ──
router.patch("/:bookingId/soft-delete", adminOnly, controller.softDeleteBooking);
router.patch("/:bookingId/restore", adminOnly, controller.restoreBooking);

module.exports = router;
