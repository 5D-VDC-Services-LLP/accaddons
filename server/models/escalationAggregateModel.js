// src/models/escalationAggregateModel.js
const mongoose = require('mongoose');
const { getMongoDBConnection } = require('../db/mongodb');

const escalationAggregateSchema = new mongoose.Schema({
  email: String,
  autodeskId: String,
  phone: String,
  moduleCounts: {
    issues: Number,
    forms: Number,
    reviews: Number
  },
  projects: [String],
  projectNames: [String],
  channels: [String],
  templateType: { type: String, enum: ['single', 'multi'], required: true },
  tenant: String,
  mongoUri: String,
  date: String,
  sent: { type: Boolean, default: false },
  failed: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

function getEscalationAggregateModel(connection) {
  return connection.models.EscalationAggregate || connection.model('EscalationAggregate', escalationAggregateSchema, 'escalation_aggregates');
}

async function saveEscalationAggregate(data) {
  const conn = await getMongoDBConnection(data.mongoUri);
  const EscalationAggregate = getEscalationAggregateModel(conn);
  return await new EscalationAggregate(data).save();
}

async function getUnsentAggregates(mongoUri) {
  const conn = await getMongoDBConnection(mongoUri);
  const EscalationAggregate = getEscalationAggregateModel(conn);
  return await EscalationAggregate.find({ sent: false, failed: false });
}

async function markAggregateStatus(mongoUri, id, sent = true) {
  const conn = await getMongoDBConnection(mongoUri);
  const EscalationAggregate = getEscalationAggregateModel(conn);
  return await EscalationAggregate.updateOne({ _id: id }, { $set: { sent, failed: !sent } });
}

module.exports = {
  saveEscalationAggregate,
  getUnsentAggregates,
  markAggregateStatus
};
