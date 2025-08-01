const axios = require('axios');
const { mapWorkflowFiltersToIssueAPI } = require('../utils/issueFilterMapper');

async function getItemIds(workflow, accessToken) {
  const { module, filters = [], project_id } = workflow;

  if (module !== 'issues') {
    console.warn(`[Count] Skipping non-issue module: ${module}`);
    return [];
  }

  const url = `https://developer.api.autodesk.com/construction/issues/v1/projects/${project_id}/issues`;
  const params = mapWorkflowFiltersToIssueAPI(filters);

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      params
    });

    const results = response.data.results || [];
    return results.map(issue => issue.id);
  } catch (err) {
    console.error(`[AUTODESK] Failed to query issues for workflow ${workflow.display_id}`);
    console.error(err?.response?.data || err.message);
    return 0;
  }
}

const getIssueDetails = async (projectId, issueIds, accessToken) => {
  try{
  const url = `https://developer.api.autodesk.com/construction/issues/v1/projects/${projectId}/issues`;
  const params = { 'filter[id]':issueIds, fields: 'displayId,createdAt,dueDate' };

  const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            params: params
        });
  return response.data.results || [];
  } catch (error) {
    console.error(`Error fetching issue details for project ${projectId}, issue ${issueIds}:`, error.message);
    if (error.response) {
        console.error('Autodesk API response error:', error.response.data);
        throw new CustomError(`Failed to fetch issue details from Autodesk API: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`, error.response.status);
    } else if (error.request) {
        console.error('No response received from Autodesk API.');
        throw new CustomError('No response received from Autodesk API.', 500);
    } else {
        throw new CustomError(`Error setting up request to Autodesk API: ${error.message}`, 500);
    }
}
};

const getProjectName =async (accessToken, projectId) => {
  try {
    const url = `https://developer.api.autodesk.com/construction/admin/v1/projects/${projectId}`;
    const params = {fields: 'name'};
    const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            params: params
        });
    return response.data.name || '';
  } catch (error) {
    console.error(`Error fetching project name for projectID: ${projectId}`)
    if (error.response) {
        console.error('Autodesk API response error:', error.response.data);
        throw new CustomError(`Failed to fetch issue details from Autodesk API: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`, error.response.status);
    } else if (error.request) {
        console.error('No response received from Autodesk API.');
        throw new CustomError('No response received from Autodesk API.', 500);
    } else {
        throw new CustomError(`Error setting up request to Autodesk API: ${error.message}`, 500);
    }
  }
}

module.exports = { getItemIds, getIssueDetails, getProjectName };
