import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAutodeskAuth } from '../utils/useAutodeskAuth';
import { getBackendUrl } from '../utils/urlUtils';
import { useProjectContext } from '../context/ProjectContext';
import { useAuth } from '../context/authContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Importing all used icons (can be optimized if many are only used in sub-components)
import {
  Settings, BarChart3, Search, Filter, Plus, Grid3x3, MapPin, ChevronDown,
  MoreHorizontal, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Building2, Hammer, Menu, X, Play, Pause, Mail, MessageCircle, Edit, Trash2
} from 'lucide-react';

// Import newly extracted components
import CompanyLogoDisplay from '../components/dashboard/CompanyLogoDisplay';
import UserProfileMenu from '../components/dashboard/UserProfileMenu';
import ProjectDropdown from '../components/dashboard/ProjectDropdown';
import WorkflowTable from '../components/dashboard/WorkflowTable'; // Corrected import path
import WorkflowDropdown from '../components/dashboard/WorkflowDropdown';

// Environment variables
const DOMAIN = import.meta.env.VITE_DOMAIN;
const NODE_ENV = import.meta.env.NODE_ENV;

const Dashboard = () => {
  const navigate = useNavigate();
  const { projectId: urlProjectId } = useParams();
  const { currentSubdomain } = useAutodeskAuth();
  const { user } = useAuth();

  const {
    projects: autodeskProjects,
    isLoading: isProjectContextLoading,
    error: projectContextError
  } = useProjectContext();

  console.log(autodeskProjects)

  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [workflows, setWorkflows] = useState([]);
  const [workflowFrequencies, setWorkflowFrequencies] = useState({}); // This might become redundant if frequency is always part of workflow object

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // --- Ref for dropdowns (passed to children) ---
  const projectDropdownRef = useRef(null);
  const workflowDropdownRef = useRef(null);

  // --- NEW: Refactor workflow fetching into a useCallback ---
  const fetchWorkflows = useCallback(async (projectIdToFetch) => {
    if (!projectIdToFetch) {
      console.warn("No project ID provided to fetch workflows.");
      setWorkflows([]);
      setWorkflowFrequencies({});
      setIsLoadingWorkflows(false);
      return;
    }

    setIsLoadingWorkflows(true);
    try {
      const response = await fetch(`${getBackendUrl()}/api/workflows/${projectIdToFetch}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch workflows: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Fetched data:", data);
      setWorkflows(data);

      // Update workflow frequencies (if still needed for other parts of your app)
      const newFrequencies = {};
      data.forEach(workflow => {
        newFrequencies[workflow.workflow_id] = workflow.frequency || []; // Use workflow_id for key
      });
      setWorkflowFrequencies(newFrequencies);

    } catch (error) {
      console.error("Error fetching workflows:", error);
      toast.error("Failed to load workflows for this project. Please try again.");
      setWorkflows([]);
      setWorkflowFrequencies({});
    } finally {
      setIsLoadingWorkflows(false);
    }
  }, []); // No dependencies that change, so it's stable

  // --- EFFECT: Resolve project from URL/context and then fetch workflows for it ---
  useEffect(() => {
    const resolveProjectAndTriggerFetch = async () => {
      if (isProjectContextLoading || autodeskProjects.length === 0) return;

      let projectToSelect = null;

      if (urlProjectId) {
        const match = autodeskProjects.find(p => p.id === urlProjectId);
        if (match) {
          projectToSelect = match;
        } else {
          toast.warn("Project not found. Redirecting to the first available project.");
          projectToSelect = autodeskProjects[0];
          navigate(`/workflows/${projectToSelect.id}`, { replace: true });
        }
      } else {
        projectToSelect = autodeskProjects[0];
        navigate(`/workflows/${projectToSelect.id}`, { replace: true });
      }

      setSelectedProject(projectToSelect);

      // Trigger the fetch for the resolved project
      if (projectToSelect?.id) {
        fetchWorkflows(projectToSelect.id);
      }
    };

    resolveProjectAndTriggerFetch();
  }, [autodeskProjects, urlProjectId, isProjectContextLoading, navigate, fetchWorkflows]); // Added fetchWorkflows to dependencies

  // Optional: Add a separate useEffect to log workflows when they actually change
  useEffect(() => {
    console.log("Workflows state updated:", workflows);
  }, [workflows]);

  // --- Initial Dashboard Setup (retained but adjusted) ---
  useEffect(() => {
    const initializeDashboard = async () => {
      // This effect is primarily for session check if needed,
      // and initial ProjectContext loading.
    };

    if (!isProjectContextLoading || projectContextError) {
      initializeDashboard();
    }
  }, [isProjectContextLoading, projectContextError, currentSubdomain, DOMAIN, NODE_ENV, navigate]);


  // --- Handlers ---
  const handleSignOut = useCallback(async () => {
    try {
      sessionStorage.clear();
      const frontendBaseUrl = NODE_ENV === 'development'
        ? `http://${currentSubdomain}.${DOMAIN}:5173`
        : `https://${currentSubdomain}.${DOMAIN}`;

      const redirectAfterLogout = encodeURIComponent(frontendBaseUrl);
      await fetch(`${getBackendUrl()}/api/auth/logout?redirectTo=${redirectAfterLogout}`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Sign out failed due to network or unexpected error:', err);
      toast.error('Sign out failed. Please try again or check your internet connection.');
      sessionStorage.clear();

      const fallbackFrontendBaseUrl = NODE_ENV === 'development'
        ? `http://${currentSubdomain}.${DOMAIN}:5173`
        : `https://${currentSubdomain}.${DOMAIN}`;

      window.location.href = `${fallbackFrontendBaseUrl}`;
    }
  }, [currentSubdomain, DOMAIN, NODE_ENV]);

  const handleEditWorkflow = useCallback((workflowId) => {
    toast.info(`Editing workflow with ID: ${workflowId}`);
    // Implement actual edit logic, e.g., navigate to an edit form
  }, []);

  // --- REMOVED: handleDeleteWorkflow from Dashboard.jsx ---
  // This logic is now handled within WorkflowTable.jsx

  // Modified handler for project selection from dropdown
  const handleProjectSelect = useCallback((project) => {
    if (!selectedProject || selectedProject.id !== project.id) {
      setSelectedProject(project);
      navigate(`/workflows/${project.id}`);
      // Trigger re-fetch for the newly selected project
      fetchWorkflows(project.id);
    }
  }, [navigate, selectedProject, fetchWorkflows]);


  // --- Loading State Render ---
  if (isProjectContextLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg font-medium text-gray-700">Loading Autodesk data...</p>
      </div>
    );
  }

  // Error state render from ProjectContext
  if (projectContextError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-700 p-4">
        <p className="text-lg font-medium mb-2">Error loading workflows data:</p>
        <p className="text-sm">{projectContextError.message || 'An unknown error occurred.'}</p>
        <p className="text-sm mt-2">Please refresh the page or try again later.</p>
      </div>
    );
  }

  // Loading state for workflows specifically after initial project context is loaded
  if (isLoadingWorkflows) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg font-medium text-gray-700">Loading workflows for {selectedProject?.name || 'the selected project'}...</p>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Notification Header */}
      <header className="bg-black text-white px-4 py-1">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <span className="text-sm">Notifications Hub</span>
        </div>
      </header>

      {/* Main App Header with Company Logos and User Menu */}
      <div className="bg-white shadow-sm py-2">
        <div className="flex items-center justify-between max-w-7xl mx-auto px-4">
          <CompanyLogoDisplay subdomain={currentSubdomain} companyLogo={getCompanyLogo(currentSubdomain)} />
          <div className="flex items-center space-x-2">
            <ProjectDropdown
              projects={autodeskProjects}
              selectedProject={selectedProject}
              setSelectedProject={handleProjectSelect}
              projectDropdownRef={projectDropdownRef}
            />
            <button
              className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-sm font-medium text-white"
              onClick={() => setIsUserMenuOpen(true)}
              title="Open User Profile"
            >
              {user.first_name.charAt(0).toUpperCase() + user.last_name.charAt(0).toUpperCase()}
            </button>
          </div>
        </div>
      </div>

      {/* User Profile Slide-out Menu */}
      <UserProfileMenu
        isOpen={isUserMenuOpen}
        onClose={() => setIsUserMenuOpen(false)}
        userProfile={user}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Welcome, {user.first_name}
          </h1>
          {selectedProject && (
              <p className="text-gray-600 text-sm mt-1">Project ID: {selectedProject.id}</p>
          )}
        </div>

        {/* Notification Workflows Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Escalation Workflows</h2>
          <WorkflowDropdown
            selectedProjectId={selectedProject?.id}
            selectedProjectName={selectedProject?.name}
            workflowDropdownRef={workflowDropdownRef}
            navigate={navigate}
          />
        </div>

        {/* Workflows Table */}
        {/* Removed the conditional rendering here, WorkflowTable handles its own empty/loading states */}
        <WorkflowTable
          workflows={workflows}
          isLoading={isLoadingWorkflows} // Pass the loading state
          error={projectContextError} // Pass the project context error (or a specific workflow error if you have one)
          // workflowFrequencies={workflowFrequencies} // If still needed for other display, pass it
          // onUpdateFrequency={handleUpdateWorkflowFrequency} // If still needed for other updates, pass it
          onEditWorkflow={handleEditWorkflow}
          // REMOVED: onDeleteWorkflow prop from here, as WorkflowTable handles it internally
          // NEW: Pass a callback to trigger re-fetching workflows after an update/delete
          onWorkflowsUpdated={() => fetchWorkflows(selectedProject?.id)}
        />


        {/* Simple Pagination - This needs to be hooked up to `workflows` state if you want actual pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700">
            Showing 1-{workflows.length} of {workflows.length}
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50" disabled><ChevronsLeft className="w-4 h-4" /></button>
            <button className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50" disabled><ChevronLeft className="w-4 h-4" /></button>
            <span className="px-3 py-1 text-sm font-medium">1 of 1</span>
            <button className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50" disabled><ChevronRight className="w-4 h-4" /></button>
            <button className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50" disabled><ChevronsRight className="w-4 h-4" /></button>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;

// Helper function to get company logo (kept in main file for now or moved to utils)
const logos = import.meta.glob('../assets/companylogos/*.{svg,png}', { eager: true });
const getCompanyLogo = (subdomain) => {
  const svgPath = `../assets/companylogos/${subdomain}.svg`;
  const pngPath = `../assets/companylogos/${subdomain}.png`;
  return logos[svgPath]?.default || logos[pngPath]?.default || null;
};