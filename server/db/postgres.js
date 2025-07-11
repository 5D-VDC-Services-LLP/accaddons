// src/db/postgres.js
const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool(config.postgres);

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

/**
 * Executes a SQL query using the PostgreSQL connection pool.
 * @param {string} text - The SQL query string.
 * @param {Array} params - An array of parameters for the query.
 * @returns {Promise<Object>} - The query result object.
 */
const query = (text, params) => {
  return pool.query(text, params);
};

module.exports = {
  query,
  pool, // Export pool itself if direct client access is needed for transactions
};