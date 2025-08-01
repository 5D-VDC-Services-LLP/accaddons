// src/services/otpService.js
const axios = require('axios')
const config = require('../config');

const WHATSAPP_API_URL = config.whatsapp.apiUrl;
const WHATSAPP_TOKEN = config.whatsapp.token;
const WHATSAPP_TEMPLATE_NAME = 'account_level_notification';
const BASE_URL = config.whatsapp.baseUrl || 'https://5daddons.com/';

/**
 * Sends the OTP via WhatsApp using the configured template.
 * @param {string} phoneNumber - Recipient's phone number in international format.
 * @param {string} otp - The OTP code to send.
 */
async function sendEscalationMessage(phoneNumber, userId, aggregate, tenant, date) {
  console.log(`📱 Sending escalation message to ${phoneNumber}...`);

  // Sum all item counts across all projects
  let issueCount = 0, reviewCount = 0, formCount = 0;

  for (const projectData of aggregate.values()) {
    console.log(projectData.issues?.length)
    issueCount += Array.isArray(projectData.issues) ? projectData.issues.length : 0;
    reviewCount += Array.isArray(projectData.reviews) ? projectData.reviews.length : 0;
    formCount += Array.isArray(projectData.forms) ? projectData.forms.length : 0;
  }

  const formattedDate = date.split('-').reverse().join('');

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: phoneNumber,
    type: 'template',
    template: {
      name: WHATSAPP_TEMPLATE_NAME,
      language: { code: 'en' },
      components: [
        {
          type: 'header',
          parameters: [
            { type: 'text', text: 'Escalation Notification' } // {{1}} in header
          ]
        },
        {
          type: 'body',
          parameters: [
            { type: 'text', text: String(issueCount) },  // {{1}} issues
            { type: 'text', text: String(reviewCount) }, // {{2}} reviews
            { type: 'text', text: String(formCount) },   // {{3}} forms
            { type: 'text', text: tenant }               // {{4}} tenant name
          ]
        },
        {
          type: 'button',
          sub_type: 'url',
          index: 0,
          parameters: [
            {
              type: 'text',
              text: `unified/${userId}/${formattedDate}` // projectId replaced with `unified` for now
            }
          ]
        }
      ]
    }
  };

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${WHATSAPP_TOKEN}`,
  };

    try {
    const response = await axios.post(WHATSAPP_API_URL, payload, { headers });

    if (response.status !== 200) {
      throw new Error(`WhatsApp API error: ${response.statusText}`);
    }

    console.log(`✅ WhatsApp escalation sent to ${phoneNumber}`);
  } catch (err) {
    const apiErr = err.response?.data;
    console.error(`❌ WhatsApp failed for ${phoneNumber}:`, err.message);
    if (apiErr) console.error('API response:', JSON.stringify(apiErr, null, 2));
    throw new Error(apiErr?.error?.message || err.message);
  }
}

module.exports = { sendEscalationMessage, };
