// src/controllers/autodeskDataController.js
const autodeskService = require('../services/autodeskService');
const autodeskTokenService = require('../services/autodeskTokenService');
const CustomError = require('../utils/customError');
const axios = require('axios');
/**
 * Utility function to get a valid (and potentially refreshed) Autodesk APS access token.
 * This function handles fetching from MongoDB, checking expiry, and refreshing if needed.
 * @param {string} autodeskId - The Autodesk user ID.
 * @param {object} companyConfig - The company configuration object (contains MongoDB URI, APS client ID/secret).
 * @returns {Promise<string>} - The valid Autodesk APS access token.
 * @throws {CustomError} If tokens are missing, invalid, or cannot be refreshed.
 */
const getValidApsAccessToken = async (autodeskId, companyConfig) => {
  const { mongodb_uri, aps_client_id, aps_client_secret } = companyConfig;

  let storedApsToken = await autodeskTokenService.getApsToken(mongodb_uri, autodeskId);

  if (!storedApsToken || !storedApsToken.access_token) {
    throw new CustomError('Autodesk APS tokens not found for this user in this tenant. Please re-authenticate.', 401);
  }

  const now = new Date();
  // Allow a small buffer (e.g., 5 minutes) before actual expiration to refresh
  const expiryBuffer = 5 * 60 * 1000; // 5 minutes in milliseconds
  const isExpired = storedApsToken.expires_at.getTime() - now.getTime() < expiryBuffer;

  let currentAccessToken = storedApsToken.access_token;
  let currentRefreshToken = storedApsToken.refresh_token;

  if (isExpired && currentRefreshToken) {
    console.log(`Autodesk APS token for user ${autodeskId} in tenant ${companyConfig.subdomain} is expired. Attempting refresh...`);
    try {
      const newApsTokens = await autodeskService.refreshApsToken(
        aps_client_id,
        aps_client_secret,
        currentRefreshToken
      );

      // Calculate new expires_at timestamp
      const newExpiresAt = new Date(Date.now() + newApsTokens.expires_in * 1000);

      // Update the stored tokens in MongoDB
      const updatedTokenDoc = await autodeskTokenService.upsertApsToken(
        mongodb_uri,
        autodeskId,
        newApsTokens.access_token,
        newExpiresAt,
        newApsTokens.refresh_token || currentRefreshToken // Use new refresh token if provided, else keep old
      );
      currentAccessToken = updatedTokenDoc.access_token;
      console.log(`Autodesk APS token refreshed for user ${autodeskId}.`);
    } catch (refreshError) {
      console.error(`Failed to refresh Autodesk APS token for user ${autodeskId}:`, refreshError);
      throw new CustomError('Failed to refresh Autodesk APS token. Please re-authenticate.', 401);
    }
  } else if (isExpired && !currentRefreshToken) {
    throw new CustomError('Autodesk APS access token expired and no refresh token available. Please re-authenticate.', 401);
  } else {
    console.log(`Autodesk APS token for user ${autodeskId} is valid. Expiration: ${storedApsToken.expires_at.toLocaleString()}.`);
  }
  return currentAccessToken;
};

/**
 * Fetches Autodesk Hubs and Projects, validating access based on the requirements.
 * Throws errors if no hubs or no projects are found.
 * @param {string} autodeskId - The Autodesk user ID.
 * @param {object} companyConfig - The company configuration object.
 * @returns {Promise<Array>} - A flattened list of all projects found across all hubs.
 * @throws {CustomError} If access to hubs or projects is not sufficient.
 */
const getAndValidateAutodeskProjectAccess = async (autodeskId, companyConfig) => {
  let accessToken;
  try {
    accessToken = await getValidApsAccessToken(autodeskId, companyConfig);
  } catch (error) {
    // Re-throw token errors as they are critical for login
    throw error;
  }

  // 1. Get Hubs
  let hubs = [];
  try {
    hubs = await autodeskService.getAutodeskHubs(accessToken);
  } catch (error) {
    console.error('Error getting Autodesk Hubs:', error);
    throw new CustomError('Failed to retrieve Autodesk Hubs. Please try again.', 500);
  }

  if (!hubs || hubs.length === 0) {
    throw new CustomError('Access Denied: No Autodesk Hubs found for your account. Please ensure you have access to Autodesk Construction Cloud (ACC) or BIM 360.', 403);
  }
  console.log(`Found ${hubs.length} Autodesk Hubs for user ${autodeskId}.`);


  // 2. Get Projects for each Hub and aggregate
  let allProjects = [];
  for (const hub of hubs) {
    try {
      const projectsInHub = await autodeskService.getAutodeskProjectsInHub(accessToken, hub.id);
      if (projectsInHub && projectsInHub.length > 0) {
        allProjects = allProjects.concat(projectsInHub.map(project => ({
          ...project,
          hub_id: hub.id,
          hub_name: hub.attributes.name // Add hub context to projects
        })));
      }
    } catch (error) {
      // Log error but don't necessarily throw, as one hub failing shouldn't block all
      console.warn(`Could not retrieve projects for hub ${hub.id}:`, error.message);
    }
  }

  if (allProjects.length === 0) {
    throw new CustomError('Access Denied: No Autodesk Projects found across your accessible Hubs. Please ensure you have active projects in ACC/BIM 360.', 403);
  }
  console.log(`Found ${allProjects.length} Autodesk Projects across all Hubs for user ${autodeskId}.`);

  return allProjects;
};




