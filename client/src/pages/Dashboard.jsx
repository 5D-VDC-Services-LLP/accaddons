// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
// import { useAutodeskAuth } from '../utils/useAutodeskAuth';
// import { useProjectContext } from '../context/ProjectContext';
// import { useAuth } from '../context/authContext';
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { useWorkflowManagement } from '../hooks/useWorkflowManagement';

// import FooterSmall from '../components/FooterSmall';

// import {
//   ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
// } from 'lucide-react';

// import CompanyLogoDisplay from '../components/dashboard/CompanyLogoDisplay';
// import ModulePicker from '../components/dashboard/ModulePicker';
// import UserProfileMenu from '../components/dashboard/UserProfileMenu';
// import ProjectDropdown from '../components/dashboard/ProjectDropdown';
// import WorkflowTable from '../components/dashboard/WorkflowTable';
// import WorkflowDropdown from '../components/dashboard/WorkflowDropdown';

// // Environment variables
// const DOMAIN = import.meta.env.VITE_DOMAIN;
// const NODE_ENV = import.meta.env.NODE_ENV;

// const modules = [
//   { id: 1, name: "Workflows" },
//   { id: 2, name: "Admin" },
// ];

// const WorkflowPicker = ({ activeTab, onTabChange }) => {
//     const tabs = ["Escalations", "Notifications"];

//     return (
//         <div className="border-b border-gray-200">
//             <nav className="flex space-x-8" aria-label="Tabs">
//                 {tabs.map((tab) => (
//                     <button
//                         key={tab}
//                         type="button"
//                         onClick={() => onTabChange(tab)}
//                         className={`
//                             whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ease-in-out
//                             ${
//                                 activeTab === tab
//                                 ? 'border-black text-black'
//                                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                             }
//                         `}
//                         aria-current={activeTab === tab ? 'page' : undefined}
//                     >
//                         {tab}
//                     </button>
//                 ))}
//             </nav>
//         </div>
//     );
// };

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const { projectId: urlProjectId } = useParams();
//   const { currentSubdomain } = useAutodeskAuth();
//   const { user } = useAuth();
//   const [searchParams, setSearchParams] = useSearchParams();

//   const {
//     projects: autodeskProjects,
//     isLoading: isProjectContextLoading,
//     error: projectContextError
//   } = useProjectContext();

//   const [selectedModule, setSelectedModule] = useState(modules[0]);
//   const [selectedProject, setSelectedProject] = useState(null);
//   const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
//   const [hasRouted, setHasRouted] = useState(false);
 
//   const defaultTab = "Escalations";
//   const tabFromURL = searchParams.get("tab");
//   const [workflowTab, setWorkflowTab] = useState(tabFromURL || defaultTab);

//   // Pagination states
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 8; // Showing 8 workflows per page

//   // The hook is now the single source of truth for data fetching.
//   // It will automatically refetch when `urlProjectId` or `workflowTab` changes.
//     const {
//         workflows,
//         isLoadingWorkflows,
//         workflowError,
//         workflowType, // This will now reflect the tab label passed in
//         fetchWorkflows, // For potential manual re-fetches (e.g., after edit modal save)
//         createWorkflow,
//         updateWorkflow, // This will be passed as onUpdateWorkflowStatus
//         deleteWorkflow,
//         runWorkflow, // This will be passed as onRunWorkflow
//     } = useWorkflowManagement(urlProjectId, workflowTab); // Pass workflowTab here

//     const isLoadingProjects = isProjectContextLoading || !autodeskProjects || autodeskProjects.length === 0;

//   // Reset page to 1 whenever workflows change (e.g., new project, new tab)
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [workflows]); // Depend on 'workflows' array to reset pagination


//   // Calculate workflows for the current page
//   const totalPages = Math.ceil((workflows?.length || 0) / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const endIndex = startIndex + itemsPerPage;
//   const currentWorkflows = workflows ? workflows.slice(startIndex, endIndex) : [];


//   // Pagination Handlers
//   const goToFirstPage = () => setCurrentPage(1);
//   const goToPrevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
//   const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));
//   const goToLastPage = () => setCurrentPage(totalPages);


//   // EFFECT: Resolve project from URL or default to the first one.
//   // The hook will automatically fetch workflows once a valid project ID is in the URL.
//   useEffect(() => {
//     if (isProjectContextLoading || !autodeskProjects || autodeskProjects.length === 0) return;

