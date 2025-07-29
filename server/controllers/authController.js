// src/controllers/authController.js
const autodeskService = require('../services/autodeskService');
const userService = require('../services/userService');
const companyConfigService = require('../services/companyConfigService');
const autodeskTokenService = require('../services/autodeskTokenService');
const otpService = require('../services/otpService');
const { getAndValidateAutodeskProjectAccess } = require('./autodeskDataController');
const jwt = require('../utils/jwt');
const CustomError = require('../utils/customError');
const config = require('../config');
const crypto = require('crypto')

/**
 * Initiates the Autodesk OAuth 2.0 3-legged login flow.
 * Redirects the user to the Autodesk authorization URL.
 * Requires tenant context (subdomain) to get client-specific credentials.
 */
const loginWithAutodesk = (req, res, next) => {
  try {
    if (!req.companyConfig || !req.companyConfig.aps_client_id || !req.companyConfig.aps_callback_url) {
      throw new CustomError('Tenant-specific Autodesk credentials not found. Please access via a valid tenant subdomain.', 400);
    }

    const { aps_client_id, aps_callback_url } = req.companyConfig;
    const scopes = config.autodesk.scopes; // Use static scopes from config

    // Extract the redirectTo from the frontend's query
    const frontendRedirectTo = req.query.redirectTo;
    if (!frontendRedirectTo) {
      throw new CustomError('Frontend redirectTo parameter is missing.', 400);
    }

    // Generate a random state and append the frontendRedirectTo URL to it.
    // Ensure the combined state (random_string|encoded_frontend_url) is URL-safe.
    const baseState = crypto.randomBytes(16).toString('hex'); // Use 16 bytes for shorter base
    const combinedState = `${baseState}|${encodeURIComponent(frontendRedirectTo)}`;

    // Store the combined state in the session
    req.session.oauthState = combinedState;

    const authorizeUrl = `${config.autodesk.authorizeUrl}?response_type=code` +
                          `&client_id=${aps_client_id}` +
                          `&redirect_uri=${encodeURIComponent(aps_callback_url)}` + // This MUST be your backend's callback URL
                          `&scope=${encodeURIComponent(scopes)}` +
                          `&state=${combinedState}`; // Send the combined state

    res.redirect(authorizeUrl);
  } catch (error) {
    next(error);
  }
};

/**
 * Handles the Autodesk OAuth 2.0 callback.
 * Exchanges authorization code for tokens, fetches user profile,
 * stores/updates user and company data, and issues an internal JWT.
 * APS access/refresh tokens are NOT stored persistently.
 */
