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
      frequency,
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

    const newWorkflow = await workflowService.createWorkflow(mongoUri, {
      workflow_name,
      project_id,
      module,
      channels,
      escalate_to,
      filters,
      frequency,
      created_by
    });
    
    console.log(newWorkflow)
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

const getWorkflowById = async (req, res, next) => {
  try {
    const { workflow_id } = req.params;
    const mongoUri = req.companyConfig?.mongodb_uri;

    if (!mongoUri || !workflow_id) {
      throw new CustomError('Workflow ID or tenant configuration missing.', 400);
    }

    const workflow = await workflowService.getWorkflowById(mongoUri, workflow_id);

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
 * Updates workflow status or channels for a specific workflow.
 * Only allows changing 'status' or 'channels'.
 */
const updateWorkflow = async (req, res, next) => {
  try {
    const { workflow_id } = req.params;
    const mongoUri = req.companyConfig?.mongodb_uri;

    if (!mongoUri || !workflow_id) {
      throw new CustomError('Workflow ID or tenant configuration missing.', 400);
    }

    // Destructure all potential update fields from req.body.
    // Use default undefined to ensure fields not sent are not treated as null.
    const {
      workflow_name,
      channels,
      escalate_to,
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
    if (escalate_to !== undefined) {
      updatePayload.escalate_to = escalate_to;
    }
    if (frequency !== undefined) {
      updatePayload.frequency = frequency;
    }
    if (filters !== undefined) {
      updatePayload.filters = filters;
    }
    if (status !== undefined) { // Add status field if it's provided
      updatePayload.status = status;
    }

    if (Object.keys(updatePayload).length === 0) {
      throw new CustomError('No valid fields provided for update.', 400);
    }

    // console.log('Update Payload sent to service:', updatePayload); // For debugging

    const updatedWorkflow = await workflowService.updateWorkflow(mongoUri, workflow_id, updatePayload);
    res.status(200).json(updatedWorkflow);
  } catch (error) {
    console.error('Controller: Error updating workflow:', error);
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
        if (error instanceof CustomError) {
            return res.status(error.statusCode).json({ message: error.message, details: error.details });
        }
        next(error);
    }
};

module.exports = {
  createWorkflow,
  getWorkflowsByProject,
  getWorkflowById,
  updateWorkflow,
  deleteWorkflow
};