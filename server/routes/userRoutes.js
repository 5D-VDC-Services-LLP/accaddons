// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/auth');
const userController = require('../controllers/userController'); // Import the controller

/**
 * @route GET /user/profile
 * @description Fetches the authenticated user's profile.
 * @access Private (requires JWT)
 */
router.get('/profile', authenticateJWT, userController.getUserProfile);

module.exports = router;