//     let projectToSelect = null;
//     if (urlProjectId) {
//       const match = autodeskProjects.find(p => p.id === urlProjectId);
//       if (match) {
//         projectToSelect = match;
//       } else {
//         toast.warn("Project from URL not found. Redirecting to the first available project.");
//         projectToSelect = autodeskProjects[0];
//         // Correct the URL if the project ID was invalid
//         navigate(`/workflows/${projectToSelect.id}`, { replace: true });
//       }
//     } else {
//       // If no project ID is in the URL, navigate to the first project
//       projectToSelect = autodeskProjects[0];
//       if(!projectToSelect || !projectToSelect.id){
//         return;
//       } else{
//       navigate(`/workflows/${projectToSelect.id}`, { replace: true });
//         }

//     }

//     setSelectedProject(projectToSelect);
//   }, [autodeskProjects, urlProjectId, isProjectContextLoading, navigate]);


//   // EFFECT: Sync the `workflowTab` state with the URL search parameter.
//   useEffect(() => {
//     const currentTabInURL = searchParams.get("tab");
//     if (workflowTab && currentTabInURL !== workflowTab) {
//       const newSearchParams = new URLSearchParams(searchParams);
//       newSearchParams.set("tab", workflowTab);
//       setSearchParams(newSearchParams, { replace: true });
//     }
//   }, [workflowTab, searchParams, setSearchParams]);

//   // HANDLER: Update tab state. This will trigger the effects above.
//   const handleWorkflowTabChange = (tabLabel) => {
//     setWorkflowTab(tabLabel);
//   };

//   // HANDLER: Navigate to the new project. The useEffect will handle the rest.
//   const handleProjectSelect = useCallback((project) => {
//     if (!selectedProject || selectedProject.id !== project.id) {
//       navigate(`/workflows/${project.id}`);
//     }
//   }, [navigate, selectedProject]);

//   const handleSignOut = useCallback(async () => {
//     // Sign out logic remains the same...
//   }, [currentSubdomain, DOMAIN, NODE_ENV]);

//   // HANDLER: Navigate to the Edit Workflow Page using the specified frontend route
//   const handleEditWorkflow = useCallback((workflowId, module) => {
//     // Construct the new frontend URL: /workflows/:projectId/:moduleType/edit-workflow/:workflow_id
//     // Assuming selectedProject.id is available and workflowType is correctly set (e.g., "escalations" or "notifications")
//     if (selectedProject?.id && module) {
//       navigate(`/workflows/${selectedProject.id}/${module.toLowerCase()}/edit-workflow/${workflowId}`);
//     } else {
//       toast.error("Cannot edit workflow: Project or Workflow Type is missing.");
//     }
//   }, [navigate, selectedProject]); // Added selectedProject and workflowType to dependencies

//   // --- RENDER LOGIC ---

//   if (isProjectContextLoading) {
//     return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p>Loading Autodesk data...</p></div>;
//   }

//   if (projectContextError) {
//     return <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-700 p-4"><p>Error loading project data.</p></div>;
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col">
//       {/* Header and User Menu sections remain the same... */}
//       <header className="bg-black px-4 py-1">
//         <div className="flex items-center justify-between">
//           <span className="text-sm">
//             <CompanyLogoDisplay subdomain={currentSubdomain} companyLogo={getCompanyLogo(currentSubdomain)} />
//           </span>
//         </div>
//       </header>

//       <div className="bg-white shadow-sm">
//         <div className="flex items-center justify-between px-4">
//           <div>
//             <ModulePicker
//             modules={modules}
//             selected={selectedModule}
//             onSelect={setSelectedModule}
//         />
//           </div>
//           <div className="flex items-center space-x-2">
//             <ProjectDropdown
//               projects={autodeskProjects}
//               selectedProject={selectedProject}
//               setSelectedProject={handleProjectSelect}
//               projectDropdownRef={useRef(null)}
//             />
//             <button
//               type='button'
//               className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-sm font-medium text-white"
//               onClick={() => setIsUserMenuOpen(true)}
//               title="Open User Profile"
//             >
//               {user?.first_name?.charAt(0).toUpperCase()}{user?.last_name?.charAt(0).toUpperCase()}
//             </button>
//           </div>
//         </div>
//       </div>

//       <UserProfileMenu
//         isOpen={isUserMenuOpen}
//         onClose={() => setIsUserMenuOpen(false)}
//         userProfile={user}
//         onSignOut={handleSignOut}
//       />

//       <main className="flex-1 px-24 py-6 w-full">
//         <div className="mb-4">
//           <h1 className="text-3xl font-bold text-gray-900">
//             Manage Workflows
//           </h1>
//         </div>

//         <div className="flex flex-col mb-2 sm:flex-row sm:items-center sm:justify-between">

//           <WorkflowPicker
//             activeTab={workflowTab}
//             onTabChange={handleWorkflowTabChange}
//           />

//           <WorkflowDropdown
//             selectedProjectId={selectedProject?.id}
//             selectedProjectName={selectedProject?.name}
//             workflowDropdownRef={useRef(null)}
//             activeTab={workflowTab}
//             navigate={navigate}
//           />
//         </div>

