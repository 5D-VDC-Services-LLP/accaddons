import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAutodeskAuth } from '../utils/useAutodeskAuth';
import { useProjectContext } from '../context/ProjectContext';
import { useAuth } from '../context/authContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useWorkflowManagement } from '../hooks/useWorkflowManagement';

import FooterSmall from '../components/FooterSmall';

import {
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
} from 'lucide-react';

import { BarLoader } from 'react-spinners';

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

const WorkflowPicker = ({ activeTab, onTabChange }) => {
    const tabs = ["Escalations", "Notifications"];

    return (
        <div className="border-b border-gray-200">
            <nav className="flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        type="button"
                        onClick={() => onTabChange(tab)}
                        className={`
                            whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ease-in-out
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
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    projects: autodeskProjects,
    isLoading: isProjectContextLoading,
    error: projectContextError
  } = useProjectContext();

  const [selectedModule, setSelectedModule] = useState(modules[0]);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const defaultTab = "Escalations";
  const tabFromURL = searchParams.get("tab");
  const [workflowTab, setWorkflowTab] = useState(tabFromURL || defaultTab);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Showing 8 workflows per page

  // Combined loading state for projects: true if context is loading OR if projects array is empty/null
  const isLoadingProjects = isProjectContextLoading || !autodeskProjects || autodeskProjects.length === 0;

  // NEW: Derive selectedProject directly from autodeskProjects and urlProjectId
  const selectedProject = useMemo(() => {
    console.log('Dashboard: Re-calculating selectedProject. autodeskProjects:', autodeskProjects, 'urlProjectId:', urlProjectId);
    if (!autodeskProjects || autodeskProjects.length === 0) return null;
    if (urlProjectId) {
        return autodeskProjects.find(p => p.id === urlProjectId) || autodeskProjects[0];
    }
    return autodeskProjects[0]; // Default to the first project if no URL projectId
  }, [autodeskProjects, urlProjectId]);

  // The hook is now the single source of truth for data fetching.
  // It will automatically refetch when `urlProjectId` or `workflowTab` changes.
    const {
        workflows,
        isLoadingWorkflows,
        workflowError,
        workflowType, // This will now reflect the tab label passed in
        fetchWorkflows, // For potential manual re-fetches (e.g., after edit modal save)
        updateWorkflow, // This will be passed as onUpdateWorkflowStatus
        deleteWorkflow,
        runWorkflow, // This will be passed as onRunWorkflow
    } = useWorkflowManagement(selectedProject?.id, workflowTab); // Use selectedProject?.id here

  // Reset page to 1 whenever workflows change (e.g., new project, new tab)
  useEffect(() => {
    setCurrentPage(1);
  }, [workflows]); // Depend on 'workflows' array to reset pagination


  // Calculate workflows for the current page
  const totalPages = Math.ceil((workflows?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentWorkflows = workflows ? workflows.slice(startIndex, endIndex) : [];


  // Pagination Handlers
  const goToFirstPage = () => setCurrentPage(1);
  const goToPrevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));
  const goToLastPage = () => setCurrentPage(totalPages);

  // EFFECT: Ensure URL has projectId and default tab after projects load
  useEffect(() => {
    console.log('Dashboard useEffect (URL correction): autostart. isLoadingProjects:', isLoadingProjects, 'selectedProject:', selectedProject, 'urlProjectId:', urlProjectId);

    // If projects are still loading or no project could be selected yet, wait.
    if (isLoadingProjects || !selectedProject) {
      console.log('Dashboard useEffect (URL correction): Projects still loading or no project selected. Waiting...');
      return;
    }

    // Projects are loaded and a selectedProject is available.
    const currentTab = workflowTab || defaultTab;
    const newPath = `/workflows/${selectedProject.id}`;
    const newSearchParams = new URLSearchParams();
    newSearchParams.set("tab", currentTab);
    const targetUrl = `${newPath}?${newSearchParams.toString()}`;

    // Only navigate if the current URL doesn't precisely match the target URL
    if (window.location.pathname !== newPath || window.location.search !== `?${newSearchParams.toString()}`) {
      console.log(`Dashboard useEffect (URL correction): URL mismatch. Navigating to: ${targetUrl}`);
      navigate(targetUrl, { replace: true });
    } else {
      console.log('Dashboard useEffect (URL correction): URL is already correct. No navigation needed.');
    }
  }, [isLoadingProjects, selectedProject, urlProjectId, navigate, workflowTab, defaultTab]); // Dependencies adjusted

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
      const newPath = `/workflows/${project.id}`;
      const newSearchParams = new URLSearchParams();
      newSearchParams.set("tab", workflowTab);
      navigate(`${newPath}?${newSearchParams.toString()}`);
    }
  }, [navigate, selectedProject, workflowTab]);

  const handleSignOut = useCallback(async () => {
    await logout('/');
  }, [logout]);

  // HANDLER: Navigate to the Edit Workflow Page using the specified frontend route
  const handleEditWorkflow = useCallback((workflowId, module) => {
    if (selectedProject?.id && module && workflowType) {
        const mainPath = `/workflows/${selectedProject.id}/${module.toLowerCase()}/edit-workflow/${workflowId}`;
        const searchParams = new URLSearchParams({ type: workflowType });
        navigate(`${mainPath}?${searchParams.toString()}`);
        console.log(`Navigating to: ${mainPath}?${searchParams.toString()}`);
    } else {
        toast.error("Cannot edit workflow: Project, Module, or Workflow Type is missing.");
    }
}, [navigate, selectedProject, workflowType]); 

  // --- RENDER LOGIC ---

  // Display BarLoader while projects are loading
  if (isLoadingProjects) { 
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col">
        <BarLoader color="#000" loading={isLoadingProjects} /> 
        <p className="mt-4 text-gray-700">Loading Autodesk data...</p> 
      </div>
    );
  }

  // Display error if project context has an error
  if (projectContextError) {
    return <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-700 p-4"><p>Error loading project data.</p></div>;
  }

  // If projects are loaded but no selectedProject (e.g., no projects returned from backend)
  // This message should now be more accurate.
  if (!selectedProject && !isLoadingProjects) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-700 p-4">
        <p>No projects available or selected. Please log in again or check your project access.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-black px-4 py-1">
        <div className="flex items-center justify-between">
          <span className="text-sm">
            <CompanyLogoDisplay subdomain={currentSubdomain} companyLogo={getCompanyLogo(currentSubdomain)} />
          </span>
        </div>
      </header>

      <div className="bg-white shadow-sm">
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
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Manage Workflows
          </h1>
        </div>

        <div className="flex flex-col mb-2 sm:flex-row sm:items-center sm:justify-between">

          <WorkflowPicker
            activeTab={workflowTab}
            onTabChange={handleWorkflowTabChange}
          />

          <WorkflowDropdown
            selectedProjectId={selectedProject?.id}
            selectedProjectName={selectedProject?.name}
            workflowDropdownRef={useRef(null)}
            activeTab={workflowTab}
            navigate={navigate}
          />
        </div>

        <WorkflowTable
            workflows={currentWorkflows} // Use currentWorkflows for pagination
            isLoading={isLoadingWorkflows}
            error={workflowError}
            onEditWorkflow={handleEditWorkflow} // Pass the navigation handler
            onDeleteWorkflow={deleteWorkflow}
            onUpdateWorkflowStatus={updateWorkflow} // Corrected prop name
            onRunWorkflow={runWorkflow} // Pass runWorkflow from the hook
            workflowType={workflowType} // This is the 'escalation' or 'notification' string
        />

        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700">
            Showing {Math.min(startIndex + 1, workflows?.length || 0)}-{Math.min(endIndex, workflows?.length || 0)} of {workflows?.length || 0}
          </div>
          <div className="flex items-center space-x-2">
            <button
              type='button'
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              onClick={goToFirstPage}
              disabled={currentPage === 1 || totalPages === 0}
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              type='button'
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              onClick={goToPrevPage}
              disabled={currentPage === 1 || totalPages === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 text-sm font-medium">{totalPages > 0 ? `${currentPage} of ${totalPages}` : '0 of 0'}</span>
            <button
              type='button'
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              onClick={goToNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type='button'
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              onClick={goToLastPage}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      <FooterSmall />
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