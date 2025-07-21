// src/services/notificationWorkflowService.js
const { getMongoDBConnection } = require('../db/mongodb');
const CustomError = require('../utils/customError');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Define the new schema for Notification Workflows
const notificationWorkflowSchema = new mongoose.Schema({
    workflow_id: { type: String, required: true, unique: true, default: uuidv4 }, // UUID
    display_id: { type: Number, required: true }, // Sequential per project_id

    workflow_name: { type: String, required: true },
    project_id: { type: String, required: true },
    // project_name is not specified in your new list, so omitting it.
    // If needed, add: project_name: { type: String, required: false },

    channels: {
        type: [{ type: String, enum: ['whatsapp', 'email'] }], // Added 'sms' and 'in-app' as examples, adjust as needed
        validate: [arr => arr.length > 0, 'At least one channel is required']
    },

    module: { type: String, enum: ['issues', 'forms', 'reviews'], required: true }, // Expanded module options, adjust as needed
    status: { type: String, enum: ['active', 'paused'], default: 'active' }, // Added 'draft' as an example

    // New 'due_in' field replacing 'frequency'
    due_in: {
        type: String,
        enum: [
            'due_0',
            'due_1',
            'due_2',
            'due_3',
            'due_5',
            'due_7'
        ],
        required: true
        },

    // escalate_to is not specified in your new list, so omitting it.
    // If needed, add: escalate_to: { ... },

    filters: { type: mongoose.Schema.Types.Mixed }, // Open-ended

    created_by: { type: String, required: true }, // Autodesk user ID

    // Timestamps
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

// Pre-save hook to auto-update updated_at
notificationWorkflowSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

// Index for efficient lookups and unique display_id per project
notificationWorkflowSchema.index({ project_id: 1, display_id: 1 }, { unique: true });

// Sequential display_id generator per project (re-used logic)
async function generateDisplayId(connection, projectId) {
    const NotificationWorkflow = getNotificationWorkflowModel(connection);
    const latest = await NotificationWorkflow.findOne({ project_id: projectId })
        .sort({ display_id: -1 })
        .select('display_id');

    const nextId = latest ? latest.display_id + 1 : 1;
    console.log(`[Notification DisplayID] Next ID for project ${projectId}: ${nextId}`);
    return nextId;
}

const getNotificationWorkflowModel = (connection) => {
    // This is the key change: Using 'notification_workflows' as the collection name
    if (!connection.models.NotificationWorkflow) {
        return connection.model('NotificationWorkflow', notificationWorkflowSchema, 'notification_workflows');
    }
    return connection.models.NotificationWorkflow;
};

/**
 * Creates a new notification workflow.
 * @param {string} mongoUri - The MongoDB connection URI (from process.env.MONGO_URI, for example).
 * @param {object} workflowData - The data for the new notification workflow.
 * @returns {Promise<object>} The created notification workflow document.
 */
const createNotificationWorkflow = async (mongoUri, workflowData) => {

    console.log(workflowData)
    try {
        const connection = await getMongoDBConnection(mongoUri); // Uses the main connection
        const NotificationWorkflow = getNotificationWorkflowModel(connection);

        const display_id = await generateDisplayId(connection, workflowData.project_id);

        const workflow = new NotificationWorkflow({
            ...workflowData,
            display_id,
        });

        const saved = await workflow.save();
        return saved;
    } catch (error) {
        console.error(`Failed to create notification workflow:`, error);
        throw new CustomError('Notification workflow creation failed.', 500);
    }
};

/**
 * Retrieves notification workflows for a given project, optionally filtered by module and status.
 * @param {string} mongoUri - The MongoDB connection URI.
 * @param {string} projectId - The ID of the project.
 * @param {string} [module=null] - Optional module to filter by.
 * @param {string} [status=null] - Optional status to filter by.
 * @returns {Promise<Array<object>>} An array of notification workflow documents.
 */
const getNotificationWorkflowsByProject = async (mongoUri, projectId, module = null, status = null) => {
    try {
        const connection = await getMongoDBConnection(mongoUri);
        const NotificationWorkflow = getNotificationWorkflowModel(connection);

        const query = { project_id: projectId };
        console.log(query)
        if (module) query.module = module;
        if (status) query.status = status;

        return await NotificationWorkflow.find(query);
    } catch (error) {
        console.error(`Failed to fetch notification workflows for project '${projectId}':`, error);
        throw new CustomError('Notification workflow retrieval failed.', 500);
    }
};

/**
 * Updates the status, channels, or due_in of a notification workflow.
 * @param {string} mongoUri - The MongoDB connection URI.
 * @param {string} workflowId - The ID of the notification workflow to update.
 * @param {object} updates - An object containing the fields to update (status, channels, due_in).
 * @returns {Promise<object>} The updated notification workflow document.
 */
const updateNotificationWorkflow = async (mongoUri, workflowId, updates = {}) => {
    try {
        const connection = await getMongoDBConnection(mongoUri);
        const NotificationWorkflow = getNotificationWorkflowModel(connection);

        const allowedFields = ['status', 'channels', 'due_in'];
        const updateFields = Object.keys(updates);

        for (const field of updateFields) {
            if (!allowedFields.includes(field)) {
                throw new CustomError(`Update not allowed for field: ${field}`, 400);
            }
        }

        const updated = await NotificationWorkflow.findOneAndUpdate(
            { workflow_id: workflowId },
            { ...updates, updated_at: Date.now() },
            { new: true }
        );

        if (!updated) {
            throw new CustomError('Notification workflow not found.', 404);
        }

        return updated;
    } catch (error) {
        console.error(`Failed to update notification workflow '${workflowId}':`, error);
        if (error instanceof CustomError) {
            throw error;
        }
        throw new CustomError('Notification workflow update failed.', 500);
    }
};

/**
 * Deletes a notification workflow by its ID.
 * @param {string} mongoUri - The MongoDB connection URI.
 * @param {string} workflowId - The ID of the notification workflow to delete.
 * @returns {Promise<object>} An object indicating success and the deleted workflow ID.
 */
const deleteNotificationWorkflow = async (mongoUri, workflowId) => {
    try {
        const connection = await getMongoDBConnection(mongoUri);
        const NotificationWorkflow = getNotificationWorkflowModel(connection);

        const result = await NotificationWorkflow.deleteOne({ workflow_id: workflowId });

        if (result.deletedCount === 0) {
            throw new CustomError('Notification workflow not found or already deleted.', 404);
        }
        return { message: 'Notification workflow deleted successfully.', workflow_id: workflowId };
    } catch (error) {
        console.error(`Failed to delete notification workflow '${workflowId}':`, error);
        if (error instanceof CustomError) {
            throw error; // Re-throw CustomError directly
        }
        throw new CustomError('Notification workflow deletion failed.', 500);
    }
};

/**
 * Retrieves a single notification workflow by its ID.
 * @param {string} mongoUri - The MongoDB connection URI.
 * @param {string} workflowId - The ID of the notification workflow.
 * @returns {Promise<object>} The notification workflow document.
 */
const getNotificationWorkflowById = async (mongoUri, workflowId) => {
    try {
        const connection = await getMongoDBConnection(mongoUri);
        const NotificationWorkflow = getNotificationWorkflowModel(connection);

        const workflow = await NotificationWorkflow.findOne({ workflow_id: workflowId });
        if (!workflow) {
            throw new CustomError('Notification workflow not found.', 404);
        }

        return workflow;
    } catch (error) {
        console.error(`Failed to fetch notification workflow '${workflowId}':`, error);
        if (error instanceof CustomError) {
            throw error;
        }
        throw new CustomError('Failed to retrieve notification workflow details.', 500);
    }
};

/**
 * Retrieves all active notification workflows.
 * @param {string} mongoUri - The MongoDB connection URI.
 * @returns {Promise<Array<object>>} An array of active notification workflow documents.
 */
const getAllNotificationWorkflows = async (mongoUri) => {
    try {
        const connection = await getMongoDBConnection(mongoUri);
        const NotificationWorkflow = getNotificationWorkflowModel(connection);

        const query = { status: 'active' };
        const workflows = await NotificationWorkflow.find(query);
        return workflows;
    } catch (error) {
        console.error(`Failed to fetch all notification workflows:`, error);
        throw new CustomError('Notification workflow retrieval failed.', 500);
    }
};

module.exports = {
    createNotificationWorkflow,
    getNotificationWorkflowsByProject,
    updateNotificationWorkflow,
    deleteNotificationWorkflow,
    getNotificationWorkflowById,
    getAllNotificationWorkflows,
};