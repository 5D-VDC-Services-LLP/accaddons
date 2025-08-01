const cron = require('node-cron');
const tenantService = require('./tenantService');
const fs = require('fs');
const path = require('path'); // Import the path module for directory operations
const PdfPrinter = require('pdfmake');
const moment = require('moment');

const { getAllAggregations } = require("../models/escalationAggregateModel");
const { getIssueDetails, getProjectName } = require("./autodeskQueryService");
const { createEscalationPdf } = require('../utils/createPdf')

// --- Main Function to Fetch and Generate PDFs ---
/**
 * Fetches all issue details across tenants and generates PDF reports.
 * @param {string} accessToken - The access token for Autodesk API calls.
 */
async function getAllIssueDetails(accessToken) {
  const tenantConfigs = await tenantService.getAllTenantConfigs();
  for (const tenant of tenantConfigs) {
    const { mongodb_uri, name: tenantNameFromConfig } = tenant;

    try {
      const aggregations = await getAllAggregations(mongodb_uri);
      // Iterate through each aggregation to create separate PDFs
      for (const aggregation of aggregations) {
        if (!aggregation.aggregate) {
          console.warn(`Aggregation for tenant ${tenantNameFromConfig} is missing 'aggregate' property. Skipping.`);
          continue;
        }

        // Extract required fields from aggregation for PDF filename
        const autodeskId = aggregation.autodeskId || 'unknownAutodeskId';
        // Prioritize tenant name from aggregation, fallback to tenant config name
        const tenantNameForPdf = aggregation.tenant || tenantNameFromConfig;
        // Use aggregation date if available, otherwise use current date
        const aggregationDate = aggregation.date ? moment(aggregation.date).format('YYYYMMDD') : moment().format('YYYYMMDD');

        let projectsMap;

        if (aggregation.aggregate instanceof Map) {
          projectsMap = aggregation.aggregate;
        } else if (typeof aggregation.aggregate === 'object' && !Array.isArray(aggregation.aggregate)) {
          projectsMap = new Map(Object.entries(aggregation.aggregate));
        } else {
          console.warn(`Aggregation for tenant ${tenantName} has an invalid 'aggregate' type. Skipping.`);
          continue;
        }

        // Map to store aggregated project data for the current aggregation
        const currentAggregationProjectDataMap = new Map();

        for (const [projectId, projectDetails] of projectsMap.entries()) {
          const issueIds = projectDetails.issues ? projectDetails.issues.join(',') : '';
          const formIds = projectDetails.forms ? projectDetails.forms.join(',') : '';
          const reviewIds = projectDetails.reviews ? projectDetails.reviews.join(',') : '';

          let issue_details = [];
          let form_details = [];
          let review_details = [];

          // Fetch issue details if issueIds exist
          if (issueIds) {
            try {
              const fetchedIssues = await getIssueDetails(projectId, issueIds, accessToken);
              issue_details = fetchedIssues.map(issue => ({
                ...issue,
                // Updated link format for issues
                link: `https://acc.autodesk.com/docs/issues/projects/${projectId}/issues?issueId=${issue.id || issue.displayId}`
              }));
            } catch (error) {
              console.error(`Error fetching issue details for project ${projectId}:`, error.message);
            }
          }

          // --- 🔽 Fetch Project Name using Autodesk API ---
          let projectName = `Project ${projectId}`; // fallback
          try {
            projectName = await getProjectName(accessToken, projectId);
          } catch (error) {
            console.warn(`⚠️ Could not fetch name for project ${projectId}. Using default.`, error.message);
          }

          // Initialize or update project data in the map for the current aggregation
          if (!currentAggregationProjectDataMap.has(projectId)) {
            currentAggregationProjectDataMap.set(projectId, {
              name: projectName, // Placeholder name, as actual project name is not in aggregation
              issues: [],
              forms: [],
              reviews: []
            });
          }
          const projectData = currentAggregationProjectDataMap.get(projectId);

          // Add fetched details to the respective arrays
          projectData.issues.push(...issue_details);
          projectData.forms.push(...form_details);
          projectData.reviews.push(...review_details);
        }

        // Convert the Map values to an array for createEscalationPdf for THIS aggregation
        const dataByProjectForAggregation = Array.from(currentAggregationProjectDataMap.values());

        // Generate the PDF for the current aggregation's projects
        if (dataByProjectForAggregation.length > 0) {
          await createEscalationPdf(dataByProjectForAggregation, autodeskId, tenantNameForPdf, aggregationDate);
        } else {
          console.log(`No project data found for aggregation (Autodesk ID: ${autodeskId}, Tenant: ${tenantNameForPdf}) to generate PDF.`);
        }
      }
    } catch (error) {
      console.error(`Error processing tenant ${tenantNameFromConfig}:`, error.message);
    }
  }
}

const schedulePDFCron = (accessToken) => {
  const isDev = process.env.NODE_ENV !== 'production';
  const schedule = isDev ? '*/1 * * * *' : '0 6 * * *'; // Every minute for dev, 6 AM for prod

  cron.schedule(schedule, async () => {
    console.log(`\n🛠️ Running PDF CRON: [${process.env.NODE_ENV}]`);
    try {
      await getAllIssueDetails(accessToken);
    } catch (err) {
      console.error('PDF Cron failed:', err);
    }
  });
};

module.exports = { getAllIssueDetails, schedulePDFCron };
