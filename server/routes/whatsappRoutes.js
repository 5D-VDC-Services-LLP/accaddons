// routes/whatsappRoutes.js
const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');

router.post('/send-chart', whatsappController.sendChartToUser);

module.exports = router;
