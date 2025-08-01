// src/controllers/notificationWorkflowController.js
const notificationWorkflowService = require('../services/notificationWorkflowService');
const CustomError = require('../utils/customError');

/**
 * Creates a new notification workflow for a given project.
 * Expects all required fields in `req.body` and `req.companyConfig` for Mongo URI.
 */
const createNotificationWorkflow = async (req, res, next) => {
    try {
        const {
            workflow_name,
            project_id,
            module,
            channels,
            due_in, // Changed from 'schedule'/'frequency' to 'due_in'
            filters
        } = req.body;

        console.log("Due In is: ",due_in)

        const created_by = req.user?.autodeskId;
        const mongoUri = req.companyConfig?.mongodb_uri; // Assuming the same Mongo URI for the same database

        if (!mongoUri || !created_by) {
            throw new CustomError('Tenant Mongo URI or user context is missing.', 400);
        }

        // Validate required fields for notification workflow
        if (!workflow_name || !project_id || !module || !channels || !due_in) {
            throw new CustomError('Missing required notification workflow fields (workflow_name, project_id, module, channels, due_in).', 400);
        }

        const newNotificationWorkflow = await notificationWorkflowService.createNotificationWorkflow(mongoUri, {
            workflow_name,
            project_id,
            module,
            channels,
            due_in,
            filters,
            created_by
        });

        res.status(201).json(newNotificationWorkflow);
    } catch (error) {
        console.error('Notification workflow creation error:', error);
        next(error);
    }
};


/**
 * Gets all notification workflows by project, with optional filters on module and status.
 * Accepts query parameters: ?module=tasks&status=active
 */
const getNotificationWorkflowsByProject = async (req, res, next) => {
    try {
        const { project_id } = req.params;
        const { module, status } = req.query;
        const mongoUri = req.companyConfig?.mongodb_uri; // Assuming the same Mongo URI

        if (!mongoUri || !project_id) {
            throw new CustomError('Missing tenant or project information for notification workflows.', 400);
        }

        const workflows = await notificationWorkflowService.getNotificationWorkflowsByProject(mongoUri, project_id, module, status);
        console.log(workflows)
        res.status(200).json(workflows);
    } catch (error) {
        console.error('Error fetching notification workflows by project:', error);
        next(error);
    }
};

const getNotificationWorkflowsById = async (req, res, next) => {
  try {
    const { workflow_id } = req.params;
    const mongoUri = req.companyConfig?.mongodb_uri;

    if (!mongoUri || !workflow_id) {
      throw new CustomError('Workflow ID or tenant configuration missing.', 400);
    }

    const workflow = await notificationWorkflowService.getNotificationWorkflowsById(mongoUri, workflow_id);

    if (!workflow) {
      console.warn(`Workflow with ID ${workflow_id} not found.`);
      throw new CustomError('Workflow not found.', 404);
    }

    res.status(200).json(workflow);
  } catch (error) {
    console.error('Controller: Error fetching workflow by ID:', error);
    next(error);
  }
};

/**
 * Updates status, channels, or due_in for a specific notification workflow.
 * Only allows changing 'status', 'channels', or 'due_in'.
 */
const updateNotificationWorkflow = async (req, res, next) => {
  try {
    const { workflow_id } = req.params;
    const mongoUri = req.companyConfig?.mongodb_uri;

    if (!mongoUri || !workflow_id) {
      throw new CustomError('Notification Workflow ID or tenant configuration missing.', 400);
    }

    // Destructure all potential update fields from req.body.
    // Use default undefined to ensure fields not sent are not treated as null.
    const {
      workflow_name,
      channels,
      frequency, // Expected top-level field, consistent with createWorkflow
      filters,
      status // Assuming 'status' can also be updated (e.g., active/paused)
    } = req.body;

    const updatePayload = {};

    // Conditionally add fields to updatePayload if they are provided (not undefined)
    // This allows for partial updates (PATCH requests).
    if (workflow_name !== undefined) {
      updatePayload.workflow_name = workflow_name;
    }
    if (channels !== undefined) {
      updatePayload.channels = channels;
    }
    if (frequency !== undefined) {
      updatePayload.frequency = frequency;
    }
    if (filters !== undefined) {
      updatePayload.filters = filters;
    }
    if (status !== undefined) {
      updatePayload.status = status;
    }

    if (Object.keys(updatePayload).length === 0) {
      throw new CustomError('No valid fields provided for update.', 400);
    }

    // console.log('Update Payload sent to service:', updatePayload); // For debugging

    const updatedWorkflow = await notificationWorkflowService.updateNotificationWorkflow(mongoUri, workflow_id, updatePayload);
    res.status(200).json(updatedWorkflow);
  } catch (error) {
    console.error('Controller: Error updating workflow:', error);
    next(error);
  }
};

/**
 * Deletes a notification workflow by its ID.
 */
const deleteNotificationWorkflow = async (req, res, next) => {
    try {
        const { workflow_id } = req.params;
        const mongoUri = req.companyConfig?.mongodb_uri; // Assuming the same Mongo URI

        if (!mongoUri || !workflow_id) {
            throw new CustomError('Notification workflow ID or tenant configuration missing.', 400);
        }

        const result = await notificationWorkflowService.deleteNotificationWorkflow(mongoUri, workflow_id);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error deleting notification workflow in controller:', error);
        if (error instanceof CustomError) {
            return res.status(error.statusCode).json({ message: error.message, details: error.details });
        }
        next(error);
    }
};

module.exports = {
    createNotificationWorkflow,
    getNotificationWorkflowsByProject,
    getNotificationWorkflowsById,
    updateNotificationWorkflow,
    deleteNotificationWorkflow
};