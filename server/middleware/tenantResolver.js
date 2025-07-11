// src/middleware/tenantResolver.js
const config = require('../config');
const companyConfigService = require('../services/companyConfigService');
const CustomError = require('../utils/customError');

/**
 * Middleware to resolve the tenant based on the request's subdomain.
 * Attaches the complete company configuration (including APS credentials and MongoDB URI) to `req`.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function.
 */
const tenantResolver = async (req, res, next) => {
  try {
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

    if (!subdomain) {
      // For the main domain or requests without a specific tenant subdomain,
      // we don't necessarily have a tenant context.
      // We explicitly set req.companyConfig to null and allow routes to handle it.
      req.companyConfig = null;
      return next();
    }

    // Fetch company configuration directly
    const companyConfig = await companyConfigService.getCompanyConfigBySubdomain(subdomain);

    if (!companyConfig) {
      throw new CustomError(`Tenant with subdomain '${subdomain}' not found.`, 404);
    }

    // Attach the complete company config to the request object
    // This now includes aps_client_id, aps_client_secret, aps_callback_url, mongodb_uri
    req.companyConfig = companyConfig;
    next();
  } catch (error) {
    next(error); // Pass error to the error handling middleware
  }
};

module.exports = tenantResolver;