/**
 * Utility function to fetch a 2-legged Autodesk APS access token using client credentials.
 * 
 * @param {object} req - Express request object, assumes companyConfig is populated in middleware.
 * @param {object} res - Express response object (not used directly here).
 * @param {function} next - Express next middleware function (not used here).
 * @returns {Promise<string>} - The valid APS access token (2-legged).
 * @throws {CustomError} - If credentials are missing or token fetch fails.
 */
const getValid2leggedApsAccessToken = async (companyConfig) => {
  try {
    const { aps_client_id, aps_client_secret } = companyConfig;

    // Encode client_id:client_secret in base64
    const base64Credentials = Buffer.from(`${aps_client_id}:${aps_client_secret}`).toString('base64');

    // Construct request payload
    const tokenUrl = 'https://developer.api.autodesk.com/authentication/v2/token';
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'Authorization': `Basic ${base64Credentials}`,
    };
    const data = new URLSearchParams({
      grant_type: 'client_credentials',
      scope: 'data:read account:read',
    });

    // Send request
    const response = await axios.post(tokenUrl, data, { headers });

    if (!response.data || !response.data.access_token) {
      throw new CustomError('Failed to fetch Autodesk access token.', 502);
    }

    return response.data.access_token;
  } catch (error) {
    console.error('Error getting Autodesk 2-legged token:', error.response?.data || error.message);
    throw new CustomError(
      'Could not retrieve Autodesk APS access token.',
      error.response?.status || 500
    );
  }
};

const fetchProjectUsers = async (req, res, next) => {
  try {
    const { companyConfig } = req;

    if (!companyConfig || !companyConfig.aps_client_id || !companyConfig.aps_client_secret) {
      throw new CustomError(
        'Tenant-specific Autodesk credentials not found. Please access via a valid tenant subdomain.',
        400
      );
    }
    const accessToken = await getValid2leggedApsAccessToken(companyConfig);
    const { projectId } = req.params;

    if (!projectId) {
      throw new CustomError(
        'No Project ID found',
        500
      )
    }
    console.log(projectId)

    const users = await autodeskService.getAutodeskProjectUsers(accessToken, projectId);

    // Extract unique roles
    const uniqueRolesMap = new Map();

    users.forEach(user => {
      (user.roles || []).forEach(role => {
        const key = `${role.roleGroupId}-${role.name}`;
        if (!uniqueRolesMap.has(key)) {
          uniqueRolesMap.set(key, {
            roleGroupId: role.roleGroupId,
            name: role.name
          });
        }
      });
    });

    const roles = Array.from(uniqueRolesMap.values());

    res.json({ success: true, data: { users, roles } });
  } catch (error) {
    next(error);
  }
};

const fetchProjectCompany = async (req, res, next) => {
  try {
    const { companyConfig } = req;

    if (!companyConfig || !companyConfig.aps_client_id || !companyConfig.aps_client_secret) {
      throw new CustomError(
        'Tenant-specific Autodesk credentials not found. Please access via a valid tenant subdomain.',
        400
      );
    }
    const accessToken = await getValid2leggedApsAccessToken(companyConfig);
    const { companyId } = req.params;

    if (!companyId) {
      throw new CustomError(
        'No Company ID found',
        500
      )
    }
    accountId = `b.${companyConfig.hubId}` 
    const projects = await autodeskService.getAutodeskProjectCompany(accessToken, companyConfig.hub_id, companyId);
    res.json({ success: true, data: projects });
  } catch (error) {
    next(error);
  }
};

// const fetchProjectRole = async (req, res, next) => {
//   try {
//     const { companyConfig } = req;

