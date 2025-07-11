// src/services/companyConfigService.js
const pg = require('../db/postgres');
const CustomError = require('../utils/customError');

/**
 * Retrieves a company's configuration by subdomain.
 * @returns {Promise<Object} - The non sensitive company data.
 */
const getCompanys = async () => {
  try {
    const result = await pg.query(
      `SELECT name, subdomain, logo_url, background_img_url, description
       FROM company_configs`,
    );
    return result.rows || null;
  } catch (error) {
    console.error(`Error fetching company config by subdomain '${subdomain}':`, error);
    throw new CustomError('Database error fetching company configuration.', 500);
  }
};

module.exports = {
  getCompanys,
}