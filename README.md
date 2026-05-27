# 🚗 Vehicle Bookings

A production-grade full-stack application for managing and analyzing vehicle booking data — built with **Node.js**, **Express.js**, and **MongoDB**.

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Dataset Information](#-dataset-information)
- [Environment Variables](#-environment-variables)
- [Scripts Reference](#-scripts-reference)
- [License](#-license)

---

## 🎯 About the Project

**Vehicle Bookings** is a comprehensive backend REST API system designed for a ride-hailing platform. It processes, stores, and serves analytical insights from a real-world dataset of **18,289 vehicle booking records** from Bangalore, India.

The API supports full CRUD lifecycle management, advanced MongoDB aggregation analytics, JWT-secured authentication with role-based access control, regex-powered search, and paginated entity views — all structured following a clean **MVC + Service Layer** architecture.

---

## ✨ Features

### Core Operations
- 🔄 **Full CRUD** — Create, Read, Update (PUT/PATCH), and Delete bookings
- 🗑️ **Soft Delete & Restore** — Non-destructive deletion with recovery support
- 📦 **Bulk Operations** — Insert and delete multiple records in a single request

### Querying & Filtering
- 🔍 **117+ REST API Endpoints** — Comprehensive route coverage
- 🎯 **Dynamic Filtering** — Filter by status, vehicle type, payment, location, ratings, and more
- 📊 **Sorting & Pagination** — Server-side sorting with cursor-based pagination
- 📐 **Field Projection** — Select only the fields you need in the response
- 🔎 **Regex Search** — Case-insensitive keyword search across multiple fields simultaneously

### Analytics & Aggregation
- 📈 **MongoDB Aggregation Pipelines** — `$group`, `$match`, `$sort`, `$project` stages
- 🏆 **Statistical Endpoints** — Top vehicles, payment splits, fare extremes, customer counts
- 🤖 **AI Summary Generation** — Auto-generated analytical summaries with computed metrics
- 📉 **Trending Analysis** — Identify trending vehicle types and ride patterns

### Security & Middleware
- 🔐 **JWT Authentication** — Secure token-based login/register system
- 🛡️ **Role-Based Access Control (RBAC)** — Admin and user role separation
- 🔒 **Password Hashing** — bcrypt-based cryptographic password storage
- 🚦 **Rate Limiting** — Tiered rate limits for auth, search, admin, and general routes
- ✅ **Request Validation** — Schema-based input validation middleware
- 📝 **Request Logging** — Timestamped HTTP request/response logging
- ⚠️ **Global Error Handling** — Centralized async error catching with consistent JSON responses

### Developer Experience
- 🌱 **Database Seeding** — One-command dataset import with automatic data sanitization
- 💾 **Database Backup** — Automated MongoDB backup utility
- 🧪 **Test Suite** — Comprehensive automated API verification (35 test cases)
- 🏥 **Health & Version Endpoints** — System status monitoring
- 🌐 **CORS Enabled** — Cross-origin request support out of the box

---

## 🛠️ Tech Stack

| Technology | Purpose |
|:---|:---|
| **Node.js** (v18+) | JavaScript runtime environment |
| **Express.js** (v5) | Web application framework |
| **MongoDB** | NoSQL document database |
| **Mongoose** (v9) | MongoDB ODM with schema validation |
| **JSON Web Tokens** | Stateless authentication |
| **bcryptjs** | Cryptographic password hashing |
| **express-rate-limit** | API request throttling |
| **cors** | Cross-origin resource sharing |
| **dotenv** | Environment variable management |

---

## 📁 Project Structure

```
Vehicle_Bookings/
│
├── Backend/
│   ├── config/
│   │   └── db.js                        # MongoDB connection manager
│   │
│   ├── controllers/
│   │   ├── auth.controller.js           # Authentication handlers
│   │   ├── booking.controller.js        # Booking CRUD + advanced handlers
│   │   ├── pagination.controller.js     # Paginated entity handlers
│   │   ├── search.controller.js         # Search handlers
│   │   └── stats.controller.js          # Statistics handlers
│   │
│   ├── data/
│   │   └── bookings.json                # Raw dataset (18,289 records)
│   │
│   ├── middlewares/
│   │   ├── auth.js                      # JWT protect & role authorize
│   │   ├── errorHandler.js              # Global error handler
│   │   ├── logger.js                    # HTTP request logger
│   │   ├── rateLimiter.js               # Tiered rate limiting
│   │   └── validate.js                  # Input validation rules
│   │
│   ├── models/
│   │   ├── booking.model.js             # Booking schema (20 fields, 7 indexes)
│   │   └── user.model.js               # User schema (auth)
│   │
│   ├── routes/
│   │   ├── admin.routes.js              # Admin-protected routes
│   │   ├── auth.routes.js               # Authentication routes
│   │   ├── booking.routes.js            # Core booking routes
│   │   ├── jwt.routes.js                # JWT utility routes
│   │   ├── pagination.routes.js         # Paginated entity routes
│   │   ├── protected.routes.js          # Protected user routes
│   │   ├── search.routes.js             # Search routes
│   │   └── stats.routes.js              # Statistics routes
│   │
│   ├── scripts/
│   │   ├── backup.js                    # Database backup utility
│   │   ├── seed.js                      # Dataset seeder
│   │   ├── test_api.js                  # Basic API tests
│   │   └── test_new_api.js              # Comprehensive test suite (35 tests)
│   │
│   ├── services/
│   │   ├── auth.service.js              # Auth business logic
│   │   ├── booking.service.js           # Booking query logic
│   │   ├── search.service.js            # Search business logic
│   │   └── stats.service.js             # Aggregation business logic
│   │
│   ├── utils/
│   │   └── paginate.js                  # Reusable pagination helper
│   │
│   ├── .env.example                     # Environment template
│   ├── .gitignore
│   ├── package.json
│   ├── README.md                        # Backend-specific documentation
│   └── server.js                        # Application entry point
│
├── Frontend/                            # Frontend (coming soon)
│
└── README.md                            # ← You are here
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher — [Download](https://nodejs.org/)
- **MongoDB** — Local instance or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster

### 1. Clone the Repository

```bash
git clone https://github.com/codinggita/vehicle_bookings_ansh_patel.git
cd vehicle_bookings_ansh_patel
```

### 2. Install Dependencies

```bash
cd Backend
npm install
```

### 3. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your values:
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/vehicle_bookings
# JWT_SECRET=your_secure_secret_key_here
# NODE_ENV=development
```

### 4. Seed the Database

```bash
npm run seed
```

This imports all **18,289** cleaned booking records into MongoDB in optimized batches.

### 5. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:5000`

### 6. Verify Installation

```bash
# Run the automated test suite
npm test
```

Expected output:
```
═══════════════════════════════════════
VEHICLE BOOKINGS API — CHECKLIST TEST
═══════════════════════════════════════

 RESULTS: 35 passed, 0 failed
═══════════════════════════════════════
```

---

## 📖 API Documentation

**Postman Documentation URL:** [https://documenter.getpostman.com/view/50841281/2sBXwmRDbN](https://documenter.getpostman.com/view/50841281/2sBXwmRDbN)

---

## 📊 Dataset Information

The project uses a real-world ride-hailing dataset from **Bangalore, India** containing **18,289** booking records.

### Schema Fields (20 attributes)

| Field | Type | Description |
|:---|:---|:---|
| `bookingId` | String | Unique booking identifier (e.g., `CNR7153255142`) |
| `date` | Date | Booking date |
| `time` | String | Booking time |
| `bookingStatus` | String | Status — `Success`, `Canceled by Driver`, `Canceled by Customer`, `Driver Not Found` |
| `customerId` | String | Customer identifier (e.g., `CID713523`) |
| `vehicleType` | String | Vehicle — `Bike`, `eBike`, `Auto`, `Mini`, `Prime Sedan`, `Prime Plus`, `Prime SUV` |
| `pickupLocation` | String | Pickup address in Bangalore |
| `dropLocation` | String | Drop-off address in Bangalore |
| `bookingValue` | Number | Fare amount in INR |
| `rideDistance` | Number | Distance in kilometers |
| `paymentMethod` | String | Payment — `Cash`, `UPI`, `Credit Card` |
| `driverRatings` | Number | Driver rating (1.0–5.0) |
| `customerRating` | Number | Customer rating (1.0–5.0) |
| `vTAT` | Number | Vehicle turnaround time (minutes) |
| `cTAT` | Number | Customer turnaround time (minutes) |
| `canceledRidesByCustomer` | String | Customer cancellation reason |
| `canceledRidesByDriver` | String | Driver cancellation reason |
| `incompleteRides` | String | Whether ride was incomplete (`Yes`/`No`) |
| `incompleteRidesReason` | String | Reason for incomplete ride |
| `vehicleImages` | String | Vehicle image reference |

---

## 🔐 Environment Variables

Create a `.env` file inside the `Backend/` directory (use `.env.example` as a template):

| Variable | Description | Required |
|:---|:---|:---:|
| `PORT` | Server port number | ✅ |
| `MONGO_URI` | MongoDB connection string (local or Atlas) | ✅ |
| `JWT_SECRET` | Secret key for signing JWT tokens | ✅ |
| `NODE_ENV` | Runtime environment (`development` / `production`) | ❌ |

---

## 📜 Scripts Reference

Run these commands from the `Backend/` directory:

| Command | Description |
|:---|:---|
| `npm start` | Start the production server |
| `npm run dev` | Start the development server |
| `npm run seed` | Seed/reset the database with 18,289 records |
| `npm run backup` | Create a MongoDB database backup |
| `npm test` | Run the automated API test suite (35 tests) |

---

## 📄 License

This project is developed for educational and assignment purposes.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/AnshPatel191207">Ansh Patel</a>
</p>
