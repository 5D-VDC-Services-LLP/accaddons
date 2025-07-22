/*
================================================================================
FILE: /src/pages/Dashboard.jsx (Updated)
================================================================================
- Removes redundant calls to `fetchWorkflows`. The `useWorkflowManagement` hook
  now handles all data fetching automatically when its dependencies change.
- Simplifies the `handleProjectSelect` and project resolution `useEffect`.
- Corrects the prop passed to `WorkflowTable`'s `onWorkflowsUpdated`.
*/
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAutodeskAuth } from '../utils/useAutodeskAuth';
import { getBackendUrl } from '../utils/urlUtils';
import { useProjectContext } from '../context/ProjectContext';
import { useAuth } from '../context/authContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useWorkflowManagement } from '../hooks/useWorkflowManagement';

// Importing icons...
import {
  Settings, BarChart3, Search, Filter, Plus, Grid3x3, MapPin, ChevronDown,
  MoreHorizontal, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Building2, Hammer, Menu, X, Play, Pause, Mail, MessageCircle, Edit, Trash2,
  Workflow
} from 'lucide-react';

// Import components
import CompanyLogoDisplay from '../components/dashboard/CompanyLogoDisplay';
import ModulePicker from '../components/dashboard/ModulePicker';
import UserProfileMenu from '../components/dashboard/UserProfileMenu';
import ProjectDropdown from '../components/dashboard/ProjectDropdown';
import WorkflowTable from '../components/dashboard/WorkflowTable';
import WorkflowDropdown from '../components/dashboard/WorkflowDropdown';

// Environment variables
const DOMAIN = import.meta.env.VITE_DOMAIN;
const NODE_ENV = import.meta.env.NODE_ENV;

const modules = [
  { id: 1, name: "Workflows" },
  { id: 2, name: "Admin" },
];