const autodeskCallback = async (req, res, next) => {
  const { code, state } = req.query; // 'state' can be used for CSRF protection

  // --- VALIDATE CSRF TOKEN ---
  // const storedCombinedState = req.session.oauthState;
  // delete req.session.oauthState;

  // if (!state || state !== storedCombinedState) {
  //   console.error('CSRF token mismatch or missing state during Autodesk callback.');
  //   // You might want to redirect to a generic error page if the state is totally invalid
  //   return next(new CustomError('Authentication failed: Invalid or missing state parameter. Potential CSRF attack.', 403));
  // }

  // Extract the original frontend redirect URL from the combined state
  const stateParts = state.split('|');
  if (stateParts.length < 2) {
      console.error('Invalid combined state format during Autodesk callback.');
      return next(new CustomError('Authentication failed: Invalid state format.', 403));
  }
  const originalFrontendRedirectUrl = decodeURIComponent(stateParts[1]); // This is the URL from the frontend
  // --- END CSRF TOKEN VALIDATION ---

  if (!code) {
    // If no code, and we have the originalFrontendRedirectUrl, redirect there with error
    if (originalFrontendRedirectUrl) {
        return res.redirect(`${originalFrontendRedirectUrl}?authStatus=error&message=${encodeURIComponent('Autodesk authorization code missing.')}`);
    }
    return next(new CustomError('Autodesk authorization code missing.', 400));
  }

  if (!req.companyConfig) {
    // ... safeguard ...
    if (originalFrontendRedirectUrl) {
        return res.redirect(`${originalFrontendRedirectUrl}?authStatus=error&message=${encodeURIComponent('Tenant config missing during callback.')}`);
    }
    return next(new CustomError('Tenant-specific company configuration not found during callback.', 400));
  }

  const { aps_client_id, aps_client_secret, aps_callback_url, mongodb_uri } = req.companyConfig;
  let apsAccessToken = null; // Declare here so it's in scope for initial API calls

  try {
    // 1. Exchange authorization code for APS tokens using tenant-specific credentials
    const apsTokens = await autodeskService.getApsTokens(aps_client_id, aps_client_secret, aps_callback_url, code);
    apsAccessToken = apsTokens.access_token; // Store temporarily
    let apsRefreshToken = apsTokens.refresh_token; // Store temporarily (will be discarded)

    // Calculate expires_at timestamp
    const expiresAt = new Date(Date.now() + apsTokens.expires_in * 1000); // expires_in is in seconds

    // 2. Use the APS access token for initial necessary API calls (e.g., get user profile)
    const autodeskUserProfile = await autodeskService.getAutodeskUserProfile(apsAccessToken);
    console.log(autodeskUserProfile)
    const autodeskId = autodeskUserProfile.userId; // Or 'id' depending on APS API response

    if (!autodeskId) {
      throw new CustomError('Could not retrieve Autodesk User ID from profile.', 500);
    }

    // NEW: 3. Store/Update Autodesk APS tokens in the tenant's MongoDB
    await autodeskTokenService.upsertApsToken(
      mongodb_uri,
      autodeskId,
      apsAccessToken,
      expiresAt,
      apsRefreshToken,
        ['viewer'], // Default roles for a new user in this tenant
      'active'    // Default status for a new user in this tenant
    );
    console.log(`Autodesk APS tokens saved/updated for user ${autodeskId} in tenant MongoDB.`);

    // 4. Store/Update user in PostgreSQL (WITHOUT APS tokens)
    const companyId = req.companyConfig.id;
    const firstName = autodeskUserProfile.firstName;
    const lastName = autodeskUserProfile.lastName;
    const emailId = autodeskUserProfile.emailId;
    const companySubdomain = req.companyConfig.subdomain;

    const user = await userService.upsertUser(autodeskId, firstName, lastName, emailId); // Assume this returns full user
    if (!user.phone_number || !user.is_otp_verified) {
      console.log(`User ${autodeskId} has no phone number or is not OTP verified.`);

      req.session.pendingAutodeskLogin = {
        autodeskId,
        firstName,
        lastName,
        emailId,
        tenant: req.companyConfig.subdomain,
        redirectTo: originalFrontendRedirectUrl, // Store the original redirect URL here
      };
        const parsedUrl = new URL(originalFrontendRedirectUrl);
        const verifyPhoneUrl = `${parsedUrl.protocol}//${parsedUrl.hostname}${parsedUrl.port ? ':' + parsedUrl.port : ''}/verify-phone`;
        console.log(`Redirecting to verifyPhone: ${verifyPhoneUrl}`); // ADD THIS LOG

        console.log(`Redirecting to pendingPhone: ${originalFrontendRedirectUrl}?authStatus=pendingPhone`); // ADD THIS LOG
        return res.redirect(verifyPhoneUrl);
    }

    // NEW: 5. Validate Autodesk Hubs and Projects access
    let initialProjectsList = [];
    try {
      initialProjectsList = await getAndValidateAutodeskProjectAccess(autodeskId, req.companyConfig);
      console.log(`Autodesk Project Access validated for user ${autodeskId}. Found ${initialProjectsList.length} projects.`);
    } catch (projectAccessError) {
      // If validation fails, redirect with an error message
      console.error('Autodesk Project Access Validation Failed:', projectAccessError.message);
      return res.redirect(`${originalFrontendRedirectUrl}?authStatus=error&message=${encodeURIComponent(projectAccessError.message)}`);
    }

    // NEW: 8. Store the projects list in the session for the frontend to retrieve once.
    req.session.initialAutodeskProjects = initialProjectsList;
    console.log('Initial projects list stored in session.');

    // 6. Generate your internal JWT
    const internalJwtToken = jwt.generateToken({
      autodeskId: autodeskId,
      firstName: firstName,
      lastName: lastName,
      emailId: emailId
      // companyId: companyId,
      // Add other claims as needed, e.g., roles, permissions
    });
    console.log(internalJwtToken)

    // 7. Send the internal JWT back to the frontend via HTTP-only cookie.
    res.cookie('jwt', internalJwtToken, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production', // Use secure in production (HTTPS)
      sameSite: 'Lax', // Or 'Strict' depending on your needs
      maxAge: 14 * 24 * 60 * 60 * 1000, // 7 days, adjust as needed
      // Conditionally set the domain attribute
      // ...(process.env.NODE_ENV === 'production' && { domain: `.${config.mainDomain}` }) // Allow cookie across subdomains for multi-tenancy
    });

    // 9. Redirect the user back to the appropriate frontend URL for their tenant.
    // The protocol and subdomain logic should be handled by the originalFrontendRedirectUrl
    // if it's coming from the frontend correctly.
    res.redirect(`${originalFrontendRedirectUrl}?authStatus=success`);

    

  } catch (error) {
    console.error('Autodesk OAuth Callback Error:', error);
    // Redirect to an error page or display an error message
    // If originalFrontendRedirectUrl is available, use it for error redirection
    const redirectOnError = originalFrontendRedirectUrl || '/'; // Fallback to root
    res.redirect(`${redirectOnError}?authStatus=error&message=${encodeURIComponent(error.message || 'Authentication failed.')}`);
  }
};

