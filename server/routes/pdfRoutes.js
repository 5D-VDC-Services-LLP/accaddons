const config = require('../config');
const express = require('express');
const router = express.Router();
const { getAllIssueDetails } = require('../services/pdfService');


router.post('/', async (req, res) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(400).json({ error: 'Missing required fields: accessToken' });
  }

  try {
    await getAllIssueDetails(accessToken);
    res.status(200).json({ message: 'PDF Made' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed' });
  }
});

module.exports = router;