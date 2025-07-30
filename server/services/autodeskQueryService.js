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
    return results.map(issue => issue.id);  // Return just the IDs
  } catch (err) {
    console.error(`[AUTODESK] Failed to query issues for workflow ${workflow.display_id}`);
    console.error(err?.response?.data || err.message);
    return 0;
  }
}

module.exports = { getItemIds };
