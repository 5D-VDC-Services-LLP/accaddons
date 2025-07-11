// src/routes/autodeskDataRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/auth'); // For your internal JWT
const autodeskDataController = require('../controllers/autodeskDataController'); // For the new controller

// // All routes in this file will use your internal JWT for authentication
// // and the custom middleware to manage Autodesk APS tokens.
// router.use(authMiddleware.authenticateJWT);
// router.use(autodeskDataController.checkAndRefreshApsTokens); // Token check and refresh middleware

// GET /api/project_users
router.get('/:projectId/users', autodeskDataController.fetchProjectUsers);

// GET /api/:project_id/company
router.get('/:companyId/company', autodeskDataController.fetchProjectCompany);

// GET /api/:projectId/issue-filters
router.get('/:projectId/issue-filters', authenticateJWT, autodeskDataController.fetchIssueTypesAndRootCauses)

// GET /api/:projectId/review-filters
router.get('/:projectId/review-filters', authenticateJWT, autodeskDataController.fetchReviewWorkflows)

// GET /api/:projectId/review-filters
router.get('/:projectId/form-filters', authenticateJWT, autodeskDataController.fetchFormTemplates)


// // GET /api/autodesk/hubs/:hubId/projects
// router.get('/hubs/:hubId/projects', autodeskDataController.getProjectsInHub);


module.exports = router;