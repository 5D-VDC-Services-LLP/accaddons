// src/services/userService.js
const pg = require('../db/postgres');
const tenantService = require('./tenantService');
const CustomError = require('../utils/customError');

/**
 * Upserts a user into both `users` and `company_users` tables.
 * Returns enriched user info including tenant-specific role (e.g., is_admin).
 * 
 * @param {string} autodeskId - Autodesk user ID
 * @param {string} firstName 
 * @param {string} lastName 
 * @param {string} emailId 
 * @param {string} tenantName - Subdomain or company context
 * @returns {Promise<Object>} - Combined user object with tenant role
 */
const upsertUser = async (autodeskId, firstName, lastName, emailId, tenantName) => {
  try {
    // Upsert user core profile
    await pg.query(
      `INSERT INTO users (autodesk_id, first_name, last_name, email_id)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (autodesk_id) DO UPDATE 
       SET first_name = EXCLUDED.first_name,
           last_name = EXCLUDED.last_name,
           email_id = EXCLUDED.email_id,
           updated_at = NOW()
       RETURNING *`,
      [autodeskId, firstName, lastName, emailId]
    );

    // Upsert tenant-specific association
    await pg.query(
      `INSERT INTO company_users (autodesk_id, tenant_name)
       VALUES ($1, $2)
       ON CONFLICT (autodesk_id, tenant_name) DO NOTHING`,
      [autodeskId, tenantName]
    );

    // Fetch enriched user with tenant role
    const combinedResult = await pg.query(
      `SELECT u.*, cu.tenant_name, cu.is_admin
       FROM users u
       JOIN company_users cu ON u.autodesk_id = cu.autodesk_id
       WHERE u.autodesk_id = $1 AND cu.tenant_name = $2`,
      [autodeskId, tenantName]
    );

    if (combinedResult.rows.length === 0) {
      throw new Error('User or tenant-specific role not found after upsert.');
    }

    return combinedResult.rows[0];

  } catch (error) {
    console.error(`Error upserting user with Autodesk ID '${autodeskId}':`, error);
    throw new CustomError('Database error during user upsert and enrichment.', 500);
  }
};

/**
 * Retrieves a user by their Autodesk ID.
 * @param {string} autodeskId - The unique Autodesk ID.
 * @returns {Promise<Object|null>} - The user object or null if not found.
 */
const getUserByAutodeskId = async (autodeskId, tenantName) => {
  try {
    const result = await pg.query(`SELECT 
         u.*, 
         cu.is_admin 
       FROM users u
       LEFT JOIN company_users cu 
         ON u.autodesk_id = cu.autodesk_id AND cu.tenant_name = $2
       WHERE u.autodesk_id = $1`, [autodeskId, tenantName]);
    return result.rows[0] || null;
  } catch (error) {
    console.error(`Error fetching user by Autodesk ID '${autodeskId}':`, error);
    throw new CustomError('Database error fetching user data.', 500);
  }
};

module.exports = {
  upsertUser,
  getUserByAutodeskId,
};