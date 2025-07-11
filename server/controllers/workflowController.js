const workflowService = require('../services/workflowService');
const CustomError = require('../utils/customError');

/**
 * Creates a new workflow for a given project.
 * Expects all required fields in `req.body` and `req.companyConfig` for Mongo URI.
 */
const createWorkflow = async (req, res, next) => {
  try {
    const {
      workflow_name,
      project_id,
      module,
      channels,
      escalate_to,
      schedule,
      filters
    } = req.body;

    const created_by = req.user?.autodeskId;
    const mongoUri = req.companyConfig?.mongodb_uri;

    if (!mongoUri || !created_by) {
      throw new CustomError('Tenant Mongo URI or user context is missing.', 400);
    }

    if (!workflow_name || !project_id || !module || !channels) {
      throw new CustomError('Missing required workflow fields.', 400);
    }

    const frequencyFromPayload = schedule && Array.isArray(schedule.frequency) ? schedule.frequency : [];


    const newWorkflow = await workflowService.createWorkflow(mongoUri, {
      workflow_name,
      project_id,
      module,
      channels,
      escalate_to,
      filters,
      frequency: frequencyFromPayload,
      created_by
    });

    res.status(201).json(newWorkflow);
  } catch (error) {
    console.error('Workflow creation error:', error);
    next(error);
  }
};


/**
 * Gets all workflows by project, with optional filters on module and status.
 * Accepts query parameters: ?module=forms&status=active
 */
const getWorkflowsByProject = async (req, res, next) => {
  try {
    const { project_id } = req.params;
    const { module, status } = req.query;
    const mongoUri = req.companyConfig?.mongodb_uri;

    if (!mongoUri || !project_id) {
      throw new CustomError('Missing tenant or project information.', 400);
    }

    const workflows = await workflowService.getWorkflowsByProject(mongoUri, project_id, module, status);
    res.status(200).json(workflows);
  } catch (error) {
    console.error('Error fetching workflows by project:', error);
    next(error);
  }
};

/**
 * Updates workflow status or channels for a specific workflow.
 * Only allows changing 'status' or 'channels'.
 */
const updateWorkflowStatusOrChannel = async (req, res, next) => {
  try {
    const { workflow_id } = req.params;
    const mongoUri = req.companyConfig?.mongodb_uri;

    if (!mongoUri || !workflow_id) {
      throw new CustomError('Workflow ID or tenant configuration missing.', 400);
    }

    const allowedFields = ['status', 'channels', 'frequency'];
    const updatePayload = {};

    for (const field of allowedFields) {
      if (field in req.body) {
        if (field === 'frequency' && req.body[field] && typeof req.body[field] === 'object' && req.body[field].frequency) {
          updatePayload[field] = req.body[field].frequency;
        }
        updatePayload[field] = req.body[field];
      }
    }

    if (Object.keys(updatePayload).length === 0) {
      throw new CustomError('No valid fields provided for update.', 400);
    }

    const updatedWorkflow = await workflowService.updateWorkflowStatusOrChannel(mongoUri, workflow_id, updatePayload);
    res.status(200).json(updatedWorkflow);
  } catch (error) {
    console.error('Error updating workflow status or channel:', error);
    next(error);
  }
};

const deleteWorkflow = async (req, res, next) => {
    try {
        const { workflow_id } = req.params;
        const mongoUri = req.companyConfig?.mongodb_uri; // Assuming mongoUri is on req.companyConfig

        if (!mongoUri || !workflow_id) {
            throw new CustomError('Workflow ID or tenant configuration missing.', 400);
        }

        const result = await workflowService.deleteWorkflow(mongoUri, workflow_id);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error deleting workflow in controller:', error);
        // Use next(error) to pass it to a global error handler, or handle here
        if (error instanceof CustomError) {
            return res.status(error.statusCode).json({ message: error.message, details: error.details });
        }
        next(error); // Pass other errors to generic handler
    }
};

module.exports = {
  createWorkflow,
  getWorkflowsByProject,
  updateWorkflowStatusOrChannel,
  deleteWorkflow
};