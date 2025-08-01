// const fs = require('fs');
// const path = require('path'); // Import the path module for directory operations
// const PdfPrinter = require('pdfmake');
// const moment = require('moment');
// // --- PDFMake Configuration ---
// // Fonts required by pdfmake
// // Ensure these paths are correct relative to where your script runs
// const fonts = {
//   Arial: {
//     normal: 'C:/Windows/Fonts/arial.ttf',
//     bold: 'C:/Windows/Fonts/arialbd.ttf',
//     italics: 'C:/Windows/Fonts/ariali.ttf',
//     bolditalics: 'C:/Windows/Fonts/arialbi.ttf'
//   }
// };

// const printer = new PdfPrinter(fonts);

// // --- Helper Functions for PDF Generation ---

// /**
//  * Helper to bucket items (issues, forms, reviews) by their overdue age.
//  * @param {Array<Object>} items - An array of items, each expected to have a 'due_date' property.
//  * @returns {Object} An object where keys are overdue age labels and values are arrays of items.
//  */
// function groupByOverdue(items) {
//   const now = moment();
//   const buckets = {
//     '>7 days': [],
//     '5–7 days': [],
//     '3–5 days': [],
//     '1–3 days': [],
//     '<1 day': []
//   };

//   for (const item of items) {
//     if (!item.dueDate) {
//       // If an item has no due_date, it cannot be categorized by overdue status.
//       // You might want to add it to a 'No Due Date' bucket or skip it.
//       // For now, we'll skip it as it won't fit the overdue logic.
//       continue;
//     }
//     const due = moment(item.dueDate);
//     const diffDays = now.diff(due, 'days');

//     if (diffDays > 7) buckets['>7 days'].push(item);
//     else if (diffDays > 5) buckets['5–7 days'].push(item);
//     else if (diffDays > 3) buckets['3–5 days'].push(item);
//     else if (diffDays > 1) buckets['1–3 days'].push(item);
//     else buckets['<1 day'].push(item);
//   }

//   return buckets;
// }

// /**
//  * Gets the appropriate background color for overdue category headers
//  * @param {string} label - The overdue label (e.g., '>7 days', '5–7 days', etc.)
//  * @returns {string} The background color for the category
//  */
// function getOverdueHeaderColor(label) {
//   const colorMap = {
//     '>7 days': '#ff6b6b',      // Red for critical (matching image)
//     '5–7 days': '#ffd93d',     // Yellow for high priority
//     '3–5 days': '#ffd93d',     // Yellow for medium priority
//     '1–3 days': '#6bcf7f',     // Green for low priority
//     '<1 day': '#6bcf7f'        // Green for very recent (matching image)
//   };
//   return colorMap[label] || '#6c757d';
// }
// /**
//  * Generates a PDFMake table definition from an array of items with specific columns.
//  * @param {Array<Object>} items - An array of items to be displayed in the table.
//  * Each item is expected to have: displayId, title, createdAt, status, link.
//  * @returns {Object} A PDFMake table definition object.
//  */
// function tableFromItems(items) {
//   return {
//     table: {
//       headerRows: 1,
//       widths: ['10%', '35%', '20%', '15%', '20%'], // Matching proportions from image
//       body: [
//         // Table header row
//         [
//           { text: 'ID', style: 'tableHeader' },
//           { text: 'Title', style: 'tableHeader' },
//           { text: 'Created At', style: 'tableHeader' },
//           { text: 'Status', style: 'tableHeader' },
//           { text: 'Link', style: 'tableHeader' }
//         ],
//         // Table rows
//         ...items.map(item => [
//           { text: item.displayId || '-', style: 'tableCell' },
//           { text: item.title || '-', style: 'tableCell' },
//           { text: item.createdAt ? moment(item.createdAt).format('YYYY-MM-DD') : '-', style: 'tableCell' },
//           { text: item.status || '-', style: 'tableCell' },
//           {
//             text: 'Open',
//             link: item.link || '#',
//             style: 'linkCell'
//           }
//         ])
//       ]
//     },
//     layout: {
//       hLineWidth: function(i, node) {
//         return 1; // All horizontal lines 1pt
//       },
//       vLineWidth: function(i, node) {
//         return 1; // All vertical lines 1pt
//       },
//       hLineColor: function(i, node) {
//         return '#cccccc'; // Light gray borders
//       },
//       vLineColor: function(i, node) {
//         return '#cccccc'; // Light gray borders
//       },
//       paddingLeft: function(i) { return 8; },
//       paddingRight: function(i) { return 8; },
//       paddingTop: function(i) { return 6; },
//       paddingBottom: function(i) { return 6; }
//     },
//     margin: [0, 5, 0, 15]
//   };
// }

