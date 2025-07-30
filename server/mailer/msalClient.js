// config/msalClient.js
const { ConfidentialClientApplication } = require('@azure/msal-node');
const config = require('../config');

const msalConfig = {
  auth: {
    clientId: config.email.clientId,
    authority: `https://login.microsoftonline.com/${config.email.tenantId}`,
    clientSecret: config.email.clientSecret,
  },
};

const cca = new ConfidentialClientApplication(msalConfig);

module.exports = cca;