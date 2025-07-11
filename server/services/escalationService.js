// src/services/otpService.js
const axios = require('axios')
const config = require('../config');

const WHATSAPP_API_URL = config.whatsapp.apiUrl;
const WHATSAPP_TOKEN = config.whatsapp.token;
const WHATSAPP_TEMPLATE_NAME = 'escalation_template';

/**
 * Sends the OTP via WhatsApp using the configured template.
 * @param {string} phoneNumber - Recipient's phone number in international format.
 * @param {string} otp - The OTP code to send.
 */
async function sendEscalationMessage(phoneNumber, count, moduleName, date, projectName) {
  console.log(`📱 Sending escalation message to ${phoneNumber}...`);

  try {
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: phoneNumber,
      type: 'template',
      template: {
        name: WHATSAPP_TEMPLATE_NAME, // 'escalation_template'
        language: {
          code: 'en'
        },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: String(count) },       // {{1}} - Number
              { type: 'text', text: moduleName },           // {{2}} - Text
              { type: 'text', text: projectName },                 // {{3}} - Date as text
              { type: 'text', text: date }                // {{4}} - Text
            ]
          },
          {
            type: 'button',
            sub_type: 'quick_reply',
            index: 0,
            parameters: [
              { type: 'payload', payload: 'Details' } // When user clicks, you receive 'Details' in webhook
            ]
          }
        ]
      }
    };

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
    };

    const response = await axios.post(WHATSAPP_API_URL, payload, { headers });

    if (response.status !== 200) {
      throw new Error(`WhatsApp API error: ${response.statusText}`);
    }

    console.log('✅ Escalation message sent successfully!');
  } catch (error) {
    const apiError = error.response?.data;

    console.error('❌ Failed to send escalation message via WhatsApp:');
    console.error('Message:', error.message);
    if (apiError) {
      console.error('API Response:', JSON.stringify(apiError, null, 2));
    }

    throw new Error(
      `Failed to send WhatsApp escalation message. ${apiError?.error?.message || error.message}`
    );
  }
}

module.exports = {
  sendEscalationMessage,
};
