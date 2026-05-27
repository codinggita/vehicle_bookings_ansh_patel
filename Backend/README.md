# Vehicle Bookings API

A full-stack backend REST API for managing vehicle booking data built with Node.js, Express.js, and MongoDB.

---

## Features

- **Full CRUD operations** for bookings
- **117+ REST API endpoints**
- **JWT-based authentication & authorization**
- **Role-Based Access Control (RBAC)** – admin/user roles
- **Advanced MongoDB aggregation pipelines**
- **Dynamic filtering, sorting, and pagination**
- **Advanced search with regex** (case-insensitive)
- **Request validation middleware**
- **Rate limiting** for API security
- **Soft delete** feature
- **Request logging** with timestamps
- **Global error handling** with async wrapper
- **Database seeding** from JSON dataset (18,289 records)
- **Health check & version** endpoints
- **Postman-ready** API structure

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **Node.js** | Runtime environment |
| **Express.js (v5)** | Web framework |
| **MongoDB** | NoSQL database |
| **Mongoose ODM** | MongoDB object modeling |
| **JSON Web Tokens** (`jsonwebtoken`) | Authentication |
| **bcryptjs** | Password hashing |
| **express-rate-limit** | Rate limiting |
| **cors** | Cross-origin resource sharing |
| **dotenv** | Environment variable management |

---

## Project Structure

```
Vehicle_Bookings/
├── config/
│   └── db.js                    # MongoDB connection
├── controllers/
│   ├── auth.controller.js       # Auth handlers
│   ├── booking.controller.js    # Booking CRUD + advanced
│   ├── pagination.controller.js # Paginated endpoints
│   ├── search.controller.js     # Search handlers
│   └── stats.controller.js      # Statistics handlers
├── data/
│   └── vehicle_bookings.json    # Raw dataset
├── middlewares/
│   ├── auth.js                  # JWT protect & authorize
│   ├── errorHandler.js          # Global error handler
│   ├── logger.js                # Request logging
│   ├── rateLimiter.js           # Rate limiting
│   └── validate.js              # Input validation
├── models/
│   ├── booking.model.js         # Booking schema
│   └── user.model.js            # User schema (auth)
├── routes/
│   ├── admin.routes.js          # Admin-protected routes
│   ├── auth.routes.js           # Auth routes
│   ├── booking.routes.js        # Core booking routes
│   ├── jwt.routes.js            # JWT routes
│   ├── pagination.routes.js     # Paginated entity routes
│   ├── protected.routes.js      # Protected routes
│   ├── search.routes.js         # Search routes
│   └── stats.routes.js          # Statistics routes
├── scripts/
│   ├── backup.js                # Database backup script
│   ├── seed.js                  # Dataset seeder
│   └── test_new_api.js          # API test script
├── services/
│   ├── auth.service.js          # Auth business logic
│   ├── booking.service.js       # Booking business logic
│   ├── search.service.js        # Search business logic
│   └── stats.service.js         # Stats business logic
├── utils/
│   └── paginate.js              # Reusable pagination utility
├── .env                         # Environment variables
├── .gitignore
├── package.json
├── README.md
└── server.js                    # Entry point
```

---

## Getting Started

### Prerequisites

- **Node.js** (v18+)
- **MongoDB** (running locally or Atlas URI)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd Vehicle_Bookings

# Install dependencies
npm install

# Configure environment variables
# Create .env file with:
MONGO_URI=mongodb://localhost:27017/vehicle_bookings
PORT=5000
JWT_SECRET=vehicle_bookings_jwt_secret_key_2024
NODE_ENV=development
```

### Seed the Database

```bash
npm run seed
```

### Start the Server

```bash
# Development
npm run dev

# Production
npm start
```

---

## API Endpoints Overview

### Authentication (`/api/v1/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register a new user |
| POST | `/login` | Login user |
| POST | `/logout` | Logout user |
| POST | `/forgot-password` | Request password reset |
| POST | `/reset-password` | Reset password |
| POST | `/refresh-token` | Refresh JWT token |
| GET | `/me` | Get current user profile |
| DELETE | `/account` | Delete user account |

---

