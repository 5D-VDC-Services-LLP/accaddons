// const fs = require('fs');
// const PdfPrinter = require('pdfmake');
// const moment = require('moment');

// const { getAllAggregations } = require("../models/escalationAggregateModel");
// const { getIssueDetails } = require("./autodeskQueryService");


// async function getAllIssueDetails(accessToken) {

//   for (const tenant of tenantConfigs) {
//     const { mongodb_uri, name: tenantName } = tenant;

//     try {
//       const aggregations = await getAllAggregations(mongodb_uri);

//       for (const aggregation of aggregations) {
//         // The 'aggregate' field is a Map where keys are project_ids
//         if (aggregation.aggregate) { // Check if aggregate field exists
//           let projectsMap;

//           // Determine if it's a Map or a plain object
//           if (aggregation.aggregate instanceof Map) {
//             projectsMap = aggregation.aggregate;
//           } else if (typeof aggregation.aggregate === 'object' && !Array.isArray(aggregation.aggregate)) {
//             // Convert plain object to Map for consistent iteration
//             projectsMap = new Map(Object.entries(aggregation.aggregate));
//           } else {
//             console.warn(`Aggregation for tenant ${tenantName} has an invalid 'aggregate' type. Skipping.`);
//             continue; // Skip to next aggregation if aggregate field is malformed
//           }

//           for (const [projectId, projectDetails] of projectsMap.entries()) {
//             const issueIds = projectDetails.issues ? projectDetails.issues.join(', ') : '';
//             const formIds = projectDetails.forms ? projectDetails.forms.join(', ') : '';
//             const reviewIds = projectDetails.reviews ? projectDetails.reviews.join(', ') : '';

//             console.log("This is issueIds" ,issueIds)

//             let issue_details = getIssueDetails(projectId, issueIds, accessToken);
//             // let form_details = getIssueDetails(projectId, formIds, accessToken);
//             // let review_details = getIssueDetails(projectId, reviewIds, accessToken);
//           }
//         }
//     }
//     } catch (error) {
//       console.error(`Error fetching issue details for tenant ${tenantName}:`, error.message);
//     }
//   }
// }

// module.exports = { getAllIssueDetails };
        

const fs = require('fs');
const path = require('path'); // Import the path module for directory operations
const PdfPrinter = require('pdfmake');
const moment = require('moment');
const cron = require('node-cron');
const tenantService = require('./tenantService');

const { getAllAggregations } = require("../models/escalationAggregateModel");
const { getIssueDetails } = require("./autodeskQueryService");

// --- PDFMake Configuration ---
// Fonts required by pdfmake
// Ensure these paths are correct relative to where your script runs
const fonts = {
  Arial: {
    normal: 'C:/Windows/Fonts/arial.ttf',
    bold: 'C:/Windows/Fonts/arialbd.ttf',
    italics: 'C:/Windows/Fonts/ariali.ttf',
    bolditalics: 'C:/Windows/Fonts/arialbi.ttf'
  }
};

const printer = new PdfPrinter(fonts);

// --- Helper Functions for PDF Generation ---

/**
 * Helper to bucket items (issues, forms, reviews) by their overdue age.
 * @param {Array<Object>} items - An array of items, each expected to have a 'due_date' property.
 * @returns {Object} An object where keys are overdue age labels and values are arrays of items.
 */
function groupByOverdue(items) {
  const now = moment();
  const buckets = {
    '>7 days': [],
    '5–7 days': [],
    '3–5 days': [],
    '1–3 days': [],
    '<1 day': []
  };

  for (const item of items) {
    if (!item.dueDate) {
      // If an item has no due_date, it cannot be categorized by overdue status.
      // You might want to add it to a 'No Due Date' bucket or skip it.
      // For now, we'll skip it as it won't fit the overdue logic.
      continue;
    }
    const due = moment(item.dueDate);
    const diffDays = now.diff(due, 'days');

    if (diffDays > 7) buckets['>7 days'].push(item);
    else if (diffDays > 5) buckets['5–7 days'].push(item);
    else if (diffDays > 3) buckets['3–5 days'].push(item);
    else if (diffDays > 1) buckets['1–3 days'].push(item);
    else buckets['<1 day'].push(item);
  }

  return buckets;
}