/**
 * NEW: Endpoint for frontend to fetch the initial Autodesk projects list once after login.
 * This should be a protected route.
 */
const getInitialAutodeskProjects = async (req, res, next) => {
  try {
    const projects = req.session.initialAutodeskProjects || [];
    res.json(projects);
  } catch (error) {
    console.error('Error fetching initial Autodesk projects from session:', error);
    return next(new CustomError('Failed to retrieve initial project data.', 500));
  } finally {
    // Ensure the session data is cleared after being fetched
    delete req.session.initialAutodeskProjects;
  }
};

/**
 * NEW: Handler for silent re-authentication using an existing JWT.
 * This endpoint verifies the JWT, then performs Autodesk Hubs/Projects checks.
 */
const reauthenticateJwt = async (req, res, next) => {
  try {
    // req.user is populated by authenticateJWT middleware, now it only contains autodeskId
    const { autodeskId } = req.user;

    if (!autodeskId) {
      throw new CustomError('Autodesk ID missing from JWT payload.', 401);
    }

    // In a multi-tenant setup, req.companyConfig is always available here
    // because tenantResolver runs before authenticateJWT.
    if (!req.companyConfig) {
      throw new CustomError('Tenant configuration not found for this subdomain.', 404);
    }

    console.log(`Attempting silent re-authentication and project access check for user ${autodeskId} in tenant ${req.companyConfig.subdomain}...`);

    // getAndValidateAutodeskProjectAccess uses autodeskId and companyConfig
    const initialProjectsList = await getAndValidateAutodeskProjectAccess(autodeskId, req.companyConfig);

    req.session.initialAutodeskProjects = initialProjectsList;
    console.log('Initial projects list stored in session after silent re-authentication.');

    res.status(200).json({ message: 'Re-authentication successful, projects prepared.' });

  } catch (error) {
    console.error('JWT Re-authentication Failed:', error);
    res.clearCookie('jwt');
    next(new CustomError(error.message || 'Re-authentication failed. Please log in again.', error.statusCode || 401));
  }
};

