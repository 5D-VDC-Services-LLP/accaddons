// src/routes/workflowRoutes.js
const express = require('express');
const router = express.Router();
const workflowController = require('../controllers/workflowController');
const notificationWorkflowController = require('../controllers/notificationWorkflowController');
const { authenticateJWT } = require('../middleware/auth'); // JWT auth


router.post('/escalation-workflows', authenticateJWT, workflowController.createWorkflow);
router.get('/escalation-workflows/:project_id', authenticateJWT, workflowController.getWorkflowsByProject);
router.get('/escalation-workflows/edit/:workflow_id', authenticateJWT, workflowController.getWorkflowById);
router.patch('/escalation-workflows/:workflow_id', authenticateJWT, workflowController.updateWorkflow);
router.delete('/escalation-workflows/:workflow_id', authenticateJWT, workflowController.deleteWorkflow);

router.post('/notification-workflows', authenticateJWT, notificationWorkflowController.createNotificationWorkflow);
router.get('/notification-workflows/:project_id', authenticateJWT, notificationWorkflowController.getNotificationWorkflowsByProject);
router.get('/notification-workflows/edit/:workflow_id', authenticateJWT, notificationWorkflowController.getNotificationWorkflowsById);
router.patch('/notification-workflows/:workflow_id', authenticateJWT, notificationWorkflowController.updateNotificationWorkflow);
router.delete('/notification-workflows/:workflow_id', authenticateJWT, notificationWorkflowController.deleteNotificationWorkflow);

module.exports = router;