// /**
//  * Creates the company header matching the image design
//  * @param {string} tenantName - The tenant name
//  * @param {string} aggregationDate - The report generation date
//  * @returns {Array} Array of PDF content elements for the header
//  */
// function createReportHeader(tenantName, aggregationDate) {
//   return [
//     {
//       columns: [
//         {
//           text: '5D VDC Services LLP',
//           style: 'companyName'
//         },
//         {
//           text: moment(aggregationDate).format('MMMM DD, YYYY'),
//           style: 'reportDate',
//           alignment: 'right'
//         }
//       ],
//       margin: [50, 20, 50, 0]
//     },
//     {
//       text: 'ESCALATION REPORT',
//       style: 'reportTitle',
//       margin: [50, 10, 50, 0]
//     },
//     {
//       canvas: [
//         {
//           type: 'line',
//           x1: 0, y1: 0,
//           x2: 515, y2: 0,
//           lineWidth: 1,
//           lineColor: '#cccccc'
//         }
//       ],
//       margin: [0, 0, 0, 30]
//     }
//   ];
// }

// /**
//  * Creates an escalation PDF report from structured project data.
//  * @param {Array<Object>} dataByProject - An array of project objects, each containing issues, forms, and reviews.
//  * @param {string} tenantName - The name of the tenant, used for the PDF filename.
//  */
// async function createEscalationPdf(dataByProject, autodeskId, tenantName, aggregationDate) {
//   const outputDir = 'escalation Pdfs'; // Define the output directory name
//   const outputDirPath = path.join(__dirname, outputDir); // Construct full path

//   // Ensure the output directory exists
//   if (!fs.existsSync(outputDirPath)) {
//     console.log(`Creating directory: ${outputDirPath}`);
//     fs.mkdirSync(outputDirPath);
//   }

//   const docContent = [];

//   // Add report header
//   docContent.push(...createReportHeader(tenantName, aggregationDate));

//   // Iterate over each project to add its content to the PDF
//   for (const project of dataByProject) {
//     if (!project.name) {
//         console.warn('Skipping project with no name:', project);
//         continue;
//     }

//     // Project header - exactly matching the image
//     docContent.push({
//       text: `Project ${project.id || project.name}`,
//       style: 'projectHeader',
//       margin: [0, 0, 0, 15]
//     });

//     // Iterate over different module types (issues, forms, reviews)
//     for (const module of ['issues', 'forms', 'reviews']) {
//       const items = project[module] || []; // Get items for the current module, default to empty array if none

//       if (!items.length) {
//         // If no items for this module, skip to the next
//         continue;
//       }

//       // Module header (Issues, Forms, Reviews)
//       docContent.push({
//         text: module.charAt(0).toUpperCase() + module.slice(1),
//         style: 'moduleHeader',
//         margin: [0, 10, 0, 15]
//       });

//       // Group items by their overdue status
//       const grouped = groupByOverdue(items);

//       // Iterate over each overdue group and add to PDF
//       for (const [label, groupItems] of Object.entries(grouped)) {
//         if (!groupItems.length) {
//           // If no items in this group, skip
//           continue;
//         }

//         // Overdue category header - colored box exactly like the image
//         const headerColor = getOverdueHeaderColor(label);
//         docContent.push({
//           table: {
//             widths: ['*'],
//             body: [[
//               {
//                 text: `Overdue: ${label}`,
//                 style: 'overdueHeader',
//                 fillColor: headerColor,
//                 color: 'white',
//                 border: [true, true, true, true],
//                 borderColor: ['#cccccc', '#cccccc', '#cccccc', '#cccccc']
//               }
//             ]]
//           },
//           layout: {
//             hLineWidth: function() { return 1; },
//             vLineWidth: function() { return 1; },
//             hLineColor: function() { return '#cccccc'; },
//             vLineColor: function() { return '#cccccc'; }
//           },
//           margin: [0, 5, 0, 0]
//         });

//         docContent.push(tableFromItems(groupItems));
//       }
//     }
//   }

//   // Add footer text exactly like the image
//   docContent.push({
//     text: 'Confidential - Internal Use',
//     style: 'footerText',
//     margin: [0, 30, 0, 0]
//   });

//   // Page number
//   docContent.push({
//     text: '1',
//     style: 'pageNumber',
//     alignment: 'center',
//     margin: [0, 20, 0, 0]
//   });

