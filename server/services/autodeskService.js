// src/services/autodeskService.js
const axios = require('axios');
const config = require('../config'); // Use config for static endpoints only
const CustomError = require('../utils/customError');

const APS_BASE_URL = 'https://developer.api.autodesk.com';
const OAUTH_TOKEN_URL = 'https://developer.api.autodesk.com/authentication/v2/token';

/**
 * Exchanges an Autodesk authorization code for APS access and refresh tokens.
 * @param {string} clientId - The APS Client ID for the tenant.
 * @param {string} clientSecret - The APS Client Secret for the tenant.
 * @param {string} callbackUrl - The APS Callback URL for the tenant.
 * @param {string} code - The authorization code received from Autodesk.
 * @returns {Promise<Object>} - An object containing access_token and refresh_token.
 */
const getApsTokens = async (clientId, clientSecret, callbackUrl, code) => {
  try {
    const response = await axios.post(config.autodesk.tokenUrl,
      new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: callbackUrl,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error exchanging Autodesk code for tokens:', error.response ? error.response.data : error.message);
    throw new CustomError('Failed to get Autodesk tokens.', error.response ? error.response.status : 500);
  }
};

const refreshApsToken= async(clientId, clientSecret, refreshToken) => {
  try {
    const response = await axios.post(config.autodesk.tokenUrl,
      new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error refreshing Autodesk Token:', error.response ? error.response.data : error.message);
    throw new CustomError('Failed to refresh Autodesk tokens.', error.response ? error.response.status : 500);
  }
}

/**
 * Fetches the Autodesk user profile using an APS access token.
 * (No change here, as it uses the already obtained access token)
 * @param {string} apsAccessToken - The APS access token.
 * @returns {Promise<Object>} - The Autodesk user profile data.
 */
const getAutodeskUserProfile = async (apsAccessToken) => {
  try {
    const response = await axios.get(`${APS_BASE_URL}/userprofile/v1/users/@me`, {
      headers: {
        Authorization: `Bearer ${apsAccessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching Autodesk user profile:', error.response ? error.response.data : error.message);
    throw new CustomError('Failed to fetch Autodesk user profile.', error.response ? error.response.status : 500);
  }
};

/**
 * Fetches the list of hubs (e.g., BIM 360, Fusion Team) the user has access to.
 * This is a common first step to then get projects within a specific hub.
 * @returns {Promise<Array>} Array of hub objects.
 */
const getAutodeskHubs = async (apsAccessToken) => {
  try {
    const response = await axios.get(`${APS_BASE_URL}/project/v1/hubs`, {
      headers: {
        'Authorization': `Bearer ${apsAccessToken}`,
      },
    });
    return response.data.data; // The APS hubs endpoint usually returns data in a 'data' array
  } catch (error) {
    console.error('Error fetching Autodesk Hubs:', error.response ? error.response.data : error.message);
    throw new CustomError('Failed to fetch Autodesk Hubs.', error.response ? error.response.status : 500);
  }
};

/**
 * Fetches projects within a specific hub.
 * @param {string} hubId - The ID of the hub.
 * @returns {Promise<Array>} Array of project objects.
 */
const getAutodeskProjectsInHub = async (apsAccessToken, hubId) => {
  const baseUrl = `https://developer.api.autodesk.com/construction/admin/v1/accounts/${hubId}/projects`;
  let url = baseUrl;
  let params = { fields: 'name,classification,status' };
  const headers = { Authorization: `Bearer ${apsAccessToken}` };
  const allProjects = [];

  while (url) {
    try {
      const response = await axios.get(url, {
        headers,
        params,
        timeout: 10000,
      });

      if (response.status !== 200) {
        console.error(`Error ${response.status}: ${response.statusText}`);
        break;
      }

      const data = response.data;
      const projects = data.results || [];
      const nextUrl = data.pagination?.nextUrl;

      allProjects.push(...projects);
      console.log(`Fetched ${projects.length} projects, total so far: ${allProjects.length}`);

      // Prepare for next page
      if (nextUrl) {
        url = nextUrl.startsWith('/')
          ? `https://developer.api.autodesk.com${nextUrl}`
          : nextUrl;
        params = undefined; // Avoid sending query params again
      } else {
        url = null;
      }
    } catch (error) {
      console.error(
        `Error fetching Autodesk projects for hub ${hubId}:`,
        error.response?.data || error.message
      );
      throw new CustomError(
        `Failed to fetch Autodesk projects for hub ${hubId}.`,
        error.response?.status || 500
      );
    }
  }

  return allProjects;
};

/**
 * Fetches all users from an Autodesk Construction Cloud project.
 * Applies pagination and restricts fields to firstName, lastName, autodeskId.
 *
 * @param {string} apsAccessToken - APS OAuth token.
 * @param {string} projectId - The Autodesk Project ID.
 * @returns {Promise<Array>} - Array of user objects with selected fields.
 */
const getAutodeskProjectUsers = async (apsAccessToken, projectId) => {
  let url = `https://developer.api.autodesk.com/construction/admin/v1/projects/${projectId}/users`;
  const params = {
    fields: 'autodeskId,email,name,roles', // Restrict response
    limit: 100, // Increase limit to reduce pagination loops (max = 100)
  };
  const headers = {
    Authorization: `Bearer ${apsAccessToken}`,
  };

  const allUsers = [];

  while (url) {
    try {
      const response = await axios.get(url, {
        headers,
        params,
        timeout: 10000,
      });

      if (response.status !== 200) {
        console.error(`Error ${response.status}: ${response.statusText}`);
        break;
      }

      const { results = [], pagination } = response.data;
      allUsers.push(...results);
      console.log(`Fetched ${results.length} users, total so far: ${allUsers.length}`);

      // Prepare for next page
      if (pagination?.nextUrl) {
        url = pagination.nextUrl.startsWith('/')
          ? `https://developer.api.autodesk.com${pagination.nextUrl}`
          : pagination.nextUrl;

        // Set params to undefined to avoid conflict with nextUrl query
        params = undefined;
      } else {
        url = null;
      }

    } catch (error) {
      console.error(
        `Error fetching project users for project ${projectId}:`,
        error.response?.data || error.message
      );
      throw new CustomError(
        `Failed to fetch project users for project ${projectId}.`,
        error.response?.status || 500
      );
    }
  }

  return allUsers;
};

/**
 * Fetches all users from an Autodesk Construction Cloud project.
 * Applies pagination and restricts fields to firstName, lastName, autodeskId.
 *
 * @param {string} apsAccessToken - APS OAuth token.
 * @param {string} accountId
 * @param {string} projectId - The Autodesk Project ID.
 * @returns {Promise<Array>} - Array of user objects with selected fields.
 */
const getAutodeskProjectCompany = async (apsAccessToken, accountId, projectId) => {
  const baseUrl = `https://developer.api.autodesk.com/hq/v1/accounts/${accountId}/projects/${projectId}/companies`;
  const headers = {
    Authorization: `Bearer ${apsAccessToken}`,
  };

  const allCompanies = [];
  let offset = 0;
  const limit = 100;
  

  try {
    while (true) {
      const url = `${baseUrl}?limit=${limit}&offset=${offset}`;

      const response = await axios.get(url, {
        headers,
        timeout: 10000,
      });

      if (response.status !== 200 || !Array.isArray(response.data)) {
        throw new CustomError(`Unexpected response format for companies`, response.status);
      }

      const companies = response.data;

      // Extract only the required fields
      const cleaned = companies.map(c => ({
        id: c.id,
        name: c.name,
      }));

      allCompanies.push(...cleaned);
      console.log(`Fetched ${cleaned.length} companies, total so far: ${allCompanies.length}`);

      // If fewer results than limit, we are done
      if (companies.length < limit) break;

      offset += limit;
    }

    return allCompanies;

  } catch (error) {
    console.error(
      `Error fetching project companies for project ${projectId}:`,
      error.response?.data || error.message
    );
    throw new CustomError(
      `Failed to fetch project companies for project ${projectId}.`,
      error.response?.status || 500
    );
  }
};

/**
 * Fetches all issue types & subtypes from an Autodesk Construction Cloud project.
 * Applies pagination
 *
 * @param {string} apsAccessToken - APS OAuth token.
 * @param {string} projectId - The Autodesk Project ID.
 * @returns {Promise<Array>} - Array of user objects with selected fields.
 */

const getAutodeskIssueTypes = async (apsAccessToken, projectId) => {
  const baseUrl = `https://developer.api.autodesk.com/construction/issues/v1/projects/${projectId}/issue-types`;
  const headers = {
    Authorization: `Bearer ${apsAccessToken}`,
    'Content-Type': 'application/json',
  };

  const allIssueTypes = [];
  let offset = 0;
  const limit = 100;

  try {
    while (true) {
      const url = `${baseUrl}?limit=${limit}&offset=${offset}&include=subtypes`;

      const response = await axios.get(url, {
        headers,
        timeout: 10000,
      });

      if (response.status !== 200 || !response.data?.results) {
        throw new CustomError('Unexpected response format for issue types', response.status);
      }

      const { results, pagination } = response.data;

      allIssueTypes.push(...results);
      console.log(`Fetched ${results.length} issue types, total so far: ${allIssueTypes.length}`);

      offset += limit;
      const total = pagination?.totalResults ?? results.length;

      if (offset >= total || results.length === 0) break;
    }

    return allIssueTypes
      .filter(type => type.isActive)
      .map(type => ({
        id: type.id,
        name: type.title,
        subtypes: (type.subtypes || []).map(sub => ({
          id: sub.id,
          name: sub.title,
        })),
      }));
  } catch (error) {
    console.error(
      `Error fetching issue types for project ${projectId}:`,
      error.response?.data || error.message
    );
    throw new CustomError(
      `Failed to fetch issue types for project ${projectId}.`,
      error.response?.status || 500
    );
  }
};

/**
 * Fetches all issue types & subtypes from an Autodesk Construction Cloud project.
 * Applies pagination
 *
 * @param {string} apsAccessToken - APS OAuth token.
 * @param {string} projectId - The Autodesk Project ID.
 * @returns {Promise<Array>} - Array of user objects with selected fields.
 */

const getAutodeskIssueRootCauses = async (apsAccessToken, projectId) => {
  const baseUrl = `https://developer.api.autodesk.com/construction/issues/v1/projects/${projectId}/issue-root-cause-categories`;
  const headers = {
    Authorization: `Bearer ${apsAccessToken}`,
    'Content-Type': 'application/json',
  };

  const allIssueRootCauses = [];
  let offset = 0;
  const limit = 100;

  try {
    while (true) {
      const url = `${baseUrl}?limit=${limit}&offset=${offset}&include=rootcauses`;

      const response = await axios.get(url, {
        headers,
        timeout: 10000,
      });

      if (response.status !== 200 || !response.data?.results) {
        throw new CustomError('Unexpected response format for issue types', response.status);
      }

      const { results, pagination } = response.data;

      allIssueRootCauses.push(...results);
      console.log(`Fetched ${results.length} issue types, total so far: ${allIssueRootCauses.length}`);

      offset += limit;
      const total = pagination?.totalResults ?? results.length;

      if (offset >= total || results.length === 0) break;
    }

    return allIssueRootCauses
      .filter(type => type.isActive)
      .map(type => ({
        id: type.id,
        name: type.title,
        rootCauses: (type.rootCauses || []).map(sub => ({
          id: sub.id,
          name: sub.title,
        })),
      }));
  } catch (error) {
    console.error(
      `Error fetching issue root causes for project ${projectId}:`,
      error.response?.data || error.message
    );
    throw new CustomError(
      `Failed to fetch issue root causes for project ${projectId}.`,
      error.response?.status || 500
    );
  }
};

/**
 * Fetches all ACTIVE review workflows from an Autodesk Construction Cloud project.
 * Applies pagination using the nextUrl field from the API.
 *
 * @param {string} apsAccessToken - APS OAuth token.
 * @param {string} projectId - The Autodesk Project ID.
 * @returns {Promise<Array>} - Array of workflow objects with selected fields.
 */

const getAutodeskReviewWorkflows = async (apsAccessToken, projectId) => {
  const baseUrl = `https://developer.api.autodesk.com/construction/reviews/v1/projects/${projectId}/workflows`;
  const headers = {
    Authorization: `Bearer ${apsAccessToken}`,
    'Content-Type': 'application/json',
  };

  const allWorkflows = [];
  let nextUrl = `${baseUrl}?limit=50&offset=0&filter[status]=ACTIVE`;

  try {
    while (nextUrl) {
      const response = await axios.get(nextUrl, {
        headers,
        timeout: 10000,
      });

      if (response.status !== 200 || !Array.isArray(response.data?.results)) {
        throw new CustomError('Unexpected response format for review workflows', response.status);
      }

      const { results, pagination } = response.data;

      allWorkflows.push(...results);
      console.log(`Fetched ${results.length} workflows, total so far: ${allWorkflows.length}`);

      nextUrl = pagination?.nextUrl || null;
    }

    return allWorkflows.map(wf => ({
      id: wf.id,
      name: wf.name,
      steps: wf.steps,
    }));
  } catch (error) {
    console.error(
      `Error fetching review workflows for project ${projectId}:`,
      error.response?.data || error.message
    );
    throw new CustomError(
      `Failed to fetch review workflows for project ${projectId}.`,
      error.response?.status || 500
    );
  }
};

/**
 * Fetches all form templates for a given Autodesk Construction Cloud project.
 * Applies pagination using `nextUrl` from the response.
 *
 * @param {string} apsAccessToken - APS OAuth token.
 * @param {string} projectId - The Autodesk Project ID.
 * @returns {Promise<Array>} - Array of form templates with selected fields.
 */
const getAutodeskFormTemplates = async (apsAccessToken, projectId) => {
  const baseUrl = `https://developer.api.autodesk.com/construction/forms/v1/projects/${projectId}/form-templates`;
  const headers = {
    Authorization: `Bearer ${apsAccessToken}`,
    'Content-Type': 'application/json',
  };

  const allTemplates = [];
  let nextUrl = `${baseUrl}?limit=50&offset=0`;

  try {
    while (nextUrl) {
      const response = await axios.get(nextUrl, {
        headers,
        timeout: 10000,
      });

      const { data, pagination } = response.data;

      if (response.status !== 200 || !Array.isArray(data)) {
        throw new CustomError('Unexpected response format for form templates', response.status);
      }

      allTemplates.push(...data);
      console.log(`Fetched ${data.length} form templates, total so far: ${allTemplates.length}`);

      nextUrl = response.data?.pagination?.nextUrl || null;
    }

    return allTemplates.map(template => ({
      id: template.id,
      name: template.name,
    }));
  } catch (error) {
    console.error(`Error fetching form templates for project ${projectId}:`, error.response?.data || error.message);
    throw new CustomError(
      `Failed to fetch form templates for project ${projectId}.`,
      error.response?.status || 500
    );
  }
};




module.exports = {
  getApsTokens,
  refreshApsToken,
  getAutodeskUserProfile,
  getAutodeskHubs,
  getAutodeskProjectsInHub,
  getAutodeskProjectUsers,
  getAutodeskProjectCompany,
  getAutodeskIssueTypes,
  getAutodeskIssueRootCauses,
  getAutodeskReviewWorkflows,
  getAutodeskFormTemplates,
};