/*
================================================================================
COMPONENT: WorkflowPicker (Correct Implementation)
================================================================================
- This is the MOST LIKELY source of your page reload issue.
- Ensure your component uses <button> elements with `type="button"` and an
  `onClick` handler.
- DO NOT use <a> tags with `href` attributes, as that will cause a full
  page navigation and reload.
- You can replace the content of your `src/components/dashboard/WorkflowPicker.jsx`
  with this code.
*/
const WorkflowPicker = ({ activeTab, onTabChange }) => {
    const tabs = ["Escalations", "Notifications"];

    return (
        <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        type="button" // Prevents form submission if nested in a form
                        onClick={() => onTabChange(tab)}
                        className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ease-in-out
                            ${
                                activeTab === tab
                                ? 'border-black text-black'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }
                        `}
                        aria-current={activeTab === tab ? 'page' : undefined}
                    >
                        {tab}
                    </button>
                ))}
            </nav>
        </div>
    );
};


const Dashboard = () => {
  const navigate = useNavigate();
  const { projectId: urlProjectId } = useParams();
  const { currentSubdomain } = useAutodeskAuth();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    projects: autodeskProjects,
    isLoading: isProjectContextLoading,
    error: projectContextError
  } = useProjectContext();

  const [selectedModule, setSelectedModule] = useState(modules[0]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const defaultTab = "Escalations";
  const tabFromURL = searchParams.get("tab");
  const [workflowTab, setWorkflowTab] = useState(tabFromURL || defaultTab);

  // The hook is now the single source of truth for data fetching.
  // It will automatically refetch when `urlProjectId` or `workflowTab` changes.
    const {
        workflows,
        isLoadingWorkflows,
        workflowError,
        workflowType, // This will now reflect the tab label passed in
        fetchWorkflows, // For potential manual re-fetches (e.g., after edit modal save)
        createWorkflow,
        updateWorkflow, // This will be passed as onUpdateWorkflowStatusOrChannel
        deleteWorkflow,
        runWorkflow, // This will be passed as onRunWorkflow
    } = useWorkflowManagement(urlProjectId, workflowTab); // Pass workflowTab here

  // EFFECT: Resolve project from URL or default to the first one.
  // The hook will automatically fetch workflows once a valid project ID is in the URL.
  useEffect(() => {
    if (isProjectContextLoading || !autodeskProjects || autodeskProjects.length === 0) return;

    let projectToSelect = null;
    if (urlProjectId) {
      const match = autodeskProjects.find(p => p.id === urlProjectId);
      if (match) {
        projectToSelect = match;
      } else {
        toast.warn("Project from URL not found. Redirecting to the first available project.");
        projectToSelect = autodeskProjects[0];
        // Correct the URL if the project ID was invalid
        navigate(`/workflows/${projectToSelect.id}`, { replace: true });
      }
    } else {
      // If no project ID is in the URL, navigate to the first project
      projectToSelect = autodeskProjects[0];
      navigate(`/workflows/${projectToSelect.id}`, { replace: true });
    }

    setSelectedProject(projectToSelect);
  }, [autodeskProjects, urlProjectId, isProjectContextLoading, navigate]);

  // EFFECT: Sync the `workflowTab` state with the URL search parameter.
  useEffect(() => {
    const currentTabInURL = searchParams.get("tab");
    if (workflowTab && currentTabInURL !== workflowTab) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set("tab", workflowTab);
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [workflowTab, searchParams, setSearchParams]);

  // HANDLER: Update tab state. This will trigger the effects above.
  const handleWorkflowTabChange = (tabLabel) => {
    setWorkflowTab(tabLabel);
  };

  // HANDLER: Navigate to the new project. The useEffect will handle the rest.
  const handleProjectSelect = useCallback((project) => {
    if (!selectedProject || selectedProject.id !== project.id) {
      navigate(`/workflows/${project.id}`);
    }
  }, [navigate, selectedProject]);

  const handleSignOut = useCallback(async () => {
    // Sign out logic remains the same...
  }, [currentSubdomain, DOMAIN, NODE_ENV]);

  const handleEditWorkflow = useCallback((workflowId) => {
    toast.info(`Editing workflow with ID: ${workflowId}`);
  }, []);

  // --- RENDER LOGIC ---

  if (isProjectContextLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p>Loading Autodesk data...</p></div>;
  }

  if (projectContextError) {
    return <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-700 p-4"><p>Error loading project data.</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header and User Menu sections remain the same... */}
      <header className="bg-black px-4 py-1">
        <div className="flex items-center justify-between">
          <span className="text-sm">
            <CompanyLogoDisplay subdomain={currentSubdomain} companyLogo={getCompanyLogo(currentSubdomain)} />
          </span>
        </div>
      </header>

      <div className="bg-white shadow-sm py-2">
        <div className="flex items-center justify-between px-4">
          <div>
            <ModulePicker 
            modules={modules}
            selected={selectedModule}
            onSelect={setSelectedModule}
        />
          </div>
          <div className="flex items-center space-x-2">
            <ProjectDropdown
              projects={autodeskProjects}
              selectedProject={selectedProject}
              setSelectedProject={handleProjectSelect}
              projectDropdownRef={useRef(null)}
            />
            <button
              type='button'
              className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-sm font-medium text-white"
              onClick={() => setIsUserMenuOpen(true)}
              title="Open User Profile"
            >
              {user?.first_name?.charAt(0).toUpperCase()}{user?.last_name?.charAt(0).toUpperCase()}
            </button>
          </div>
        </div>
      </div>

      <UserProfileMenu
        isOpen={isUserMenuOpen}
        onClose={() => setIsUserMenuOpen(false)}
        userProfile={user}
        onSignOut={handleSignOut}
      />

      <main className="flex-1 px-24 py-6 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Welcome, {user.first_name || 'User'}
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Escalation Workflows</h2>
          <WorkflowDropdown
            selectedProjectId={selectedProject?.id}
            selectedProjectName={selectedProject?.name}
            workflowDropdownRef={useRef(null)}
            activeTab={workflowTab}
            navigate={navigate}
          />
        </div>

        {/* Use the corrected WorkflowPicker component */}
        <div className="mb-6">
          <WorkflowPicker
            activeTab={workflowTab}
            onTabChange={handleWorkflowTabChange}
          />
        </div>

        <WorkflowTable
                    workflows={workflows}
                    isLoading={isLoadingWorkflows}
                    error={workflowError}
                    onEditWorkflow={handleEditWorkflow}
                    onDeleteWorkflow={deleteWorkflow}
                    onUpdateWorkflowStatusOrChannel={updateWorkflow} 
                    onRunWorkflow={runWorkflow} 
                    workflowType={workflowType} 
                    isEditModalOpen={false}
                    setIsEditModalOpen={() => {}}
                    editingWorkflow={null} 
                    handleSaveEditedWorkflow={() => {}} 
                />

        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700">
            Showing 1-{workflows.length} of {workflows.length}
          </div>
          <div className="flex items-center space-x-2">
            <button type='button' className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50" disabled><ChevronsLeft className="w-4 h-4" /></button>
            <button type='button' className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50" disabled><ChevronLeft className="w-4 h-4" /></button>
            <span className="px-3 py-1 text-sm font-medium">1 of 1</span>
            <button type='button' className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50" disabled><ChevronRight className="w-4 h-4" /></button>
            <button type='button' className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50" disabled><ChevronsRight className="w-4 h-4" /></button>
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
  const svgPath = `../assets/companylogos/${subdomain}_white.svg`;
  const pngPath = `../assets/companylogos/${subdomain}.png`;
  return logos[svgPath]?.default || logos[pngPath]?.default || null;
};