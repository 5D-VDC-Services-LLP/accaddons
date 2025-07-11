// In your routes/escalationRoutes.js or similar
const express = require('express');
const router = express.Router();
const escalationController = require('../controllers/escalationController');

router.post('/workflows/:workflow_id/escalate', escalationController.triggerEscalation);

module.exports = router;