//   // Document definition with minimal styling matching the image
//   const docDefinition = {
//     content: docContent,
//     pageSize: 'A4',
//     styles: {
//       // Header styles
//       companyName: {
//         fontSize: 16,
//         bold: true,
//         color: '#000000'
//       },
//       reportDate: {
//         fontSize: 12,
//         color: '#000000'
//       },
//       reportTitle: {
//         fontSize: 18,
//         bold: true,
//         color: '#000000',
//         letterSpacing: 1
//       },
      
//       // Project and module styles
//       projectHeader: {
//         fontSize: 14,
//         bold: true,
//         color: '#000000'
//       },
//       moduleHeader: {
//         fontSize: 12,
//         bold: true,
//         color: '#000000'
//       },
      
//       // Overdue header style
//       overdueHeader: {
//         fontSize: 10,
//         bold: true,
//         margin: [8, 4, 8, 4]
//       },
      
//       // Table styles - clean and minimal
//       tableHeader: {
//         fontSize: 10,
//         bold: true,
//         color: '#000000',
//         fillColor: '#f5f5f5'
//       },
//       tableCell: {
//         fontSize: 9,
//         color: '#000000'
//       },
//       linkCell: {
//         fontSize: 9,
//         color: '#0066cc',
//         decoration: 'underline'
//       },
      
//       // Footer styles
//       footerText: {
//         fontSize: 10,
//         color: '#000000'
//       },
//       pageNumber: {
//         fontSize: 12,
//         color: '#000000'
//       }
//     },
//     defaultStyle: {
//       font: 'Arial',
//       fontSize: 10,
//       lineHeight: 1.2
//     },
//     pageMargins: [50, 50, 50, 50] // Standard margins like the image
//   };

//   // Generate a unique filename for the PDF
//   const filename = path.join(outputDirPath, `${autodeskId}_${tenantName}_${aggregationDate}.pdf`);

//   // Create the PDF and pipe it to a file stream
//   const pdfDoc = printer.createPdfKitDocument(docDefinition);
//   pdfDoc.pipe(fs.createWriteStream(filename));
//   pdfDoc.end();

//   console.log(`PDF generated successfully: ${filename}`);
// }

// module.exports = {
//     createEscalationPdf,
// }


const fs = require('fs');
const path = require('path');
const PdfPrinter = require('pdfmake');
const moment = require('moment');
const tenantMap = require('./tenantMap');


const fonts = {
  Arial: {
    normal: 'C:/Windows/Fonts/arial.ttf',
    bold: 'C:/Windows/Fonts/arialbd.ttf',
    italics: 'C:/Windows/Fonts/ariali.ttf',
    bolditalics: 'C:/Windows/Fonts/arialbi.ttf'
  }
};

const printer = new PdfPrinter(fonts);

// Helper Functions
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
    if (!item.dueDate) continue;
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

function getOverdueHeaderColor(label) {
  const colorMap = {
    '>7 days': '#ff6b6b',
    '5–7 days': '#ffd93d',
    '3–5 days': '#ffd93d',
    '1–3 days': '#6bcf7f',
    '<1 day': '#6bcf7f'
  };
  return colorMap[label] || '#6c757d';
}

function tableFromItems(items) {
  return {
    table: {
      headerRows: 1,
      widths: ['10%', '35%', '20%', '15%', '20%'],
      body: [
        [
          { text: 'ID', style: 'tableHeader' },
          { text: 'Title', style: 'tableHeader' },
          { text: 'Created At', style: 'tableHeader' },
          { text: 'Status', style: 'tableHeader' },
          { text: 'Link', style: 'tableHeader' }
        ],
        ...items.map(item => [
          { text: item.displayId || '-', style: 'tableCell' },
          { text: item.title || '-', style: 'tableCell' },
          { text: item.createdAt ? moment(item.createdAt).format('YYYY-MM-DD') : '-', style: 'tableCell' },
          { text: item.status || '-', style: 'tableCell' },
          {
            text: '🔗',
            link: item.link || '#',
            style: 'linkCell',
            alignment: 'center'
          }
        ])
      ]
    },
    layout: {
      hLineWidth: () => 1,
      vLineWidth: () => 1,
      hLineColor: () => '#cccccc',
      vLineColor: () => '#cccccc',
      paddingLeft: () => 8,
      paddingRight: () => 8,
      paddingTop: () => 6,
      paddingBottom: () => 6
    },
    margin: [0, 5, 0, 20]
  };
}

function createReportHeader(aggregationDate, clientLogoBase64) {
  return [
    {
      columns: [
        {
          image: `data:image/png;base64,${clientLogoBase64}`,
          width: 50
        },
        {
          text: moment(aggregationDate).format('MMMM DD, YYYY'),
          style: 'reportDate',
          alignment: 'right'
        }
      ],
      margin: [0, 5, 0, 5]
    },
    {
      text: 'ESCALATION REPORT',
      style: 'reportTitle',
      margin: [0, 0, 0, 10]
    },
    {
      canvas: [
        {
          type: 'line',
          x1: 0, y1: 0,
          x2: 515, y2: 0,
          lineWidth: 1,
          lineColor: '#cccccc'
        }
      ],
      margin: [0, 0, 0, 10]
    }
  ];
}

