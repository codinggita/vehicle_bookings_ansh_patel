/**
 * @desc Request Logging Middleware
 * Logs every incoming request with method, URL, and timestamp.
 * In development mode, also logs request body and query params.
 */
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;

  // Basic log for all environments
  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);

  // Debug mode: detailed logging only in development
  if (process.env.NODE_ENV === 'development') {
    if (Object.keys(req.query).length > 0) {
      console.log(`  Query: ${JSON.stringify(req.query)}`);
    }
    if (req.body && Object.keys(req.body).length > 0) {
      // Don't log passwords
      const safeBody = { ...req.body };
      if (safeBody.password) safeBody.password = '***HIDDEN***';
      console.log(`  Body: ${JSON.stringify(safeBody)}`);
    }
  }

  // Track response time
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log(`  Response: ${res.statusCode} (${duration}ms)`);
    }
  });

  next();
};

module.exports = logger;
