// src/middleware/errorHandler.js
const CustomError = require('../utils/customError');
const config = require('../config');

/**
 * Global error handling middleware for Express.
 * @param {Error} err - The error object.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function.
 */
const errorHandler = (err, req, res, next) => {
  console.error('--- Error Handler ---');
  console.error(`Path: ${req.path}`);
  console.error(err); // Log the full error for debugging

  // Check if headers have already been sent. This prevents "Cannot set headers after they are sent" errors.
  if (res.headersSent) {
    return next(err); // If headers already sent, pass to next middleware (usually default Express error handler)
  }

  if (err instanceof CustomError && err.statusCode === 404 && err.message.includes('Tenant with subdomain')) {
    const protocol = req.protocol;
    const mainDomain = config.mainDomain; 
    const redirectUrl = `${protocol}://${mainDomain}/404`;
    return res.redirect(redirectUrl);
  }


  // In production, avoid sending sensitive error details to the client
  const response = {
    status: 'error',
    message: process.env.NODE_ENV === 'production' && statusCode === 500 ? 'An internal server error occurred.' : message,
  };

  res.status(statusCode).json(response);
};

module.exports = errorHandler;