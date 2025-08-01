// src/middleware/auth.js
const jwt = require('../utils/jwt');
const CustomError = require('../utils/customError');
const config = require('../config');
const userService = require('../services/userService'); // Assuming this service exists and works with autodeskId

/**
 * Middleware to verify the internal JWT token.
 * Attaches user's autodeskId and potentially other user details (from PostgreSQL) to `req.user`.
 * The company context (`req.companyConfig`) is expected to be set by the `tenantResolver` middleware,
 * which should run BEFORE this middleware for routes requiring tenant-specific data.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function.
 */
const authenticateJWT = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (token && token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
    } else if (req.cookies && req.cookies.jwt) {
      // Assuming JWT is stored in an HTTP-only cookie named 'jwt'
      token = req.cookies.jwt;
    }

    if (!token) {
      throw new CustomError('Authentication token missing.', 401);
    }

    const decoded = jwt.verifyToken(token);

    // *** CRITICAL CHANGE HERE: Only check for autodeskId in the decoded payload ***
    if (!decoded || !decoded.autodeskId) {
      throw new CustomError('Invalid token payload: Autodesk ID missing.', 401);
    }

    const host = req.headers.host; // e.g., 'tenant1.yourdomain.com:8080' or 'localhost:8080'
    const hostname = host.split(':')[0]; // Remove port if present

    const mainDomainParts = config.mainDomain.split('.');
    const hostnameParts = hostname.split('.');

    let subdomain = '';

    if (hostnameParts.length > mainDomainParts.length) {
      subdomain = hostnameParts.slice(0, hostnameParts.length - mainDomainParts.length).join('.');
    } else if (hostnameParts.length === mainDomainParts.length && hostname === config.mainDomain) {
      subdomain = '';
    } else {
      subdomain = '';
    }

    if (decoded.tenant !== subdomain) {
      console.warn(`Tenant mismatch: JWT says '${decoded.tenant}', request is for '${subdomain}'`);
      throw new CustomError('Tenant mismatch in authentication token. Please log in again.', 403);
    }

    // Optionally, fetch full user details from your central PostgreSQL DB using the autodeskId
    // This step confirms that the autodeskId in the JWT corresponds to an existing user in your system.
    const user = await userService.getUserByAutodeskId(decoded.autodeskId, subdomain);

    if (!user) {
      // If the user's autodeskId from the JWT isn't found in your central user database
      throw new CustomError('Authenticated user not found in our records. Please log in again.', 401);
    }

    // Attach user information to the request object for subsequent middleware/handlers.
    // It's generally good practice to attach all relevant user data here.
    req.user = {
      autodeskId: decoded.autodeskId,
      ...user
    };

    // Note: req.companyConfig is expected to be set by `tenantResolver`
    // for routes that need the current tenant's context (e.g., MongoDB URI).

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    // Handle specific JWT-related errors
    if (error.name === 'TokenExpiredError') {
      return next(new CustomError('Authentication token expired. Please log in again.', 401));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new CustomError('Invalid authentication token. Please log in again.', 401));
    }

    // If it's a CustomError we explicitly threw (e.g., token missing, invalid payload, user not found)
    if (error instanceof CustomError) {
      // Optionally clear cookie if token is invalid or user is not found,
      // forcing re-login on the client side.
      if (req.cookies && req.cookies.jwt) {
        res.clearCookie('jwt');
      }
      return next(error);
    }

    // Log unexpected errors and return a generic error message
    console.error('Unexpected error in authenticateJWT middleware:', error);
    return next(new CustomError('Authentication failed due to an unexpected server error.', 500));
  }
};

module.exports = {
  authenticateJWT,
};