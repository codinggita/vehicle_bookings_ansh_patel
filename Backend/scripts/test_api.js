const http = require("http");

const tests = [
  { name: "Root", path: "/" },
  { name: "Get Booking by ID", path: "/api/v1/bookings/id/CNR7153255142" },
  { name: "Status: Success", path: "/api/v1/bookings/status/Success" },
  { name: "Vehicle: Bike", path: "/api/v1/bookings/vehicle/Bike" },
  { name: "Payment: UPI", path: "/api/v1/bookings/payment/UPI" },
  { name: "Query: vehicle=Auto", path: "/api/v1/bookings?vehicle=Auto" },
  { name: "Pickup: Indiranagar", path: "/api/v1/bookings/pickup/Indiranagar" },
  { name: "Year: 2024", path: "/api/v1/bookings/year/2024" },
  { name: "Incomplete: Yes", path: "/api/v1/bookings/incomplete/Yes" },
];

const makeRequest = (test) => {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:5000${test.path}`, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          const count = json.count !== undefined ? json.count : "N/A";
          console.log(`✅ ${test.name} => status: ${res.statusCode}, count: ${count}`);
        } catch {
          console.log(`✅ ${test.name} => status: ${res.statusCode}, response OK`);
        }
        resolve();
      });
    });
    req.on("error", (err) => {
      console.log(`❌ ${test.name} => ERROR: ${err.message}`);
      resolve();
    });
    req.setTimeout(10000, () => {
      console.log(`❌ ${test.name} => TIMEOUT`);
      req.destroy();
      resolve();
    });
  });
};

(async () => {
  console.log("=== Vehicle Bookings API Test Suite ===\n");
  for (const test of tests) {
    await makeRequest(test);
  }
  console.log("\n=== Tests Complete ===");
})();
