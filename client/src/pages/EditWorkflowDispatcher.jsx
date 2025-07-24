// src/pages/EditWorkflowDispatcher.js

import React from 'react';
// 👇 1. Import useSearchParams
import { useParams, useSearchParams, Navigate } from 'react-router-dom'; 
import WorkflowConfig from './WorkflowConfig';
import NotificationConfig from './NotificationConfig';

const EditWorkflowDispatcher = () => {
  // useParams still works for /:projectId/:moduleType etc.
  const { moduleType } = useParams(); 

  // 👇 2. Use the useSearchParams hook to get the query parameters
  const [searchParams] = useSearchParams();

  // 👇 3. Get the 'type' from the query string (e.g., ?type=escalation)
  const workflowType = searchParams.get('type');

  // 4. Use the workflowType for your rendering logic
  if (workflowType === 'escalation') {
    return <WorkflowConfig />;
  }

  if (workflowType === 'notification') {
    return <NotificationConfig />;
  }

  // Fallback if the 'type' query parameter is missing or invalid
  console.error(`Unknown or missing workflowType in URL query: ?type=${workflowType}`);
  return <Navigate to="/workflows" replace />;
};

export default EditWorkflowDispatcher;