/**
 * Generates a PDFMake table definition from an array of items with specific columns.
 * @param {Array<Object>} items - An array of items to be displayed in the table.
 * Each item is expected to have: displayId, title, createdAt, status, link.
 * @returns {Object} A PDFMake table definition object.
 */
function tableFromItems(items) {
  return {
    table: {
      widths: ['auto', '*', 'auto', 'auto', 'auto'], // Column widths for Display ID, Title, Created At, Status, Link
      body: [
        // Table header row with new column names
        [{ text: 'ID', bold: true }, { text: 'Title', bold: true }, { text: 'Created At', bold: true }, { text: 'Status', bold: true }, { text: 'Link', bold: true }],
        // Map items to table rows using the new properties
        ...items.map(item => [
          item.displayId || '-', // Use displayId
          item.title || '-',     // Use title
          item.createdAt ? moment(item.createdAt).format('YYYY-MM-DD') : '-', // Format createdAt
          item.status || '-',    // Use status
          {
            text: 'Open', // Link text
            link: item.link || '#', // Use the pre-constructed link
            color: 'blue',
            decoration: 'underline'
          }
        ])
      ]
    },
    margin: [0, 5, 0, 10] // Top, right, bottom, left margin
  };
}

/**
 * Creates an escalation PDF report from structured project data.
 * @param {Array<Object>} dataByProject - An array of project objects, each containing issues, forms, and reviews.
 * @param {string} tenantName - The name of the tenant, used for the PDF filename.
 */
async function createEscalationPdf(dataByProject, autodeskId, tenantName, aggregationDate) {
  const outputDir = 'escalation Pdfs'; // Define the output directory name
  const outputDirPath = path.join(__dirname, outputDir); // Construct full path

  // Ensure the output directory exists
  if (!fs.existsSync(outputDirPath)) {
    console.log(`Creating directory: ${outputDirPath}`);
    fs.mkdirSync(outputDirPath);
  }

  const docContent = [];

  // Iterate over each project to add its content to the PDF
  for (const project of dataByProject) {
    if (!project.name) {
        console.warn('Skipping project with no name:', project);
        continue;
    }
    docContent.push({ text: project.name, style: 'header' });

    // Iterate over different module types (issues, forms, reviews)
    for (const module of ['issues', 'forms', 'reviews']) {
      const items = project[module] || []; // Get items for the current module, default to empty array if none

      if (!items.length) {
        // If no items for this module, skip to the next
        continue;
      }

      docContent.push({ text: module.charAt(0).toUpperCase() + module.slice(1), style: 'subheader' });

      // Group items by their overdue status
      const grouped = groupByOverdue(items);

      // Iterate over each overdue group and add to PDF
      for (const [label, groupItems] of Object.entries(grouped)) {
        if (!groupItems.length) {
          // If no items in this group, skip
          continue;
        }

        docContent.push({ text: `Overdue: ${label}`, style: 'overdueHeader' });
        docContent.push(tableFromItems(groupItems));
      }
    }
  }

  // Define the overall document structure and styles
  const docDefinition = {
    content: docContent,
    styles: {
      header: { fontSize: 18, bold: true, margin: [0, 10, 0, 5] },
      subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
      overdueHeader: { fontSize: 12, italics: true, margin: [0, 5, 0, 2] }
    },
    defaultStyle: {
      font: 'Arial' // Set default font
    }
  };

  // Generate a unique filename for the PDF
  const filename = path.join(outputDirPath, `${autodeskId}_${tenantName}_${aggregationDate}.pdf`);

  // Create the PDF and pipe it to a file stream
  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  pdfDoc.pipe(fs.createWriteStream(filename));
  pdfDoc.end();

  console.log(`PDF generated successfully: ${filename}`);
}

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
          // Initialize or update project data in the map for the current aggregation
          if (!currentAggregationProjectDataMap.has(projectId)) {
            currentAggregationProjectDataMap.set(projectId, {
              name: `Project ${projectId}`, // Placeholder name, as actual project name is not in aggregation
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
      console.error(`Error processing tenant ${tenantName}:`, error.message);
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
