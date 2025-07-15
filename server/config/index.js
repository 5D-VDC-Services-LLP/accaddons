// src/config/index.js
require('dotenv').config();

const config = {
  port: process.env.PORT || 8080,
  frontendPort: 8080,
  postgres: {
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: parseInt(process.env.PG_PORT || '5432', 10),
  },
  autodesk: {
    // APS credentials will be fetched dynamically from tenant_config
    // Scopes required for 3-legged token and user profile
    scopes: 'data:read account:read', // Minimal scopes for profile, adjust as needed for initial API calls
    // APS Endpoints (these are static)
    tokenUrl: 'https://developer.api.autodesk.com/authentication/v2/token',
    authorizeUrl: 'https://developer.api.autodesk.com/authentication/v2/authorize',
    userProfileUrl: 'https://developer.api.autodesk.com/userprofile/v1/users/@me',
  },
  jwtSecret: process.env.JWT_SECRET,
  mainDomain: process.env.MAIN_DOMAIN,
  whatsapp: {
    apiUrl: process.env.WHATSAPP_API_URL,
    token: process.env.WHATSAPP_TOKEN,
    templateName: process.env.WHATSAPP_TEMPLATE_NAME || 'acc_notifications_authentication',
    languageCode: process.env.WHATSAPP_LANG || 'en', // fallback
  },
};

// Basic validation to ensure critical variables are set
if (!config.jwtSecret) {
  console.error('ERROR: Missing JWT_SECRET environment variable.');
  process.exit(1);
}
if (!config.postgres.user || !config.postgres.host || !config.postgres.database || !config.postgres.password) {
  console.error('ERROR: Missing PostgreSQL environment variables.');
  process.exit(1);
}
if (!config.mainDomain) {
  console.error('ERROR: Missing MAIN_DOMAIN environment variable.');
  process.exit(1);
}
if (!config.whatsapp.apiUrl || !config.whatsapp.token) {
  console.error('ERROR: Missing WhatsApp API credentials.');
  process.exit(1);
}

module.exports = config;