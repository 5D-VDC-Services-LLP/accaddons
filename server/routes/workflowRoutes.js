// src/routes/workflowRoutes.js
const express = require('express');
const router = express.Router();
const workflowController = require('../controllers/workflowController');
const { authenticateJWT } = require('../middleware/auth'); // JWT auth


// POST /api/workflows
router.post('/', authenticateJWT, workflowController.createWorkflow);

// GET /api/workflows/:project_id?module=forms&status=active
router.get('/:project_id', authenticateJWT, workflowController.getWorkflowsByProject);

// PATCH /api/workflows/:workflow_id
router.patch('/:workflow_id', authenticateJWT, workflowController.updateWorkflowStatusOrChannel);

// DELETE /api/workflows/:workflow_id
router.delete('/:workflow_id', authenticateJWT, workflowController.deleteWorkflow);

module.exports = router;
