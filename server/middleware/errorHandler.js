// src/middleware/errorHandler.js
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

  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred.';

  // In production, avoid sending sensitive error details to the client
  const response = {
    status: 'error',
    message: process.env.NODE_ENV === 'production' && statusCode === 500 ? 'An internal server error occurred.' : message,
  };

  res.status(statusCode).json(response);
};

module.exports = errorHandler;