// src/routes/companyRoutes.js
const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController'); // Import the controller
const tenantResolver = require('../middleware/tenantResolver')

/**
 * @route GET /company/data
 * @description Fetches example company-specific data from the tenant's MongoDB instance.
 * @access Private (requires JWT) and Tenant-specific
 */
router.get('/data', companyController.getAllCompanyData);

// NEW: Endpoint to get public company details for the landing page
// tenantResolver middleware ensures req.companyConfig is available.
router.get('/details', tenantResolver, companyController.getOneCompanyData);

module.exports = router;