// src/controllers/userController.js
const CustomError = require('../utils/customError');

/**
 * Fetches the authenticated user's profile.
 */
const getUserProfile = (req, res, next) => {
  try {
    // req.user is populated by authenticateJWT middleware
    if (!req.user) {
      throw new CustomError('User data not available after authentication.', 500);
    }

    // You can customize the profile data you send back
    const userProfile = {
      autodeskId: req.user.autodesk_id,
      companyId: req.user.company_id,
      // Add other user fields from your DB if available
      email: req.user.email, // Assuming you store email
      name: req.user.name,   // Assuming you store name
    };

    res.json({
      status: 'success',
      data: userProfile,
    });
  } catch (error) {
    next(error);
  }
};



module.exports = {
  getUserProfile,
};