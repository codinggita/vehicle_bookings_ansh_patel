const dotenv = require("dotenv");
// Load environment variables FIRST — before any module that reads process.env
dotenv.config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");
const logger = require("./middlewares/logger");

// Import route files
const bookingRoutes = require("./routes/booking.routes");
const authRoutes = require("./routes/auth.routes");
const jwtRoutes = require("./routes/jwt.routes");
const searchRoutes = require("./routes/search.routes");
const statsRoutes = require("./routes/stats.routes");
const paginationRoutes = require("./routes/pagination.routes");
const adminRoutes = require("./routes/admin.routes");
const protectedRoutes = require("./routes/protected.routes");

// Import rate limiters
const {
  generalLimiter,
  authLimiter,
  searchLimiter,
  adminLimiter,
} = require("./middlewares/rateLimiter");

// Connect to MongoDB
connectDB();

const app = express();

// ── CORS Configuration ──
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL, // Add this for production!
].filter(Boolean);
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        /^https:\/\/.*\.vercel\.app$/.test(origin) ||
        /^https:\/\/.*\.netlify\.app$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Request Logging Middleware ──
app.use(logger);

// ── Apply general rate limiter ──
app.use(generalLimiter);

// ── Root and Health Routes ──
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Vehicle Bookings API is running",
    version: "1.0.0",
    endpoints: "/api/v1/bookings",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/version", (req, res) => {
  res.status(200).json({
    success: true,
    version: "1.0.0",
    node: process.version,
    environment: process.env.NODE_ENV || "development",
  });
});

// ── HEAD Routes ──
app.head("/bookings", (req, res) => res.status(200).end());
app.head("/bookings/:bookingId", (req, res) => res.status(200).end());
app.head("/stats/total-bookings", (req, res) => res.status(200).end());
app.head("/auth/me", (req, res) => res.status(200).end());
app.head("/health", (req, res) => res.status(200).end());

// ── API Routes ──
// Apply specific rate limiters to specific endpoints
app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/search", searchLimiter, searchRoutes);
app.use("/api/v1/admin", adminLimiter, adminRoutes);

// General routes
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/stats", statsRoutes);
app.use("/api/v1/jwt", jwtRoutes);
app.use("/api/v1/protected", protectedRoutes);
// Pagination routes cover /customers, /vehicles, /success-rides, etc.
app.use("/api/v1", paginationRoutes);

// ── Error handler middleware (must be last) ──
app.use(errorHandler);

// ── Start server ──
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
