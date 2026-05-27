const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const Booking = require("../models/booking.model");

dotenv.config();

// ── Helper: convert "null" strings to actual null ────────
const cleanNull = (value) => {
  if (value === "null" || value === "" || value === undefined) return null;
  return value;
};

// ── Helper: convert to number or null ────────────────────
const toNumber = (value) => {
  const cleaned = cleanNull(value);
  if (cleaned === null) return null;
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
};

// ── Transform raw record to schema-friendly format ───────
const transformRecord = (raw) => {
  // Handle BOM character in Date key
  const dateKey = Object.keys(raw).find((k) => k.includes("Date"));
  const dateValue = raw[dateKey] || raw["Date"];

  return {
    date: new Date(dateValue),
    time: raw["Time"],
    bookingId: raw["Booking_ID"],
    bookingStatus: raw["Booking_Status"],
    customerId: raw["Customer_ID"],
    vehicleType: raw["Vehicle_Type"],
    pickupLocation: raw["Pickup_Location"],
    dropLocation: raw["Drop_Location"],
    vTAT: toNumber(raw["V_TAT"]),
    cTAT: toNumber(raw["C_TAT"]),
    canceledRidesByCustomer: cleanNull(raw["Canceled_Rides_by_Customer"]),
    canceledRidesByDriver: cleanNull(raw["Canceled_Rides_by_Driver"]),
    incompleteRides: cleanNull(raw["Incomplete_Rides"]),
    incompleteRidesReason: cleanNull(raw["Incomplete_Rides_Reason"]),
    bookingValue: toNumber(raw["Booking_Value"]),
    paymentMethod: cleanNull(raw["Payment_Method"]),
    rideDistance: toNumber(raw["Ride_Distance"]) || 0,
    driverRatings: toNumber(raw["Driver_Ratings"]),
    customerRating: toNumber(raw["Customer_Rating"]),
    vehicleImages: cleanNull(raw["Vehicle Images"]),
  };
};

// ── Seed Function ────────────────────────────────────────
const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for seeding...");

    // Read raw JSON file
    const filePath = path.join(__dirname, "..", "data", "bookings.json");
    const rawData = fs.readFileSync(filePath, "utf-8");

    // Remove BOM if present
    const cleanData = rawData.replace(/^\uFEFF/, "");
    const records = JSON.parse(cleanData);

    console.log(`Parsed ${records.length} records from JSON file`);

    // Transform all records
    const transformedRecords = records.map(transformRecord);

    // Clear existing data
    await Booking.deleteMany({});
    console.log("Cleared existing bookings collection");

    // Insert in batches of 1000
    const batchSize = 1000;
    let inserted = 0;

    for (let i = 0; i < transformedRecords.length; i += batchSize) {
      const batch = transformedRecords.slice(i, i + batchSize);
      await Booking.insertMany(batch, { ordered: false });
      inserted += batch.length;
      console.log(`Inserted ${inserted} / ${transformedRecords.length} records`);
    }

    console.log(`\nSeeding complete! Total records inserted: ${inserted}`);
    process.exit(0);
  } catch (error) {
    console.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
