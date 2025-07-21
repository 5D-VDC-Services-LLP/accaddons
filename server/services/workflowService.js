// src/services/workflowService.js
const { getMongoDBConnection } = require('../db/mongodb');
const CustomError = require('../utils/customError');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const workflowSchema = new mongoose.Schema({
  workflow_id: { type: String, required: true, unique: true, default: uuidv4 }, // UUID
  display_id: { type: Number, required: true }, // Sequential per project_id

  workflow_name: { type: String, required: true },
  project_id: { type: String, required: true },
  project_name: { type: String, required: false },

  channels: {
    type: [{ type: String, enum: ['whatsapp', 'email'] }],
    validate: [arr => arr.length > 0, 'At least one channel is required']
  },

  module: { type: String, enum: ['issues', 'forms', 'review'], required: true },
  status: { type: String, enum: ['active', 'paused'], default: 'active' },

  frequency: {
  type: [{ 
    type: String,
    enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  }],
  default: []
},

  escalate_to: {
    users: [{
        autodeskId: { type: String, required: true },
        email: { type: String, required: true } // Assuming email is always present
    }],
    company: [{ type: String }], // This remains an array of strings (company IDs)
    roles: [{ type: String }]
 },

  filters: { type: mongoose.Schema.Types.Mixed }, // Open-ended

  created_by: { type: String, required: true }, // Autodesk user ID
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// Pre-save hook to auto-update updated_at
workflowSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

workflowSchema.index({ project_id: 1, display_id: 1 }, { unique: true });

// Sequential display_id generator per project
async function generateDisplayId(connection, projectId) {
  const Workflow = getWorkflowModel(connection);
  const latest = await Workflow.findOne({ project_id: projectId })
    .sort({ display_id: -1 })
    .select('display_id');

  const nextId = latest ? latest.display_id + 1 : 1;
  console.log(`[DisplayID] Next ID for project ${projectId}: ${nextId}`);
  return nextId;
}

const getWorkflowModel = (connection) => {
  if (!connection.models.Workflow) {
    return connection.model('Workflow', workflowSchema, 'workflows');
  }
  return connection.models.Workflow;
};

const createWorkflow = async (mongoUri, workflowData) => {
  try {
    const connection = await getMongoDBConnection(mongoUri);
    const Workflow = getWorkflowModel(connection);

    const display_id = await generateDisplayId(connection, workflowData.project_id);

    const workflow = new Workflow({
      ...workflowData,
      display_id,
    });

    const saved = await workflow.save();
    return saved;
  } catch (error) {
    console.error(`Failed to create workflow:`, error);
    throw new CustomError('Workflow creation failed.', 500);
  }
};

const getWorkflowsByProject = async (mongoUri, projectId, module = null, status = null) => {
  try {
    const connection = await getMongoDBConnection(mongoUri);
    const Workflow = getWorkflowModel(connection);

    const query = { project_id: projectId };
    if (module) query.module = module;
    if (status) query.status = status;

    return await Workflow.find(query);
  } catch (error) {
    console.error(`Failed to fetch workflows for project '${projectId}':`, error);
    throw new CustomError('Workflow retrieval failed.', 500);
  }
};

const updateWorkflowStatusOrChannel = async (mongoUri, workflowId, updates = {}) => {
  try {
    const connection = await getMongoDBConnection(mongoUri);
    const Workflow = getWorkflowModel(connection);

    const allowedFields = ['status', 'channels', 'frequency'];
    const updateFields = Object.keys(updates);

    for (const field of updateFields) {
      if (!allowedFields.includes(field)) {
        throw new CustomError(`Update not allowed for field: ${field}`, 400);
      }
    }

    const updated = await Workflow.findOneAndUpdate(
      { workflow_id: workflowId },
      { ...updates, updated_at: Date.now() },
      { new: true }
    );

    return updated;
  } catch (error) {
    console.error(`Failed to update workflow '${workflowId}':`, error);
    throw new CustomError('Workflow update failed.', 500);
  }
};

const deleteWorkflow = async (mongoUri, workflowId) => {
    try {
        const connection = await getMongoDBConnection(mongoUri);
        const Workflow = getWorkflowModel(connection);

        const result = await Workflow.deleteOne({ workflow_id: workflowId });

        if (result.deletedCount === 0) {
            throw new CustomError('Workflow not found or already deleted.', 404);
        }
        return { message: 'Workflow deleted successfully.', workflow_id: workflowId };
    } catch (error) {
        console.error(`Failed to delete workflow '${workflowId}':`, error);
        if (error instanceof CustomError) {
            throw error; // Re-throw CustomError directly
        }
        throw new CustomError('Workflow deletion failed.', 500);
    }
};

const getWorkflowById = async (mongoUri, workflowId) => {
  try {
    const connection = await getMongoDBConnection(mongoUri);
    const Workflow = getWorkflowModel(connection);

    const workflow = await Workflow.findOne({ workflow_id: workflowId });
    if (!workflow) {
      throw new CustomError('Workflow not found.', 404);
    }

    return workflow;
  } catch (error) {
    console.error(`Failed to fetch workflow '${workflowId}':`, error);
    throw new CustomError('Failed to retrieve workflow details.', 500);
  }
};

const getAllWorkflows = async (mongoUri) => {
  try {
    const connection = await getMongoDBConnection(mongoUri);
    const Workflow = getWorkflowModel(connection);

    const query = { status: 'active' }; // You can extend with other filters if needed
    const workflows = await Workflow.find(query);
    return workflows;
  } catch (error) {
    console.error(`Failed to fetch all workflows:`, error);
    throw new CustomError('Workflow retrieval failed.', 500);
  }
};

module.exports = {
  createWorkflow,
  getWorkflowsByProject,
  updateWorkflowStatusOrChannel,
  deleteWorkflow,
  getWorkflowById,
  getAllWorkflows,
};