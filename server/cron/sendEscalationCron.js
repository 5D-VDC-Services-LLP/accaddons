// src/cron/sendEscalationCron.js
const cron = require('node-cron');
const db = require('../db/postgres');
const { getUnsentAggregates, markAggregateStatus } = require('../models/escalationAggregateModel');
const { sendEscalationMessage } = require('../services/escalationService');
const { sendEscalationEmail } = require('../services/escalationEmailService'); // create if needed

const scheduleEscalationSender = () => {
  const isDev = process.env.NODE_ENV !== 'production';
  const schedule = isDev ? '30 8 * * *' : '30 8 * * *'; // 8:30 AM prod

  cron.schedule(schedule, async () => {
    console.log(`📤 Escalation sender running [${process.env.NODE_ENV}]`);

    try {
      const tenants = await db.query('SELECT DISTINCT tenant FROM users'); // Adjust if needed

      for (const row of tenants.rows) {
        const tenant = row.tenant;
        const mongoUri = await getUriFromTenant(tenant); // Implement this function
        const aggregates = await getUnsentAggregates(mongoUri);

        for (const agg of aggregates) {
          try {
            if (agg.channels.includes('whatsapp') && agg.phone) {
              await sendEscalationMessage(agg.phone, agg.moduleCounts, agg.templateType, agg.projectNames, agg.date);
            } else if (agg.channels.includes('email')) {
              await sendEscalationEmail(agg.email, agg.moduleCounts, agg.templateType, agg.projectNames, agg.date);
            }
            await markAggregateStatus(mongoUri, agg._id, true);
          } catch (err) {
            console.error(`❌ Failed to send to ${agg.email}:`, err.message);
            await markAggregateStatus(mongoUri, agg._id, false);
          }
        }
      }
    } catch (err) {
      console.error('Fatal escalation sender error:', err.message);
    }
  });
};

module.exports = { scheduleEscalationSender };
