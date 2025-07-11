const axios = require('axios');
const { mapWorkflowFiltersToIssueAPI } = require('../utils/issueFilterMapper');

async function getItemCount(workflow, accessToken) {
  const { module, filters = [], project_id } = workflow;

  if (module !== 'issues') {
    console.warn(`[Count] Skipping non-issue module: ${module}`);
    return 0;
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

    return response.data.results?.length || 0;
  } catch (err) {
    console.error(`[AUTODESK] Failed to query issues for workflow ${workflow.display_id}`);
    console.error(err?.response?.data || err.message);
    return 0;
  }
}

module.exports = { getItemCount };
