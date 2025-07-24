// src/hooks/useWorkflowManagement.js
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getBackendUrl } from '../utils/urlUtils';

const API_BASE_URL = getBackendUrl();

/**
 * Custom hook to manage workflow fetching, creation, updating, running, and deletion.
 * It dynamically adjusts API calls based on the provided workflow type.
 *
 * @param {string} projectId - The currently selected project ID.
 * @param {string} userToken - The user's authentication token (JWT).
 * @param {string} workflowTypeInput - The type of workflow to manage ('Escalations' or 'Notifications').
 * @returns {object} An object containing workflow data, loading states, and handlers.
 */

export const useWorkflowManagement = (projectId, workflowTypeInput) => {
    const workflowType = workflowTypeInput === 'Notifications' ? 'notification' : 'escalation';
    const [workflows, setWorkflows] = useState([]);
    const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false);
    const [workflowError, setWorkflowError] = useState(null);

    const fetchWorkflows = useCallback(async () => {
        if (!projectId) {
            setWorkflows([]);
            setIsLoadingWorkflows(false);
            return;
        }

        setIsLoadingWorkflows(true);
        setWorkflowError(null);
        try {
            console.log("lalalalalalalal")
            console.log("Fetching workflows for project:", projectId, "Type:", workflowType);
            let url = `${API_BASE_URL}/api/workflows/${workflowType}-workflows/${projectId}`
            const response = await axios.get(url, {
                withCredentials: true,
            });

            setWorkflows(response.data);
        } catch (error) {
            console.error(`Error fetching ${workflowType} workflows:`, error);
            setWorkflowError(error);
            toast.error(`Failed to load ${workflowType} workflows. Please try again.`);
            setWorkflows([]);
        } finally {
            setIsLoadingWorkflows(false);
        }
    }, [projectId, workflowType]);

    useEffect(() => {
        fetchWorkflows();
    }, [fetchWorkflows]);

    const createWorkflow = useCallback(async (workflowData) => {
        setIsLoadingWorkflows(true);
        setWorkflowError(null);
        try {
            const url = `${API_BASE_URL}/api/workflows/${workflowType}-workflows`

            const response = await axios.post(url, workflowData, {
                withCredentials: true,
            });
            toast.success(`Workflow created successfully!`);
            await fetchWorkflows();
            return response.data;
        } catch (error) {
            console.error(`Error creating ${workflowType} workflow:`, error);
            setWorkflowError(error);
            toast.error(`Failed to create ${workflowType} workflow: ${error.response?.data?.message || error.message}`);
            throw error;
        } finally {
            setIsLoadingWorkflows(false);
        }
    }, [projectId, workflowType, fetchWorkflows]);

    const updateWorkflow = useCallback(async (workflowId, updates) => {
        setIsLoadingWorkflows(true);
        setWorkflowError(null);
        try {
            let url = `${API_BASE_URL}/api/workflows/${workflowType}-workflows/${workflowId}`;
            const response = await axios.patch(url, updates, {
                withCredentials: true,
            });
            toast.success(`Workflow updated successfully!`);
            await fetchWorkflows();
            return response.data;
        } catch (error) {
            console.error(`Error updating ${workflowType} workflow ${workflowId}:`, error);
            setWorkflowError(error);
            toast.error(`Failed to update workflow: ${error.response?.data?.message || error.message}`);
            throw error;
        } finally {
            setIsLoadingWorkflows(false);
        }
    }, [workflowType, fetchWorkflows]);

    const deleteWorkflow = useCallback(async (workflowId) => {
        setIsLoadingWorkflows(true);
        setWorkflowError(null);
        try {
            let url = `${API_BASE_URL}/api/workflows/${workflowType}-workflows/${workflowId}`
            const response = await axios.delete(url, {
                withCredentials: true,
            });
            toast.success(`Workflow deleted successfully!`);
            await fetchWorkflows();
            return response.data;
        } catch (error) {
            console.error(`Error deleting ${workflowType} workflow ${workflowId}:`, error);
            setWorkflowError(error);
            toast.error(`Failed to delete workflow: ${error.response?.data?.message || error.message}`);
            throw error;
        } finally {
            setIsLoadingWorkflows(false);
        }
    }, [workflowType, fetchWorkflows]);



    // NEW: Function to trigger a workflow run (e.g., "Run Now")
    const runWorkflow = useCallback(async (workflowId) => {
        setWorkflowError(null);
        try {
            let url = '';
            // Assuming different endpoints for running based on type
            if (workflowType === 'escalation') {
                url = `${API_BASE_URL}/api/escalation/workflows/${workflowId}/escalate`;
            } else if (workflowType === 'notification') {
                // Adjust this URL if your notification "run" endpoint is different
                url = `${API_BASE_URL}/api/notification/workflows/${workflowId}/run`;
            } else {
                throw new Error("Unknown workflow type for running.");
            }

            const response = await axios.post(url, {}, { // Assuming POST with empty body
                withCredentials: true,
            });

            toast.success(`'${workflowType}' workflow ran successfully!`);
            return response.data;
        } catch (error) {
            console.error(`Error running ${workflowType} workflow:`, error);
            setWorkflowError(error);
            toast.error(`Failed to run ${workflowType} workflow: ${error.response?.data?.message || error.message}`);
            throw error;
        }
    }, [workflowType]);


    return {
        workflows,
        isLoadingWorkflows,
        workflowError,
        workflowType,
        fetchWorkflows,
        createWorkflow,
        updateWorkflow,
        deleteWorkflow,
        runWorkflow,
    };
};