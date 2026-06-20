const axios = require('axios');

const BASE_URL = 'http://localhost:5000/health';

async function runTests() {
  console.log('====================================');
  console.log('RUNNING SYSTEM HEALTH CHECK');
  console.log('====================================');

  try {
    const res = await axios.get(BASE_URL);
    if (res.data.success) {
      console.log('✅ API Health Check Passed!');
      console.log('Uptime:', res.data.uptime);
      console.log('Timestamp:', res.data.timestamp);
      console.log('====================================');
      console.log('All tests completed successfully! (1 passed)');
      process.exit(0);
    } else {
      console.error('❌ Health check returned failure state');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Health check request failed:', error.message);
    console.error('Is the backend server running on port 5000? Use npm run dev to start it.');
    process.exit(1);
  }
}

runTests();
