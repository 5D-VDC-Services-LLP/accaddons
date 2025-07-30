const config = require('../config');
const express = require('express');
const router = express.Router();
const msGraphMailer = require('../utils/msGraphMailer');
const sendEmail = require('../utils/emailTemplate');

router.post('/send-email', async (req, res) => {
  const { toEmail } = req.body;

  if (!toEmail) {
    return res.status(400).json({ error: 'Missing required fields: toEmail' });
  }

  try {
    await msGraphMailer.sendGraphMail(toEmail, sendEmail.sendEmail());
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

module.exports = router;