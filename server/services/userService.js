// src/services/userService.js
const pg = require('../db/postgres');
const CustomError = require('../utils/customError');

/**
 * Inserts or updates a user record in the PostgreSQL database.
 * This function ONLY stores user's internal ID and company association.
 * APS tokens are NOT stored persistently here.
 * @param {string} autodeskId - The unique Autodesk ID of the user.
 * @returns {Promise<Object>} - The user object from the database.
 */
const upsertUser = async (autodeskId, firstName, lastName, emailId) => {
  try {
    // Use an UPSERT (INSERT ... ON CONFLICT UPDATE) statement
    const result = await pg.query(
      `INSERT INTO users (autodesk_id, first_name, last_name, email_id)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (autodesk_id) DO UPDATE
       SET updated_at = NOW()
       RETURNING *`,
      [autodeskId, firstName, lastName, emailId]
    );
    return result.rows[0];
  } catch (error) {
    console.error(`Error upserting user with Autodesk ID '${autodeskId}':`, error);
    throw new CustomError('Database error upserting user data.', 500);
  }
};

/**
 * Retrieves a user by their Autodesk ID.
 * @param {string} autodeskId - The unique Autodesk ID.
 * @returns {Promise<Object|null>} - The user object or null if not found.
 */
const getUserByAutodeskId = async (autodeskId) => {
  try {
    const result = await pg.query('SELECT * FROM users WHERE autodesk_id = $1', [autodeskId]);
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