// src/controllers/companyController.js
const companyDataService = require('../services/companyDataService');
const CustomError = require('../utils/customError');

/**
 * Fetches example company-specific data from the tenant's MongoDB instance.
 */
const getAllCompanyData = async (req, res, next) => {
  try {
    // Example: Fetch all "projects" for this company from their MongoDB
    const projects = await companyDataService.getCompanys();

    res.json({
      status: 'success',
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

const getOneCompanyData = async (req, res, next) => {
  if (!req.companyConfig) {
        // This should ideally not happen if tenantResolver is working, but as a fallback
        return next(new CustomError('Company configuration not found for this subdomain.', 404));
    }
    // Destructure only the public, non-sensitive fields
    const { id, company_uuid, name, subdomain, logo_url, background_img_url, description } = req.companyConfig;
    // console.log(req.companyConfig)
    res.json({ id, company_uuid, name, subdomain, logo_url, background_img_url, description });
}

module.exports = {
  getAllCompanyData,
  getOneCompanyData,
};