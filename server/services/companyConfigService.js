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


/**
 * Retrieves a company's configuration by subdomain.
 * @param {string} subdomain - The subdomain of the company.
 * @returns {Promise<Object|null>} - The company configuration object (including APS credentials and MongoDB URI) or null if not found.
 */
const getCompanyConfigBySubdomain = async (subdomain) => {
  try {
    const result = await pg.query(
      `SELECT name, subdomain, aps_client_id, aps_client_secret, aps_callback_url, mongodb_uri, hub_id, created_at, updated_at, logo_url, background_img_url, description
       FROM company_configs
       WHERE subdomain = $1`,
      [subdomain]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error(`Error fetching company config by subdomain '${subdomain}':`, error);
    throw new CustomError('Database error fetching company configuration.', 500);
  }
};

/**
 * Retrieves a company's configuration by its internal database ID.
 * @param {number} companyId - The ID of the company.
 * @returns {Promise<Object|null>} - The company configuration object (including APS credentials and MongoDB URI) or null if not found.
 */
const getCompanyConfigById = async (companyId) => {
  try {
    const result = await pg.query(
      `SELECT name, subdomain, aps_client_id, aps_client_secret, aps_callback_url, mongodb_uri, hub_id, created_at, updated_at, logo_url, background_img_url, description
       FROM company_configs
       WHERE id = $1`,
      [companyId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error(`Error fetching company config by ID '${companyId}':`, error);
    throw new CustomError('Database error fetching company configuration.', 500);
  }
};

/**
 * Creates a new company configuration.
 * This should typically be done as part of an onboarding process.
 * @param {Object} companyData - Object containing name, subdomain, aps_client_id, aps_client_secret, aps_callback_url, mongodb_uri.
 * @returns {Promise<Object>} - The newly created company config.
 */
const createCompanyConfig = async ({ name, subdomain, aps_client_id, aps_client_secret, aps_callback_url, mongodb_uri, hub_id, logo_url, background_img_url, description }) => {
  try {
    const result = await pg.query(
      `INSERT INTO company_configs (name, subdomain, aps_client_id, aps_client_secret, aps_callback_url, mongodb_uri, hub_id, logo_url, background_img_url, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, company_uuid, name, subdomain, aps_client_id, aps_client_secret, aps_callback_url, mongodb_uri, hub_id, logo_url, background_img_url, description`,
      [name, subdomain, aps_client_id, aps_client_secret, aps_callback_url, mongodb_uri, hub_id, logo_url, background_img_url, description]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating company configuration:', error);
    if (error.code === '23505') { // Unique violation error code
      if (error.constraint === 'company_configs_subdomain_key') {
        throw new CustomError(`Company with subdomain '${subdomain}' already exists.`, 409);
      }
      if (error.constraint === 'company_configs_company_uuid_key') {
        throw new CustomError(`A company with this UUID already exists (unexpected collision).`, 409);
      }
    }
    throw new CustomError('Database error creating company configuration.', 500);
  }
};

module.exports = {
  getCompanyConfigBySubdomain,
  getCompanyConfigById,
  createCompanyConfig,
};