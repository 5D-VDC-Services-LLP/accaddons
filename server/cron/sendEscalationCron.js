// src/cron/sendEscalationCron.js
const cron = require('node-cron');
const db = require('../db/postgres');
const tenantService = require('../services/tenantService');
const { getUnsentAggregates, markAggregateStatus } = require('../models/escalationAggregateModel');
const { sendEscalationMessage } = require('../services/escalationWhatsappService');
const { sendEscalationEmail } = require('../services/escalationEmailService'); // create if needed
const { getAllAggregations } = require("../models/escalationAggregateModel");

const scheduleEscalationSender = () => {
  const isDev = process.env.NODE_ENV !== 'production';
  const schedule = isDev ? '*/1 * * * *' : '30 8 * * *'; // 8:30 AM prod

  cron.schedule(schedule, async () => {
    console.log(`📤 Escalation sender running [${process.env.NODE_ENV}]`);

    try {
      const tenantConfigs = await tenantService.getAllTenantConfigs(); // Adjust if needed
      for (const tenant of tenantConfigs) {
        const { mongodb_uri, name: tenantNameFromConfig } = tenant;
        const aggregates = await getAllAggregations(mongodb_uri);

        for (const agg of aggregates) {
          try {
            const { aggregate, phone, email, tenant, autodeskId, channels, date, _id } = agg;

            // Send WhatsApp
            if (channels.includes('whatsapp') && phone) {
              await sendEscalationMessage(phone, autodeskId, aggregate, tenant, date);
            }

            // Send Email
            if (channels.includes('email') && email) {
              await sendEscalationEmail(email, aggregate, tenant, date, autodeskId);
              console.log('emails sent')
            }

            // Mark success if both attempted (even if one channel failed internally)
            await markAggregateStatus(mongodb_uri, _id, true);

          } catch (err) {
            console.error(`❌ Failed to send escalation for tenant ${tenant}:`, err.message);
            await markAggregateStatus(mongodb_uri, agg._id, false);
          }
        }
      }
    } catch (err) {
      console.error('Fatal escalation sender error:', err.message);
    }
  });
};

module.exports = { scheduleEscalationSender };
