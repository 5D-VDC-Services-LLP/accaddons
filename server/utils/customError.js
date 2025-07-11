// src/utils/CustomError.js
class CustomError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = this.constructor.name; // Set the name of the error class
    this.statusCode = statusCode;
    // Capture the stack trace for better debugging
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = CustomError;