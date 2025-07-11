// src/utils/jwt.js
const jwt = require('jsonwebtoken');
const config = require('../config');

const JWT_SECRET = config.jwtSecret;
const JWT_EXPIRATION = '14d'; // Token expires in 7 days

/**
 * Generates a new JWT token.
 * @param {Object} payload - The data to include in the token (e.g., { autodeskId, companyId }).
 * @returns {string} - The signed JWT token.
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
};

/**
 * Verifies a JWT token.
 * @param {string} token - The JWT token to verify.
 * @returns {Object} - The decoded payload if valid, throws error otherwise.
 */
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken,
};