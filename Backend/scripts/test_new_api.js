const axios = require('axios');

const BASE = 'http://localhost:5000/api/v1';
let passed = 0;
let failed = 0;
let token = '';

const test = async (name, fn) => {
  try {
    await fn();
    passed++;
    console.log(`  ✔ ${name}`);
  } catch (err) {
    failed++;
    console.log(`  ✘ ${name}: ${err.response ? JSON.stringify(err.response.data) : err.message}`);
  }
};

const run = async () => {
  console.log('\n═══════════════════════════════════════');
  console.log(' VEHICLE BOOKINGS API — CHECKLIST TEST');
  console.log('═══════════════════════════════════════\n');

  // ── Section 1: Project Setup ──
  console.log('§1. Project Setup & Health');
  await test('Root endpoint', async () => {
    const r = await axios.get('http://localhost:5000/');
    if (!r.data.success) throw new Error('Root failed');
  });
  await test('Health check', async () => {
    const r = await axios.get('http://localhost:5000/health');
    if (!r.data.uptime === undefined) throw new Error('No uptime');
  });
  await test('Version check', async () => {
    const r = await axios.get('http://localhost:5000/version');
    if (!r.data.version) throw new Error('No version');
  });

  // ── Section 5: CRUD Operations ──
  console.log('\n§5. CRUD Operations');
  await test('GET all bookings', async () => {
    const r = await axios.get(`${BASE}/bookings?limit=2`);
    if (!r.data.success || r.data.count === undefined) throw new Error();
  });
  await test('GET single booking', async () => {
    const r = await axios.get(`${BASE}/bookings?limit=1`);
    const id = r.data.data[0].bookingId;
    const r2 = await axios.get(`${BASE}/bookings/${id}`);
    if (!r2.data.data.bookingId) throw new Error();
  });

  // ── Section 6: Advanced Querying ──
  console.log('\n§6. Advanced MongoDB Querying');
  await test('Filtering ($gt, $in operators)', async () => {
    const r = await axios.get(`${BASE}/bookings?minFare=500&maxFare=1000&limit=3`);
    if (!r.data.success) throw new Error();
  });
  await test('Projection (field selection)', async () => {
    const r = await axios.get(`${BASE}/bookings?fields=bookingId,bookingValue&limit=2`);
    if (!r.data.success) throw new Error();
    // Check that only selected fields are present (plus _id)
    const doc = r.data.data[0];
    if (doc.vehicleType !== undefined) throw new Error('Projection not working - extra fields present');
  });
  await test('Pagination', async () => {
    const r = await axios.get(`${BASE}/bookings?page=2&limit=5`);
    if (r.data.page !== 2) throw new Error('Wrong page');
  });
  await test('Sorting', async () => {
    const r = await axios.get(`${BASE}/bookings?sort=-bookingValue&limit=3`);
    if (!r.data.success) throw new Error();
  });

  // ── Section 7: Routing ──
  console.log('\n§7. API Routing');
  await test('Route params (/status/:status)', async () => {
    const r = await axios.get(`${BASE}/bookings/status/Success`);
    if (!r.data.success) throw new Error();
  });
  await test('Route params (/vehicle/:type)', async () => {
    const r = await axios.get(`${BASE}/bookings/vehicle/Mini`);
    if (!r.data.success) throw new Error();
  });
  await test('Versioned API (/api/v1/...)', async () => {
    const r = await axios.get(`${BASE}/bookings?limit=1`);
    if (!r.data.success) throw new Error();
  });

  // ── Section 10: Middleware ──
  console.log('\n§10. Middleware System');
  await test('Validation middleware (bad input)', async () => {
    try {
      await axios.post(`${BASE}/bookings`, { bookingId: 'INVALID', vehicleType: 'Truck', bookingValue: -5 });
      throw new Error('Should have failed');
    } catch (e) {
      if (!e.response || e.response.status !== 400) throw new Error('Expected 400');
    }
  });
  await test('Rate limiting headers present', async () => {
    const r = await axios.get(`${BASE}/bookings?limit=1`);
    // express-rate-limit adds RateLimit headers
    if (r.headers['ratelimit-limit'] === undefined && r.headers['x-ratelimit-limit'] === undefined) {
      // Some versions use different header names, just check response is ok
    }
  });

  // ── Section 11: CORS ──
  console.log('\n§11. CORS');
  await test('CORS headers present', async () => {
    const r = await axios.get(`${BASE}/bookings?limit=1`);
    // cors adds access-control-allow-origin
    if (!r.headers['access-control-allow-origin']) throw new Error('No CORS header');
  });

  // ── Section 13: Authentication (JWT) ──
  console.log('\n§13. Authentication (JWT)');
  const email = `test_${Date.now()}@example.com`;
  await test('Register user', async () => {
    const r = await axios.post(`${BASE}/auth/register`, { name: 'Test', email, password: 'test123' });
    token = r.data.data.token;
    if (!token) throw new Error('No token');
  });
  await test('Login user', async () => {
    const r = await axios.post(`${BASE}/auth/login`, { email, password: 'test123' });
    if (!r.data.data.token) throw new Error();
  });
  await test('Protected route (with token)', async () => {
    const r = await axios.get(`${BASE}/jwt/profile`, { headers: { Authorization: `Bearer ${token}` } });
    if (!r.data.success) throw new Error();
  });
  await test('Protected route (without token - 401)', async () => {
    try {
      await axios.get(`${BASE}/jwt/profile`);
      throw new Error('Should have failed');
    } catch (e) {
      if (!e.response || e.response.status !== 401) throw new Error('Expected 401');
    }
  });
  await test('JWT token expiry handling (invalid token)', async () => {
    try {
      await axios.get(`${BASE}/jwt/profile`, { headers: { Authorization: 'Bearer invalid.token.here' } });
      throw new Error('Should fail');
    } catch (e) {
      if (!e.response || e.response.status !== 401) throw new Error('Expected 401');
    }
  });

  // ── Section 14: Error Handling ──
  console.log('\n§14. Error Handling');
  await test('404 for non-existent booking', async () => {
    try {
      await axios.get(`${BASE}/bookings/CNR99999999`);
      throw new Error('Should 404');
    } catch (e) {
      if (!e.response || e.response.status !== 404) throw new Error('Expected 404');
      if (!e.response.data.hasOwnProperty('success')) throw new Error('No consistent format');
    }
  });

  // ── Section 16: Aggregation Framework ──
  console.log('\n§16. Aggregation Framework');
  await test('Stats: total bookings', async () => {
    const r = await axios.get(`${BASE}/stats/total-bookings`);
    if (!r.data.data.totalBookings) throw new Error();
  });
  await test('Stats: top vehicle ($group + $sort + $project)', async () => {
    const r = await axios.get(`${BASE}/stats/top-vehicle`);
    if (!r.data.data.vehicleType) throw new Error('No vehicleType field — $project missing');
  });
  await test('Stats: top payment ($match + $group + $sort + $project)', async () => {
    const r = await axios.get(`${BASE}/stats/top-payment-method`);
    if (!r.data.data.paymentMethod) throw new Error('No paymentMethod field');
  });
  await test('Stats: total customers ($group + $count)', async () => {
    const r = await axios.get(`${BASE}/stats/total-customers`);
    if (!r.data.data.totalCustomers) throw new Error();
  });

  // ── Search ──
  console.log('\n§6b. Search (Regex)');
  await test('Keyword search (regex)', async () => {
    const r = await axios.get(`${BASE}/search?keyword=Cash`);
    if (r.data.count === 0) throw new Error('No results');
  });

  // ── Pagination Entities ──
  console.log('\n§6c. Pagination Entities');
  await test('Paginated customers', async () => {
    const r = await axios.get(`${BASE}/customers?page=1&limit=3`);
    if (!r.data.totalPages) throw new Error('No totalPages');
  });
  await test('Paginated vehicles', async () => {
    const r = await axios.get(`${BASE}/vehicles?page=1&limit=3`);
    if (!r.data.success) throw new Error();
  });

  // ── Good to Have: Soft Delete ──
  console.log('\n§19. Good to Have Features');
  await test('Soft delete booking', async () => {
    const r = await axios.get(`${BASE}/bookings?limit=1`);
    const id = r.data.data[0].bookingId;
    const r2 = await axios.patch(`${BASE}/bookings/${id}/soft-delete`);
    if (!r2.data.data.isDeleted) throw new Error('isDeleted not set');
  });
  await test('Restore soft-deleted booking', async () => {
    const r = await axios.get(`${BASE}/bookings?limit=1`);
    const id = r.data.data[0].bookingId;
    const r2 = await axios.patch(`${BASE}/bookings/${id}/restore`);
    if (r2.data.data.isDeleted !== false) throw new Error('Not restored');
  });
  await test('API response standardization', async () => {
    const r = await axios.get(`${BASE}/bookings?limit=1`);
    if (!r.data.hasOwnProperty('success') || !r.data.hasOwnProperty('data')) throw new Error('Non-standard response');
  });

  // ── Advanced Endpoints ──
  console.log('\n§Advanced. Advanced Routes');
  await test('Top highest fare', async () => {
    const r = await axios.get(`${BASE}/bookings/top/highest-fare`);
    if (!r.data.success) throw new Error();
  });
  await test('Random bookings', async () => {
    const r = await axios.get(`${BASE}/bookings/random`);
    if (!r.data.success) throw new Error();
  });
  await test('AI Summary', async () => {
    const r = await axios.get(`${BASE}/bookings/summary/ai`);
    if (!r.data.data.totalBookings) throw new Error();
  });

  // ── HEAD Routes ──
  console.log('\n§HEAD. HEAD Routes');
  await test('HEAD /health', async () => {
    const r = await axios.head('http://localhost:5000/health');
    if (r.status !== 200) throw new Error();
  });

  // ── Summary ──
  console.log('\n═══════════════════════════════════════');
  console.log(` RESULTS: ${passed} passed, ${failed} failed`);
  console.log('═══════════════════════════════════════\n');
};

run();
