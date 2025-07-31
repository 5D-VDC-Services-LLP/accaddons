// src/controllers/escalationController.js
const mongoose = require('mongoose');
const db = require('../db/postgres');
const CustomError = require('../utils/customError');
const { sendEscalationMessage } = require('../services/escalationService');
const workflowService = require('../services/workflowService')
const escalationAggregatorService = require('../services/escalationAggregatorService');
/**
 * Triggers escalation for a specific workflow by ID.
 * Retrieves target users and sends WhatsApp messages.
 */
const triggerEscalation = async (req, res, next) => {
  try {
    const { workflow_id } = req.params;
    const mongoUri = req.companyConfig?.mongodb_uri;

    if (!workflow_id || !mongoUri) {
      throw new CustomError('Missing workflow ID or tenant configuration.', 400);
    }

    // Set the tenant DB connection
    const workflow = await workflowService.getWorkflowById(mongoUri, workflow_id);

    if (!workflow) {
      throw new CustomError('Workflow not found.', 404);
    }

    const escalateUsers = workflow.escalate_to?.users || [];
    if (escalateUsers.length === 0) {
      throw new CustomError('No users found in escalate_to.', 400);
    }

    // Step 1: Resolve phone numbers from PostgreSQL using emails
    const phoneNumbers = [];

    for (const user of escalateUsers) {
      const { email } = user;

      const result = await db.query(
        'SELECT phone_number FROM users WHERE email_id = $1 LIMIT 1',
        [email]
      );

      const phone = result.rows?.[0]?.phone_number;
      if (phone) {
        phoneNumbers.push({ email, phone });
      } else {
        console.warn(`⚠️ No phone number found for email: ${email}`);
      }
    }

    if (phoneNumbers.length === 0) {
      throw new CustomError('No valid phone numbers found for escalation.', 400);
    }

    // Step 2: Construct the escalation message data
    // Placeholder values – update this block once message logic is finalized
    const count = 3;
    const moduleName = workflow.module;
    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const projectName = 'Sample Residential'; // Replace with actual reason later

    // Step 3: Send WhatsApp messages
    for (const { phone } of phoneNumbers) {
      await sendEscalationMessage(phone, count, moduleName, date, projectName);
    }

    res.status(200).json({
      message: `Escalation message sent to ${phoneNumbers.length} user(s).`,
      recipients: phoneNumbers.map(p => p.email),
    });
  } catch (error) {
    console.error('Error triggering escalation:', error);
    next(error);
  }
};

const getAllAggregatedIssueDetails = async (req, res, next) => {
    try {
        const allIssues = await escalationAggregatorService.getAllIssuesFromAggregates();
        res.status(200).json(allIssues);
    } catch (error) {
        next(error);
    }
};

module.exports = {
  triggerEscalation,
  getAllAggregatedIssueDetails,
};
