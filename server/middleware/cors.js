// src/middleware/cors.js
const cors = require('cors');
const config = require('../config');

// Define allowed origins. This can be extended to fetch from a DB for custom domains.
const allowedOrigins = [
  `http://localhost:${config.port}`, // For your own backend's origin if needed
  `http://localhost:5173`, // Vite frontend dev port
  `http://localhost:8080`, // Vite frontend dev port

  `http://*.localhost:5173`, // Wildcard for Vite frontend dev port
  `http://*.localhost:8080`, // Wildcard for Vite frontend dev port

  `https://*.${config.mainDomain}`, // Wildcard for production subdomains
  `http://*.${config.mainDomain}`, // Wildcard for HTTP in dev/local (if applicable)
  `https://${config.mainDomain}`, // Main domain itself
  `http://${config.mainDomain}`, // Main domain itself for HTTP
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if the origin exactly matches any allowed origin
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Check for wildcard subdomain matches
    const isWildcardMatch = allowedOrigins.some(allowed => {
      if (allowed.startsWith('http://*.') || allowed.startsWith('https://*.')) {
        const domainSuffix = allowed.substring(allowed.indexOf('*.') + 2); // e.g., 'yourdomain.com'
        return origin.endsWith(`.${domainSuffix}`) && origin.startsWith(allowed.substring(0, allowed.indexOf('*'))); // e.g., 'https://'
      }
      return false;
    });

    if (isWildcardMatch) {
      return callback(null, true);
    }

    console.warn(`CORS: Origin ${origin} not allowed.`);
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true, // Allow cookies to be sent
  optionsSuccessStatus: 200, // For preflight requests
};

module.exports = cors(corsOptions);