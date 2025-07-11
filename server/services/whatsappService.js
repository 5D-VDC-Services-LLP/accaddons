// src/services/whatsappService.js

const axios = require('axios');
const config = require('../config');

async function sendWhatsappOtp(phone, otp) {
  const { apiUrl, token, templateName, languageCode } = config.whatsapp;

  const payload = {
    messaging_product: 'whatsapp',
    to: phone, // International format
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: languageCode
      },
      components: [
        {
          type: 'body',
          parameters: [
            {
              type: 'text',
              text: otp
            }
          ]
        }
      ]
    }
  };

  try {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };

    const response = await axios.post(apiUrl, payload, { headers });

    console.log(`✅ OTP sent to ${phone}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to send OTP to ${phone}:`, error.response?.data || error.message);
    throw new Error('Failed to send OTP via WhatsApp.');
  }
}

module.exports = {
  sendWhatsappOtp,
};
