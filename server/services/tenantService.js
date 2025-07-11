// src/services/tenantService.js
const db = require('../db/postgres');

const getAllTenantConfigs = async () => {
  const { rows } = await db.query('SELECT name, mongodb_uri FROM company_configs');
  return rows;
};

module.exports = { getAllTenantConfigs };