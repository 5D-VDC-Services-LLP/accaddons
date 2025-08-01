const { sendGraphMail } = require('../utils/msGraphMailer'); // or wherever you placed it
const fs = require('fs');
const path = require('path');

/**
 * Sends an escalation email with PDF attached
 * @param {string} email - recipient email
 * @param {string} module - 'forms' / 'issues' / etc.
 * @param {string} aggregate- mongodb object
 * @param {string} date - formatted date string
 * @param {string} tenant - used to build file path
 */
async function sendEscalationEmail(email, aggregate, tenant, date, autodeskId) {
  console.log(`📧 Sending escalation email to ${email}...`);

  const filename = `${autodeskId}_${tenant}_${date}.pdf`;
  const filePath = path.resolve(__dirname, `../utils/escalation Pdfs/${filename}`);

  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ PDF not found: ${filePath}`);
    return;
  }

  const fileData = fs.readFileSync(filePath).toString('base64');

  // Sum all item counts across all projects
  let issueCount = 0, reviewCount = 0, formCount = 0;

  for (const projectData of aggregate.values()) {
    console.log(projectData.issues?.length)
    issueCount += Array.isArray(projectData.issues) ? projectData.issues.length : 0;
    reviewCount += Array.isArray(projectData.reviews) ? projectData.reviews.length : 0;
    formCount += Array.isArray(projectData.forms) ? projectData.forms.length : 0;
  }

  const count = `${issueCount} issues, ${reviewCount} reviews, ${formCount} forms`;

  const htmlBody = `
    <p>Hi,</p>
    <p>Please find attached the escalation summary for <strong>${module}</strong>.</p>
    <strong>Escalated Items:</strong> ${count}<br/>
    <strong>Date:</strong> ${date}</p>
    <p>Regards,<br/>Automation System</p>
  `;

  const payload = {
    subject: `Escalation Summary: ${module} – ${date}`,
    htmlBody,
    toEmail: email,
    attachment: {
      name: filename,
      contentBytes: fileData,
      contentType: 'application/pdf'
    }
  };

  await sendGraphMail(payload);
}

module.exports = { sendEscalationEmail };