//     if (!companyConfig || !companyConfig.aps_client_id || !companyConfig.aps_client_secret) {
//       throw new CustomError(
//         'Tenant-specific Autodesk credentials not found. Please access via a valid tenant subdomain.',
//         400
//       );
//     }
//     const accessToken = await getValid2leggedApsAccessToken(companyConfig);
//     const { companyId } = req.params;

//     if (!companyId) {
//       throw new CustomError(
//         'No Company ID found',
//         500
//       )
//     }
//     accountId = `b.${companyConfig.hubId}` 
//     const projects = await autodeskService.getAutodeskProjectCompany(accessToken, companyConfig.hub_id, companyId);
//     res.json({ success: true, data: projects });
//   } catch (error) {
//     next(error);
//   }
// };

/**
 * Controller: Fetch issue types and root causes for a given Autodesk project.
 * Requires 3-legged OAuth (user-specific token).
 *
 * @param {object} req - Express request object, with autodeskId and companyConfig in req.user
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const fetchIssueTypesAndRootCauses = async (req, res, next) => {
  try {
    const { autodeskId } = req.user;
    const { companyConfig } = req;
    const { projectId } = req.params;
    const { module } = req.query;

    if (!companyConfig?.aps_client_id || !companyConfig?.aps_client_secret) {
      throw new CustomError('Tenant-specific Autodesk credentials are missing.', 400);
    }

    if (!autodeskId) {
      throw new CustomError('Missing Autodesk user ID for 3-legged access.', 400);
    }

    if (!projectId) {
      throw new CustomError('Missing projectId in request parameters.', 400);
    }

    const accessToken = await getValidApsAccessToken(autodeskId, companyConfig);
    const accessToken2Legged = await getValid2leggedApsAccessToken(companyConfig);

    // Fetch both in parallel
    const [issueTypes, projectCompanies, projectUsers] = await Promise.all([
      autodeskService.getAutodeskIssueTypes(accessToken, projectId),
      autodeskService.getAutodeskProjectCompany(accessToken2Legged, companyConfig?.hub_id, projectId),
      autodeskService.getAutodeskProjectUsers(accessToken, projectId)
    ]);

    // Extract unique roles
    const uniqueRolesMap = new Map();

    projectUsers.forEach(user => {
      (user.roles || []).forEach(role => {
        const key = `${role.roleGroupId}-${role.name}`;
        if (!uniqueRolesMap.has(key)) {
          uniqueRolesMap.set(key, {
            id: role.roleGroupId,
            name: role.name
          });
        }
      });
    });

    const projectRoles = Array.from(uniqueRolesMap.values());

    let responseData = {};
    if (module === 'notifications') {
      responseData = { "Issue Types": issueTypes }; // Only Issue Types
    } else if (module === 'escalations') {
      responseData = {
        "Due Date": [
          { "id": "overdue_1", "name": "Overdue (< 1 days)" },
          { "id": "overdue_3", "name": "Overdue (1 - 3 days)" },
          { "id": "overdue_7", "name": "Overdue (3 - 7 days)" },
          { "id": "overdue_critical", "name": "Critical (> 7 days)" },
        ],
        "Assigned To User": projectUsers,
        "Assigned To Role": projectRoles,
        "Assigned To Companies": projectCompanies,
        "Issue Types": issueTypes,
      };
    } else {
      responseData = { "Issue Types": issueTypes }; // default fallback
    }

    res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error in fetchIssueTypesAndRootCauses controller:', error);
    next(error); // Delegates to Express error handler
  }
};

/**
 * Controller: Fetch review workflows (ACTIVE) for a given Autodesk project.
 * Requires 3-legged OAuth (user-specific token).
 *
 * @param {object} req - Express request object, with autodeskId and companyConfig in req.user
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const fetchReviewWorkflows = async (req, res, next) => {
  try {
    const { autodeskId } = req.user;
    const { companyConfig } = req;
    const { projectId } = req.params;

    if (!companyConfig?.aps_client_id || !companyConfig?.aps_client_secret) {
      throw new CustomError('Tenant-specific Autodesk credentials are missing.', 400);
    }

    if (!autodeskId) {
      throw new CustomError('Missing Autodesk user ID for 3-legged access.', 400);
    }

    if (!projectId) {
      throw new CustomError('Missing projectId in request parameters.', 400);
    }

    const accessToken = await getValidApsAccessToken(autodeskId, companyConfig);
    const accessToken2Legged = await getValid2leggedApsAccessToken(companyConfig);

    const [reviewWorkflows, projectCompanies, projectUsers] = await Promise.all([
      autodeskService.getAutodeskReviewWorkflows(accessToken2Legged, projectId, autodeskId),
      autodeskService.getAutodeskProjectCompany(accessToken2Legged, companyConfig?.hub_id, projectId),
      autodeskService.getAutodeskProjectUsers(accessToken, projectId)
    ]);

    console.log("Review Workflows is", reviewWorkflows)

    // Extract unique roles
    const uniqueRolesMap = new Map();

    projectUsers.forEach(user => {
      (user.roles || []).forEach(role => {
        const key = `${role.roleGroupId}-${role.name}`;
        if (!uniqueRolesMap.has(key)) {
          uniqueRolesMap.set(key, {
            id: role.roleGroupId,
            name: role.name
          });
        }
      });
    });

    const projectRoles = Array.from(uniqueRolesMap.values());

    res.status(200).json({
      success: true,
      data: {
         "Next Step Due Date": [
                    { "id": "overdue_1", "name": "Overdue (< 1 days)" },
                    { "id": "overdue_3", "name": "Overdue (1 - 3 days)" },
                    { "id": "overdue_7", "name": "Overdue (3 - 7 days)" },
                    { "id": "overdue_critical", "name": "Critical (> 7 days)" },
                  ],
        "Assigned To User": projectUsers,
        "Assigned To Role": projectRoles,
        "Assigned To Companies": projectCompanies,
        "Review Workflows": reviewWorkflows,
      }
    });
  } catch (error) {
    console.error('Error in fetchReviewWorkflows controller:', error);
    next(error);
  }
};

/**
 * Controller: Fetch form templates for a given Autodesk project.
 * Requires 3-legged OAuth (user-specific token).
 *
 * @param {object} req - Express request object, with autodeskId and companyConfig in req.user
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const fetchFormTemplates = async (req, res, next) => {
  try {
    const { autodeskId } = req.user;
    const { companyConfig } = req;
    const { projectId } = req.params;

    if (!companyConfig?.aps_client_id || !companyConfig?.aps_client_secret) {
      throw new CustomError('Tenant-specific Autodesk credentials are missing.', 400);
    }

    if (!autodeskId) {
      throw new CustomError('Missing Autodesk user ID for 3-legged access.', 400);
    }

    if (!projectId) {
      throw new CustomError('Missing projectId in request parameters.', 400);
    }

    const accessToken = await getValidApsAccessToken(autodeskId, companyConfig);
    const accessToken2Legged = await getValid2leggedApsAccessToken(companyConfig);

    const [formTemplates, projectCompanies, projectUsers] = await Promise.all([
      autodeskService.getAutodeskFormTemplates(accessToken, projectId),
      autodeskService.getAutodeskProjectCompany(accessToken2Legged, companyConfig?.hub_id, projectId),
      autodeskService.getAutodeskProjectUsers(accessToken, projectId)
    ]);

    // Extract unique roles
    const uniqueRolesMap = new Map();

    projectUsers.forEach(user => {
      (user.roles || []).forEach(role => {
        const key = `${role.roleGroupId}-${role.name}`;
        if (!uniqueRolesMap.has(key)) {
          uniqueRolesMap.set(key, {
            id: role.roleGroupId,
            name: role.name
          });
        }
      });
    });

    const projectRoles = Array.from(uniqueRolesMap.values());

    res.status(200).json({
      success: true,
      data: {
         "Created On": [
                    { "id": "created_1", "name": "Yesterday" },
                    { "id": "created_3", "name": "Last 3 days" },
                    { "id": "created_7", "name": "Last 7 days" },
                    { "id": "created_critical", "name": "More than 7 Days" },
                  ],
        "Status": [
                    { "id": "in_progress", "name": "Open" },
                    { "id": "in_review", "name": "In Review" },
                  ],
        "Assigned To User": projectUsers,
        "Assigned To Role": projectRoles,
        "Assigned To Company": projectCompanies,
        "Form Templates": formTemplates,
      }
    });
  } catch (error) {
    console.error('Error in fetchFormTemplates controller:', error);
    next(error); // Express error handler
  }
};

module.exports = {
  getAndValidateAutodeskProjectAccess,
  fetchProjectUsers,
  fetchProjectCompany,
  fetchIssueTypesAndRootCauses,
  fetchReviewWorkflows,
  fetchFormTemplates,
  // No longer exporting checkAndRefreshApsTokens as a public middleware
  // getHubs, getProjectsInHub are also not exported as route handlers anymore
};