const submitPhoneAndSendOTP = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;
    const { pendingAutodeskLogin } = req.session;

    if (!pendingAutodeskLogin || !pendingAutodeskLogin.autodeskId) {
      throw new CustomError('Session expired or invalid. Please log in again.', 400);
    }

    // Send OTP and store it in DB (includes phone update)
    await otpService.requestOtp(pendingAutodeskLogin.autodeskId, phoneNumber);

    res.json({ success: true, message: 'OTP sent to WhatsApp.' });
  } catch (error) {
    next(error);
  }
};


const verifyOtpAndFinalizeLogin = async (req, res, next) => {
    try {
        const { otp } = req.body;
        const { pendingAutodeskLogin } = req.session;

        if (!pendingAutodeskLogin || !pendingAutodeskLogin.autodeskId || !pendingAutodeskLogin.tenant || !pendingAutodeskLogin.redirectTo) {
            // Added check for tenant and redirectTo as they are critical now
            throw new CustomError('Session expired or invalid pending login data. Please login again.', 400);
        }

        // 1. Verify OTP
        const result = await otpService.verifyOtp(pendingAutodeskLogin.autodeskId, otp);
        if (!result.verified) {
            throw new CustomError(result.message || 'OTP verification failed.', 401);
        }

        // 2. Retrieve user and company config
        const user = await userService.getUserByAutodeskId(pendingAutodeskLogin.autodeskId);
        if (!user) {
            throw new CustomError('User not found after OTP verification.', 404);
        }

        // We need the company config to fetch projects
        // Assuming you have a way to get company config by subdomain or user ID
        // For simplicity, let's assume req.companyConfig is available here if the tenant middleware ran,
        // or fetch it using pendingAutodeskLogin.tenant
        const companyConfig = req.companyConfig || await companyService.getCompanyConfigBySubdomain(pendingAutodeskLogin.tenant);
        if (!companyConfig) {
            throw new CustomError('Company configuration not found for this tenant.', 404);
        }

        // 3. Generate your internal JWT
        const token = jwt.generateToken({
            autodeskId: user.autodesk_id,
            firstName: user.first_name,
            lastName: user.last_name,
            emailId: user.email_id,
            // Add other claims as needed
        });

        // 4. Send the internal JWT back to the frontend via HTTP-only cookie.
        res.cookie('jwt', token, {
            httpOnly: true,
            // secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            maxAge: 14 * 24 * 60 * 60 * 1000,
            // ...(process.env.NODE_ENV === 'production' && { domain: `.${config.mainDomain}` })
        });

        // 5. **NEW:** Validate Autodesk Hubs and Projects access and store in session
        let initialProjectsList = [];
        try {
            // This is crucial: run the project access validation here
            initialProjectsList = await getAndValidateAutodeskProjectAccess(user.autodesk_id, companyConfig);
            console.log(`Autodesk Project Access validated after OTP for user ${user.autodesk_id}. Found ${initialProjectsList.length} projects.`);
        } catch (projectAccessError) {
            console.error('Autodesk Project Access Validation Failed after OTP:', projectAccessError.message);
            // Decide how to handle this error:
            // Option A: Send an error status back to the frontend.
            // Option B: Redirect to an error page (less ideal if frontend expects JSON).
            // For now, we'll return a success but with an empty project list, and the frontend will handle.
            // Or you could throw this error for the 'next(error)' handler. Let's make it a full error for now.
            throw new CustomError(`Failed to load projects after OTP verification: ${projectAccessError.message}`, 500);
        }

        // 6. Store the projects list in the session for the frontend to retrieve once.
        req.session.initialAutodeskProjects = initialProjectsList;
        console.log('Initial projects list stored in session after OTP verification.');

        // 7. Get the redirect URL stored in the session
        const redirectTo = pendingAutodeskLogin.redirectTo;

        // 8. Clear the pending login session data
        delete req.session.pendingAutodeskLogin;

        // 9. Send success response to frontend, including the target redirect URL
        res.json({
            success: true,
            message: 'OTP verified successfully. Redirecting...',
            redirectTo: `${redirectTo}?authStatus=success` // Frontend will use this to navigate
        });

    } catch (error) {
        console.error('OTP Verification and Finalization Failed:', error);
        // Ensure to clear the pendingAutodeskLogin session if an error occurs during finalization
        // This prevents users from being stuck in a bad state if the JWT or project fetch fails after OTP.
        if (req.session.pendingAutodeskLogin) {
            delete req.session.pendingAutodeskLogin;
        }
        next(error);
    }
};

