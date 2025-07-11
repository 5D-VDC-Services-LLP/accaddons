// src/services/otpService.js

const axios = require('axios');
const db = require('../db/postgres');
const config = require('../config');
const CustomError = require('../utils/customError');

const OTP_EXPIRY_MINUTES = 5;
const WHATSAPP_API_URL = config.whatsapp.apiUrl;
const WHATSAPP_TOKEN = config.whatsapp.token;
const WHATSAPP_TEMPLATE_NAME = 'otp';

/**
 * Generates a 6-digit numeric OTP.
 * @returns {string} A 6-digit OTP as a string.
 */
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Sends the OTP via WhatsApp using the configured template.
 * @param {string} phoneNumber - Recipient's phone number in international format.
 * @param {string} otp - The OTP code to send.
 */
async function sendOtp(phoneNumber, otp) {
  console.log(`📱 Sending OTP ${otp} to ${phoneNumber} via WhatsApp...`);
  try {
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: phoneNumber,
      type: 'template',
      template: {
        name: WHATSAPP_TEMPLATE_NAME,  // Template name (e.g., "otp_auth")
        language: {
          code: 'en_US'  // Adjust to the language of your template
        },
        components: [
          {
            type: 'body',
            parameters: [
              {
                type: 'text',
                text: otp // This populates the {{1}} in the body text of your template
              }
            ]
          },
          // ADD THIS COMPONENT FOR THE BUTTONS
          {
            type: 'button',
            sub_type: 'url', // Specify it's a URL button
            index: 0, // This targets the first button, which the error indicates is a URL type
            parameters: [
              {
                type: 'text',
                // For stock authentication templates, this parameter is often
                // the OTP itself, or a fixed placeholder if the URL is not truly dynamic.
                // Try sending the OTP here first.
                text: otp
                // If 'otp' doesn't work, try a placeholder string like '12345'
                // as sometimes the URL button for auth templates just needs *any* parameter
                // to satisfy the API, even if the actual URL doesn't use it dynamically.
              }
            ]
          }
        ]
      }
    };

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,  // From config
    };

    const response = await axios.post(WHATSAPP_API_URL, payload, { headers });

    // Check for success
    if (response.status !== 200) {
      throw new Error(`WhatsApp API error: ${response.statusText}`);
    }

    console.log('✅ OTP sent successfully!');
  } catch (error) {
    const apiError = error.response?.data;

    console.error('❌ Failed to send OTP via WhatsApp:');
    console.error('Message:', error.message);
    if (apiError) {
      console.error('API Response:', JSON.stringify(apiError, null, 2));
    } else {
      console.error('No detailed error response from WhatsApp API.');
    }

    // Optional: include details in thrown error for visibility
    throw new Error(
      `Failed to send WhatsApp OTP. ${apiError?.error?.message || error.message}`
    );
  }
}

/**
 * Updates the user record with OTP data and sends the OTP.
 * @param {string} autodeskId - Unique user ID.
 * @param {string} phoneNumber - Phone number to store/send OTP to.
 */
async function requestOtp(autodeskId, phoneNumber) {
  const otp = generateOtp();
  const now = new Date();
  const expiry = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60000);

  const updateQuery = `
    UPDATE users
    SET phone_number = $1,
        otp = $2,
        otp_expires_at = $3,
        is_otp_verified = FALSE,
        otp_attempts = 0,
        last_otp_sent_at = $4
    WHERE autodesk_id = $5
    RETURNING autodesk_id;
  `;
  const updateValues = [phoneNumber, otp, expiry, now, autodeskId];

  const result = await db.query(updateQuery, updateValues);
  if (result.rowCount === 0) {
    throw new CustomError('User not found.', 404);
  }

  await sendOtp(phoneNumber, otp);
}

/**
 * Verifies a given OTP against what's stored in the database.
 * @param {string} autodeskId - Unique user ID.
 * @param {string} otpInput - OTP provided by the user.
 */
async function verifyOtp(autodeskId, otpInput) {
  const fetchQuery = `
    SELECT otp, otp_expires_at, otp_attempts, is_otp_verified
    FROM users
    WHERE autodesk_id = $1;
  `;
  const result = await db.query(fetchQuery, [autodeskId]);

  if (result.rowCount === 0) {
    throw new CustomError('User not found.', 404);
  }

  const user = result.rows[0];
  const now = new Date();

  if (user.is_otp_verified) {
    return { verified: true, message: 'OTP already verified.' };
  }

  if (!user.otp || !user.otp_expires_at || now > new Date(user.otp_expires_at)) {
    throw new CustomError('OTP expired. Please request a new one.', 400);
  }

  if (user.otp !== otpInput) {
    const attempts = user.otp_attempts + 1;
    await db.query(
      `UPDATE users SET otp_attempts = $1 WHERE autodesk_id = $2`,
      [attempts, autodeskId]
    );
    throw new CustomError('Incorrect OTP. Please try again.', 401);
  }

  // OTP matched
  await db.query(
    `UPDATE users
     SET is_otp_verified = TRUE,
         otp = NULL,
         otp_expires_at = NULL,
         otp_attempts = 0
     WHERE autodesk_id = $1`,
    [autodeskId]
  );

  return { verified: true, message: 'OTP verified successfully.' };
}

module.exports = {
  generateOtp,
  sendOtp,
  requestOtp,
  verifyOtp,
};
