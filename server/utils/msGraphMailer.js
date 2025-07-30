const cca = require('../mailer/msalClient');
const axios = require('axios');
const config = require('../config');

async function sendGraphMail(toEmail, htmlBody) {
  try {
    const tokenResponse = await cca.acquireTokenByClientCredential({
      scopes: ['https://graph.microsoft.com/.default'],
    });

    if (!tokenResponse?.accessToken) {
      throw new Error('Access token acquisition failed.');
    }

    const payload = {
      message: {
        subject: 'Complete Your Account Setup',
        body: {
          contentType: 'HTML',
          content: htmlBody,
        },
        toRecipients: [
          { emailAddress: { address: toEmail } }
        ]
      },
      saveToSentItems: true,
    };

    const graphUrl = `https://graph.microsoft.com/v1.0/users/${config.email.senderEmail}/sendMail`;

    const response = await axios.post(graphUrl, payload, {
      headers: {
        Authorization: `Bearer ${tokenResponse.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status !== 202) {
      throw new Error(`Unexpected status: ${response.status}`);
    }

    console.log(`✅ Graph email sent to ${toEmail}`);
  } catch (error) {
    console.error('❌ Graph email error:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = { sendGraphMail };
