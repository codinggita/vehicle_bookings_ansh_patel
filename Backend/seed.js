const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Booking = require("./models/booking.model");
const dotenv = require("dotenv");

// Load env vars
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/vehicle_bookings";

const importData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected...");

    const filePath = path.join(__dirname, "data", "bookings.json");
    
    // Read the file and parse JSON
    let data = fs.readFileSync(filePath, "utf-8");
    if (data.charCodeAt(0) === 0xFEFF) {
      data = data.slice(1);
    }
    const bookingsData = JSON.parse(data);

    console.log(`Loaded ${bookingsData.length} records from JSON.`);

    // Clear existing bookings
    await Booking.deleteMany();
    console.log("Existing bookings deleted.");

    // Map and clean data
    const cleanedData = bookingsData.map((item) => {
      // Handle the BOM in the Date key if it exists
      const dateKey = Object.keys(item).find((key) => key.includes("Date"));
      
      const parseNull = (val) => (val === "null" || val === "" || val === undefined ? null : val);
      const parseNumber = (val) => {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? null : parsed;
      };

      return {
        date: new Date(item[dateKey]),
        time: item.Time,
        bookingId: item.Booking_ID,
        bookingStatus: item.Booking_Status,
        customerId: item.Customer_ID,
        vehicleType: item.Vehicle_Type,
        pickupLocation: item.Pickup_Location,
        dropLocation: item.Drop_Location,
        vTAT: parseNumber(item.V_TAT),
        cTAT: parseNumber(item.C_TAT),
        canceledRidesByCustomer: parseNull(item.Canceled_Rides_by_Customer),
        canceledRidesByDriver: parseNull(item.Canceled_Rides_by_Driver),
        incompleteRides: parseNull(item.Incomplete_Rides),
        incompleteRidesReason: parseNull(item.Incomplete_Rides_Reason),
        bookingValue: parseNumber(item.Booking_Value) || 0,
        paymentMethod: parseNull(item.Payment_Method),
        rideDistance: parseNumber(item.Ride_Distance) || 0,
        driverRatings: parseNumber(item.Driver_Ratings),
        customerRating: parseNumber(item.Customer_Rating),
        vehicleImages: parseNull(item["Vehicle Images"])
      };
    });

    console.log("Data cleaned and mapped. Inserting into MongoDB...");

    // Insert data in batches to prevent memory issues
    const batchSize = 10000;
    for (let i = 0; i < cleanedData.length; i += batchSize) {
      const batch = cleanedData.slice(i, i + batchSize);
      await Booking.insertMany(batch);
      console.log(`Inserted batch ${i / batchSize + 1} (${batch.length} records)`);
    }

    console.log("Data import completed successfully!");
    process.exit();
  } catch (error) {
    console.error("Error importing data:", error);
    process.exit(1);
  }
};

importData();