/**
 * Handles user logout. Clears the JWT cookie and redirects.
 */
const logout = (req, res, next) => {
  try {
    // Clear the JWT cookie
    res.clearCookie('jwt', '', {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      // Ensure the domain matches the one set during login if applicable
      // Use config.mainDomain to ensure it clears for all subdomains
      ...(process.env.NODE_ENV === 'production' && { domain: `.${config.mainDomain}` })
    });

    // Determine the redirect URL from the query parameter, or default to the root of the current tenant's subdomain.
    // Ensure this matches the expected login page URL of your frontend.
    const logoutRedirectUrl = req.query.redirectTo || `/${req.companyConfig.subdomain}`;

    const sendLogoutResponse = (url) => {
      // Before sending, always check if headers have already been sent to prevent ERR_HTTP_HEADERS_SENT
      if (res.headersSent) {
        console.warn('Attempted to send logout response but headers already sent.');
        return; // Exit to prevent further issues
      }
      res.json({ success: true, message: 'Logged out successfully.', redirectTo: url });
    };

    // Destroy the session (if it exists)
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session during logout:', err);
          // Log the error, but proceed with redirect as cookie is already cleared.
          // This ensures the user is logged out even if session storage has issues.
        // If session destruction itself fails, pass the error to the error handler
          return next(new CustomError('Logout failed: Session destruction error.', 500));
        }
        console.log('Session destroyed.'); // This log is fine
        sendLogoutResponse(logoutRedirectUrl); 
       });
    } else {
      // If no session exists, just clear cookie (already done) and redirect immediately
      console.log('No active session to destroy.');
      res.redirect(logoutRedirectUrl);
      sendLogoutResponse(logoutRedirectUrl);
    }

  } catch (error) {
    console.error('Logout failed:', error);
    // If an error occurs before redirect, send an error response
    next(new CustomError('Logout failed. Please try again.', 500));
  }
};

/**
 * NEW: Endpoint for frontend to fetch pending Autodesk login details for phone verification.
 * This should be a protected route, or at least have some session-based access control.
 */
const getPendingUserDetails = (req, res, next) => {
  try {
    const { pendingAutodeskLogin } = req.session;

    console.log('pendingAutodeskLogin:', pendingAutodeskLogin);

    if (!pendingAutodeskLogin) {
      // If there's no pending login data, it means the session expired or was not set up correctly.
      throw new CustomError('No pending login details found. Please try logging in again.', 404);
    }

    // Send back only the necessary user details, not the entire session object.
    const userDetails = {
      autodeskId: pendingAutodeskLogin.autodeskId,
      firstName: pendingAutodeskLogin.firstName,
      lastName: pendingAutodeskLogin.lastName,
      emailId: pendingAutodeskLogin.emailId,
      tenant: pendingAutodeskLogin.tenant,
      redirectTo: pendingAutodeskLogin.redirectTo // Potentially useful for frontend context
    };

    console.log(userDetails)
    res.json(userDetails);
  } catch (error) {
    console.error('Error fetching pending user details:', error);
    next(error);
  }
};

module.exports = {
  loginWithAutodesk,
  autodeskCallback,
  getInitialAutodeskProjects,
  reauthenticateJwt,
  submitPhoneAndSendOTP,
  verifyOtpAndFinalizeLogin,
  logout,
  getPendingUserDetails,
};