//         <WorkflowTable
//             workflows={currentWorkflows} // Use currentWorkflows for pagination
//             isLoading={isLoadingWorkflows}
//             error={workflowError}
//             onEditWorkflow={handleEditWorkflow} // Pass the navigation handler
//             onDeleteWorkflow={deleteWorkflow}
//             onUpdateWorkflowStatus={updateWorkflow} // Corrected prop name
//             onRunWorkflow={runWorkflow} // Pass runWorkflow from the hook
//             workflowType={workflowType}
//             // Removed modal-related props as editing is now navigation-based
//         />

//         <div className="flex items-center justify-between mt-6">
//           <div className="text-sm text-gray-700">
//             Showing {Math.min(startIndex + 1, workflows?.length || 0)}-{Math.min(endIndex, workflows?.length || 0)} of {workflows?.length || 0}
//           </div>
//           <div className="flex items-center space-x-2">
//             <button
//               type='button'
//               className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
//               onClick={goToFirstPage}
//               disabled={currentPage === 1 || totalPages === 0}
//             >
//               <ChevronsLeft className="w-4 h-4" />
//             </button>
//             <button
//               type='button'
//               className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
//               onClick={goToPrevPage}
//               disabled={currentPage === 1 || totalPages === 0}
//             >
//               <ChevronLeft className="w-4 h-4" />
//             </button>
//             <span className="px-3 py-1 text-sm font-medium">{totalPages > 0 ? `${currentPage} of ${totalPages}` : '0 of 0'}</span>
//             <button
//               type='button'
//               className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
//               onClick={goToNextPage}
//               disabled={currentPage === totalPages || totalPages === 0}
//             >
//               <ChevronRight className="w-4 h-4" />
//             </button>
//             <button
//               type='button'
//               className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
//               onClick={goToLastPage}
//               disabled={currentPage === totalPages || totalPages === 0}
//             >
//               <ChevronsRight className="w-4 h-4" />
//             </button>
//           </div>
//         </div>
//       </main>

//       <FooterSmall />
//     </div>
//   );
// };

// export default Dashboard;

// // Helper function to get company logo (kept in main file for now or moved to utils)
// const logos = import.meta.glob('../assets/companylogos/*.{svg,png}', { eager: true });
// const getCompanyLogo = (subdomain) => {
//   const svgPath = `../assets/companylogos/${subdomain}_white.svg`;
//   const pngPath = `../assets/companylogos/${subdomain}.png`;
//   return logos[svgPath]?.default || logos[pngPath]?.default || null;
// };



import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  const [hasRouted, setHasRouted] = useState(false);
  
  const defaultTab = "Escalations";
  const tabFromURL = searchParams.get("tab");
  const [workflowTab, setWorkflowTab] = useState(tabFromURL || defaultTab);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Showing 8 workflows per page

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
    } = useWorkflowManagement(urlProjectId, workflowTab); // Pass workflowTab here

    const isLoadingProjects = isProjectContextLoading || !autodeskProjects || autodeskProjects.length === 0;

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
      if(!projectToSelect || !projectToSelect.id){
        return;
      } else{
      navigate(`/workflows/${projectToSelect.id}`, { replace: true });
        }

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

  // HANDLER: Navigate to the Edit Workflow Page using the specified frontend route
  const handleEditWorkflow = useCallback((workflowId, module) => {
    // 'module' is "issues", "reviews", or "forms" (from workflow.module)
    // 'workflowType' is "escalation" or "notification" (from the useWorkflowManagement hook)

    // Construct the new frontend URL: /workflows/:projectId/:moduleType/edit-workflow/:workflow_id
    // Assuming selectedProject.id is available and module is correctly set (e.g., "escalation" or "notification")
    if (selectedProject?.id && module && workflowType) {
        // 1. Construct the main path with the module ("issues", "forms", etc.)
        const mainPath = `/workflows/${selectedProject.id}/${module.toLowerCase()}/edit-workflow/${workflowId}`;
        
        // 2. Create search params to add the workflow type
        const searchParams = new URLSearchParams({ type: workflowType });

        // 3. Navigate to the full path with the query parameter
        navigate(`${mainPath}?${searchParams.toString()}`);

        console.log(`Navigating to: ${mainPath}?${searchParams.toString()}`);

    } else {
        toast.error("Cannot edit workflow: Project, Module, or Workflow Type is missing.");
    }
}, [navigate, selectedProject, workflowType]); // ✅ Add workflowType to the dependency array

  // --- RENDER LOGIC ---

  if (isLoadingProjects) { // HIGHLIGHT: Renamed isProjectContextLoading to isLoadingProjects for clarity
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
            // Removed modal-related props as editing is now navigation-based
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
