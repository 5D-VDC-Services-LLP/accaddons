const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth'); // JWT middleware

/**
 * @route GET /auth/autodesk/login
 * @description Initiates the Autodesk OAuth 2.0 3-legged login flow.
 * @access Public (but tenant-specific via subdomain)
 */
router.get('/autodesk/login', authController.loginWithAutodesk);

/**
 * @route GET /auth/oauth/callback
 * @description Handles the Autodesk OAuth 2.0 callback.
 * @access Public (but tenant-specific via subdomain)
 */
router.get('/oauth/callback', authController.autodeskCallback);

/**
 * @route POST /auth/submit-phone
 * @description Called after Autodesk login when phone number is missing. Submits phone and sends OTP.
 * @access Public (relies on session data from Autodesk login)
 */
router.post('/submit-phone', authController.submitPhoneAndSendOTP);

/**
 * @route POST /auth/verify-otp
 * @description Verifies OTP and finalizes login by issuing JWT.
 * @access Public (relies on session data from previous step)
 */
router.post('/verify-otp', authController.verifyOtpAndFinalizeLogin);

/**
 * @route GET /auth/reauthenticate
 * @description Silent login using stored JWT + validate Autodesk access
 * @access Protected
 */
router.get('/reauthenticate', authMiddleware.authenticateJWT, authController.reauthenticateJwt);

/**
 * @route GET /auth/initial-projects
 * @description Returns cached Autodesk project list after login
 * @access Protected
 */
router.get('/initial-projects', authMiddleware.authenticateJWT, authController.getInitialAutodeskProjects);

/**
 * @route GET /auth/check
 * @description Simple JWT validity check endpoint
 * @access Protected
 */
// ...existing code...
router.get('/check', authMiddleware.authenticateJWT, async (req, res) => {
  // Fetch is_admin from DB if not already on req.user
  let isAdmin = req.user?.is_admin;
  if (typeof isAdmin === 'undefined') {
    // Fetch from DB if needed
    const userService = require('../services/userService');
    const user = await userService.getUserByAutodeskId(req.user.autodeskId, req.companyConfig?.subdomain);
    isAdmin = user?.is_admin || false;
  }
  res.status(200).json({ authenticated: true, user: { ...req.user, is_admin: isAdmin } });
});
// ...existing code...

/**
 * @route POST /auth/verify-otp
 * @description Verifies OTP and finalizes login by issuing JWT.
 * @access Public (relies on session data from previous step)
 */
router.post('/logout', authController.logout);

router.get('/pending-user-details', authController.getPendingUserDetails); // Add this line


module.exports = router;