async function createEscalationPdf(dataByProject, autodeskId, tenantNameRaw, aggregationDate) {
  const outputDir = 'escalation Pdfs';
  const outputDirPath = path.join(__dirname, outputDir);

  if (!fs.existsSync(outputDirPath)) {
    fs.mkdirSync(outputDirPath);
  }

    const tenantKey = tenantMap[tenantNameRaw];
  if (!tenantKey) {
    throw new Error(`Unknown tenant name: "${tenantNameRaw}". Please add it to tenantMap.js.`);
  }

    const clientLogoPath = path.join(__dirname, `../utils/data/${tenantKey}.png`);
    const vdcLogoPath = path.join(__dirname, `../utils/data/5dvdc.png`);

    if (!fs.existsSync(clientLogoPath)) {
        throw new Error(`Client logo not found: ${clientLogoPath}`);
    }

    const clientLogoBase64 = fs.readFileSync(clientLogoPath).toString('base64');
    const vdcLogoBase64 = fs.readFileSync(vdcLogoPath).toString('base64');

  const docContent = [];
  docContent.push(...createReportHeader(aggregationDate, clientLogoBase64));

  for (const project of dataByProject) {
    if (!project.name) continue;

    docContent.push({
      text: `Project ${project.id || project.name}`,
      style: 'projectHeader',
      margin: [0, 0, 0, 8]
    });

    for (const module of ['issues', 'forms', 'reviews']) {
      const items = project[module] || [];
      if (!items.length) continue;

      docContent.push({
        text: module.charAt(0).toUpperCase() + module.slice(1),
        style: 'moduleHeader',
        margin: [0, 5, 0, 8]
      });

      const grouped = groupByOverdue(items);

      for (const [label, groupItems] of Object.entries(grouped)) {
        if (!groupItems.length) continue;

        const headerColor = getOverdueHeaderColor(label);
        docContent.push({
          table: {
            widths: ['*'],
            body: [[
              {
                text: `Overdue: ${label}`,
                style: 'overdueHeader',
                fillColor: headerColor,
                color: 'white',
                border: [true, true, true, true],
                borderColor: ['#cccccc', '#cccccc', '#cccccc', '#cccccc']
              }
            ]]
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#cccccc',
            vLineColor: () => '#cccccc'
          },
          margin: [0, 5, 0, 2]
        });

        docContent.push(tableFromItems(groupItems));
      }
    }
  }

  // Document definition
  const docDefinition = {
    content: docContent,
    pageSize: 'A4',
    styles: {
      companyName: { fontSize: 16, bold: true, color: '#000000' },
      reportDate: { fontSize: 12, color: '#000000' },
      reportTitle: { fontSize: 18, bold: true, color: '#000000', letterSpacing: 1 },
      projectHeader: { fontSize: 14, bold: true, color: '#000000' },
      moduleHeader: { fontSize: 12, bold: true, color: '#000000' },
      overdueHeader: { fontSize: 10, bold: true, margin: [8, 4, 8, 4] },
      tableHeader: { fontSize: 10, bold: true, color: '#000000', fillColor: '#f5f5f5' },
      tableCell: { fontSize: 9, color: '#000000' },
      linkCell: { fontSize: 9, color: '#0066cc', decoration: 'underline' },
      footerText: { fontSize: 10, color: '#000000' },
      pageNumber: { fontSize: 12, color: '#000000' }
    },
    defaultStyle: {
      font: 'Arial',
      fontSize: 10,
      lineHeight: 1.2
    },
    pageMargins: [50, 30, 50, 50],
    footer: function(currentPage, pageCount) {
      return {
        columns: [
          {
            image: `data:image/png;base64,${vdcLogoBase64}`,
            width: 30,
            margin: [20, 0, 0, 0]
          },
          {
            text: '5D VDC Services LLP\nConfidential - Internal Use',
            style: 'footerText',
            alignment: 'right',
            margin: [0, 0, 20, 0]
          }
        ]
      };
    }
  };

  const filename = path.join(outputDirPath, `${autodeskId}_${tenantKey}_${aggregationDate}.pdf`);
  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  pdfDoc.pipe(fs.createWriteStream(filename));
  pdfDoc.end();

  console.log(`PDF generated successfully: ${filename}`);
}

module.exports = {
  createEscalationPdf,
};