### Bookings (`/api/v1/bookings`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all bookings (with filters, sort, pagination) |
| GET | `/:bookingId` | Get booking by ID |
| POST | `/` | Create new booking |
| PUT | `/:bookingId` | Replace booking |
| PATCH | `/:bookingId/status` | Update status |
| PATCH | `/:bookingId/payment` | Update payment |
| PATCH | `/:bookingId/rating` | Update rating |
| PATCH | `/:bookingId/fare` | Update fare |
| PATCH | `/:bookingId/distance` | Update distance |
| PATCH | `/:bookingId/location` | Update location |
| DELETE | `/:bookingId` | Delete booking |
| DELETE | `/delete-all` | Delete all bookings |
| POST | `/bulk-insert` | Bulk insert bookings |

---

### Route Parameters

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/status/:status` | By status |
| GET | `/customer/:customerId` | By customer |
| GET | `/vehicle/:vehicleType` | By vehicle type |
| GET | `/payment/:method` | By payment |
| GET | `/pickup/:location` | By pickup |
| GET | `/drop/:location` | By drop |
| GET | `/date/:date` | By date |
| GET | `/time/:time` | By time |
| GET | `/rating/driver/:rating` | By driver rating |
| GET | `/rating/customer/:rating` | By customer rating |
| GET | `/distance/:distance` | By distance |
| ... | ... | 20+ more route parameter endpoints |

---

### Query Parameters

Use query parameters for dynamic filtering, sorting, field selection, and pagination:

```
GET /api/v1/bookings?status=Success&vehicle=Mini&sort=-bookingValue&page=1&limit=10&fields=bookingId,bookingValue
```

| Parameter | Description | Example |
|-----------|-------------|---------|
| `status` | Filter by booking status | `?status=Success` |
| `vehicle` | Filter by vehicle type | `?vehicle=Mini` |
| `sort` | Sort results (prefix `-` for descending) | `?sort=-bookingValue` |
| `page` | Page number for pagination | `?page=2` |
| `limit` | Results per page | `?limit=10` |
| `fields` | Select specific fields | `?fields=bookingId,bookingValue` |

---

### Search (`/api/v1/search`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/?keyword=...` | Search across all fields |
| GET | `/bookings` | Search by booking ID |
| GET | `/customers` | Search by customer ID |
| GET | `/payment` | Search by payment method |
| GET | `/vehicle` | Search by vehicle type |
| GET | `/location` | Search by location |
| GET | `/cancel-reason` | Search cancel reasons |
| GET | `/incomplete` | Search incomplete reasons |
| GET | `/rating` | Search by rating |

---

### Statistics (`/api/v1/stats`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/total-bookings` | Total booking count |
| GET | `/success-rides` | Success ride count |
| GET | `/cancelled-rides` | Cancelled ride count |
| GET | `/incomplete-rides` | Incomplete ride count |
| GET | `/driver-not-found` | Driver not found count |
| GET | `/total-customers` | Unique customer count |
| GET | `/top-vehicle` | Most booked vehicle |
| GET | `/top-payment-method` | Most used payment |
| GET | `/highest-fare` | Highest fare booking |
| GET | `/lowest-fare` | Lowest fare booking |

---

### Advanced Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bookings/top/highest-fare` | Top 10 highest fares |
| GET | `/bookings/top/lowest-fare` | Top 10 lowest fares |
| GET | `/bookings/recent` | Recent 20 bookings |
| GET | `/bookings/latest` | Latest single booking |
| GET | `/bookings/random` | 10 random bookings |
| GET | `/bookings/trending` | Trending vehicle types |
| GET | `/bookings/summary/ai` | AI-generated summary |
| GET | `/health` | Health check |
| GET | `/version` | API version |

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | – |
| `PORT` | Server port | `5000` |
| `JWT_SECRET` | JWT signing secret | `vehicle_bookings_jwt_secret_key_2024` |
| `NODE_ENV` | Environment (`development` / `production`) | `development` |

---

## Dataset

The project uses a JSON dataset of **18,289** vehicle booking records with the following fields:

- **Booking ID** – Unique booking identifier
- **Date** – Booking date
- **Time** – Booking time
- **Status** – Booking status (Success, Cancelled, etc.)
- **Customer ID** – Unique customer identifier
- **Vehicle Type** – Type of vehicle booked
- **Pickup Location** – Pickup address
- **Drop Location** – Drop-off address
- **Booking Value** – Fare amount
- **Ride Distance** – Distance of the ride
- **Payment Method** – Payment type used
- **Driver Rating** – Rating given to the driver
- **Customer Rating** – Rating given to the customer
- **TAT Metrics** – Turn-around time metrics
- **Cancellation Reasons** – Reason for cancellation (if applicable)

---

## License

ISC
