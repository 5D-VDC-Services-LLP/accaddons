// src/services/autodeskTokenService.js
const { getMongoDBConnection } = require('../db/mongodb');
const CustomError = require('../utils/customError');
const mongoose = require('mongoose');

// Define the Mongoose Schema for Autodesk APS Tokens, now including user roles/status for the tenant
const apsTokenSchema = new mongoose.Schema({
  autodesk_id: { type: String, required: true, unique: true }, // The Autodesk user ID
  access_token: { type: String, required: true },
  expires_at: { type: Date, required: true }, // When the access_token expires
  refresh_token: { type: String, required: false }, // Optional, as some flows might not provide it
  
  // NEW: Fields for user's role and status within this specific tenant
  roles: [{ type: String, default: ['viewer'] }], // e.g., 'admin', 'editor', 'viewer'
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }, // User's status within this company

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// Pre-save hook to update `updated_at` for existing documents
apsTokenSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

/**
 * Gets a Mongoose Model for 'ApsToken' specific to a given MongoDB connection.
 * This ensures the model operates on the correct tenant's database.
 * @param {mongoose.Connection} connection - The Mongoose connection object for the tenant.
 * @returns {mongoose.Model} - The ApsToken Mongoose Model.
 */
const getApsTokenModel = (connection) => {
  // Define the model only once per connection
  if (!connection.models.ApsToken) {
    return connection.model('ApsToken', apsTokenSchema, 'aps_tokens'); // 'aps_tokens' is the collection name
  }
  return connection.models.ApsToken;
};

/**
 * Inserts or updates an Autodesk APS token record (and user roles/status)
 * for a specific user in the tenant's MongoDB.
 * @param {string} mongoUri - The MongoDB connection URI for the specific tenant.
 * @param {string} autodeskId - The Autodesk user ID.
 * @param {string} accessToken - The APS access token.
 * @param {Date} expiresAt - The expiration timestamp for the access token.
 * @param {string} [refreshToken] - The APS refresh token (optional).
 * @param {Array<string>} [roles=['viewer']] - The roles for the user in this tenant. (NEW PARAMETER)
 * @param {string} [status='active'] - The status of the user in this tenant. (NEW PARAMETER)
 * @returns {Promise<Object>} - The saved APS token document.
 */
const upsertApsToken = async (mongoUri, autodeskId, accessToken, expiresAt, refreshToken = null, roles = ['viewer'], status = 'active') => {
  try {
    const connection = await getMongoDBConnection(mongoUri);
    const ApsToken = getApsTokenModel(connection);

    // Find and update, or insert if not found
    const updatedToken = await ApsToken.findOneAndUpdate(
      { autodesk_id: autodeskId },
      {
        access_token: accessToken,
        expires_at: expiresAt,
        refresh_token: refreshToken,
        roles: roles,   // NEW: Update roles
        status: status, // NEW: Update status
        updated_at: Date.now(),
      },
      {
        upsert: true, // Create the document if it doesn't exist
        new: true,   // Return the updated/new document
        setDefaultsOnInsert: true // Apply schema defaults on insert
      }
    );
    return updatedToken;
  } catch (error) {
    console.error(`Error upserting APS token/user access for user '${autodeskId}' in MongoDB for URI ${mongoUri.substring(0, mongoUri.indexOf('@') + 1)}...:`, error);
    throw new CustomError('Failed to save Autodesk APS token and user access.', 500);
  }
};

/**
 * Retrieves an Autodesk APS token record (including user roles/status)
 * for a specific user from the tenant's MongoDB.
 * @param {string} mongoUri - The MongoDB connection URI for the specific tenant.
 * @param {string} autodeskId - The Autodesk user ID.
 * @returns {Promise<Object|null>} - The APS token document or null if not found.
 */
const getApsToken = async (mongoUri, autodeskId) => {
  try {
    const connection = await getMongoDBConnection(mongoUri);
    const ApsToken = getApsTokenModel(connection);
    console.log(`Fetching APS token/user access for user '${autodeskId}' from MongoDB for URI ${mongoUri.substring(0, mongoUri.indexOf('@') + 1)}...`);
    const token = await ApsToken.findOne({ autodesk_id: autodeskId });
    return token;
  } catch (error) {
    console.error(`Error fetching APS token/user access for user '${autodeskId}' from MongoDB for URI ${mongoUri.substring(0, mongoUri.indexOf('@') + 1)}...:`, error);
    throw new CustomError('Failed to retrieve Autodesk APS token and user access.', 500);
  }
};

module.exports = {
  upsertApsToken,
  getApsToken,
};