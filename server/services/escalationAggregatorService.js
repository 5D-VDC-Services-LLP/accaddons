// src/services/escalationAggregatorService.js

const db = require('../db/postgres');
const { getMongoDBConnection } = require('../db/mongodb');
const workflowService = require('./workflowService');
const tenantService = require('./tenantService');
const { getItemIds } = require('./autodeskQueryService');
const { saveEscalationAggregate } = require('../models/escalationAggregateModel');
const cron = require('node-cron');

const dayMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

async function runEscalationAggregation(accessToken) {
  const today = dayMap[new Date().getDay()];
  console.log(`\n⏰ Starting escalation aggregation for: ${today.toUpperCase()}`);

  const tenantConfigs = await tenantService.getAllTenantConfigs();
  const aggregationBuffer = new Map();

  for (const tenant of tenantConfigs) {
    const { mongodb_uri, name: tenantName } = tenant;

    try {
      const workflows = await workflowService.getAllWorkflows(mongodb_uri);

      for (const wf of workflows) {
        if (!wf.frequency?.includes(today) || wf.status !== 'active') continue;

        const itemIds = await getItemIds(wf, accessToken);
        if (itemIds.length === 0) continue;

        const escalateUsers = wf.escalate_to?.users || [];

        for (const user of escalateUsers) {
          const key = `${user.email}:${tenantName}`;

          if (!aggregationBuffer.has(key)) {
            aggregationBuffer.set(key, {
              email: user.email,
              autodeskId: user.autodeskId,
              phone: null,
              aggregate: {},  // NEW STRUCTURE
              channels: new Set(wf.channels),
              tenant: tenantName,
              mongoUri: mongodb_uri,
              date: new Date().toISOString().slice(0, 10)
            });
          }

          const entry = aggregationBuffer.get(key);

          if (!entry.aggregate[wf.project_id]) {
            entry.aggregate[wf.project_id] = {
              issues: [],
              forms: [],
              reviews: []
            };
          }

          entry.aggregate[wf.project_id][wf.module].push(...itemIds);  // You'll need to return IDs from getItemCount
        }
      }
    } catch (err) {
      console.error(`[ERROR] Processing tenant ${tenantName}:`, err.message);
    }
  }

  // Resolve phone numbers and write aggregates to MongoDB
  for (const [key, user] of aggregationBuffer.entries()) {
    const { email } = user;

    try {
      const result = await db.query(
        'SELECT phone_number FROM users WHERE email_id = $1 LIMIT 1',
        [email]
      );
      user.phone = result.rows?.[0]?.phone_number || null;
    } catch (err) {
      console.warn(`❌ DB Error for ${email}:`, err.message);
    }

    const templateType ='account_level_notification'; // Adjust as needed

    await saveEscalationAggregate({
      email: user.email,
      autodeskId: user.autodeskId,
      phone: user.phone,
      aggregate: user.aggregate,
      channels: [...user.channels],
      templateType,
      tenant: user.tenant,
      mongoUri: user.mongoUri,
      date: user.date,
      sent: false,
      failed: false,
      created_at: new Date()
    });
  }

  console.log(`✅ Escalation aggregation completed and saved.`);
}

const scheduleAggregationCron = (accessToken) => {
  const isDev = process.env.NODE_ENV !== 'production';
  const schedule = isDev ? '*/1 * * * *' : '0 6 * * *'; // Every minute for dev, 6 AM for prod

  cron.schedule(schedule, async () => {
    console.log(`\n🛠️ Running Aggregation CRON: [${process.env.NODE_ENV}]`);
    try {
      await runEscalationAggregation(accessToken);
    } catch (err) {
      console.error('Aggregation Cron failed:', err);
    }
  });
};

module.exports = { runEscalationAggregation, scheduleAggregationCron };
