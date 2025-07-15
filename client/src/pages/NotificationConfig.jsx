// // src/pages/WorkflowConfig.jsx
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom'; // Import useParams and useNavigate
// import { useAuth } from '../context/authContext'; // Importing auth context for user data
// import {
//   WorkflowHeader,
//   WorkflowDetails,
//   NotificationChannels,
//   WorkflowFilter,
//   NotificationSchedule,
// } from '../components/workflow';
// import { getBackendUrl } from '../utils/urlUtils';

// const NotificationConfig = () => {
//   // Extract projectId and moduleType from the URL
//   const { projectId, moduleType } = useParams();
//   const navigate = useNavigate(); // Initialize useNavigate hook for navigation

//   const [title, setTitle] = useState('Issues on sheets'); // Default title, can be dynamic
//   // saveOption state is not directly used in the UI for this task, but kept for consistency
//   const [saveOption, setSaveOption] = useState('new-file');
//   const [filters, setFilters] = useState([]);
//   const [selectedDays, setSelectedDays] = useState(['mon', 'tue', 'wed', 'thu', 'fri']);
//   const [isWhatsAppSelected, setIsWhatsAppSelected] = useState(false);
//   const [isEmailSelected, setIsEmailSelected] = useState(false);

//   // States for WorkflowDetails component's search and selection
//   const [searchUser, setSearchUser] = useState('');
//   const [searchCompany, setSearchCompany] = useState('');
//   const [searchRole, setSearchRole] = useState('');

//   const [selectedUsers, setSelectedUsers] = useState([]); // Stores selected user objects
//   const [selectedCompanies, setSelectedCompanies] = useState([]); // Stores selected company objects
//   const [selectedRoles, setSelectedRoles] = useState([]);

//   const [isUserActive, setIsUserActive] = useState(false);
//   const [isCompanyActive, setIsCompanyActive] = useState(false);
//   const [isRoleActive, setIsRoleActive] = useState(false);


//   // States for fetching dropdown data
//   const [users, setUsers] = useState([]);
//   const [companies, setCompanies] = useState([]);
//   const [roles, setRoles] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null); // State to handle fetch errors
//   const [moduleFilters, setModuleFilters] = useState(null);
//   const [filtersLoading, setFiltersLoading] = useState(false);
//   const { user } = useAuth();

//   // Optional: Set initial title based on moduleType, or fetch project details
//   useEffect(() => {
//     // You can use projectId to fetch actual project details (e.g., project name)
//     // and moduleType to tailor the workflow configuration.
//     setTitle('New Workflow Configuration');
//   }, [projectId, moduleType]); // Re-run when projectId or moduleType changes

//   // Fetch users and companies data for dropdowns
//   useEffect(() => {
//     const fetchDropdownData = async () => {
//       try {
//         setLoading(true);
//         setError(null); // Clear previous errors

//         const [usersRes, companiesRes, rolesRes] = await Promise.all([
//           fetch(`${getBackendUrl()}/api/autodesk/${projectId}/users`),
//           fetch(`${getBackendUrl()}/api/autodesk/${projectId}/company`),

//         ]);

//         if (!usersRes.ok) throw new Error(`HTTP error! status: ${usersRes.status} for users`);
//         if (!companiesRes.ok) throw new Error(`HTTP error! status: ${companiesRes.status} for companies`);


//         const usersData = await usersRes.json();
//         console.log(usersData)
//         const companiesData = await companiesRes.json();
//         console.log(companiesData)
//         const rolesData = usersData.data.roles;
//         console.log(rolesData)

//         setUsers(usersData.data || []);
//         setCompanies(companiesData.data || []);
//         setRoles(rolesData || []);

//       } catch (err) {
//         console.error("Error fetching dropdown data:", err);
//         setError("Failed to load user, company and role data. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (projectId) { // Only fetch if projectId is available
//       fetchDropdownData();
//     }
//   }, [projectId]); // Dependency on projectId to refetch if it changes

//   useEffect(() => {
//   if (moduleFilters && filters.length === 0) {
//     let firstFilterBy = null;
//     let defaultAttribute = '';
//     if (moduleType === 'issues' && moduleFilters['Due Date']) {
//       firstFilterBy = 'Due Date';
//       // Select first attribute for Due Date
//       defaultAttribute = Array.isArray(moduleFilters['Due Date']) && moduleFilters['Due Date'][0]?.id
//         ? moduleFilters['Due Date'][0].id
//         : '';
//     } else if (moduleType === 'reviews' && moduleFilters['Next Step Due Date']) {
//       firstFilterBy = 'Next Step Due Date';
//       defaultAttribute = Array.isArray(moduleFilters['Next Step Due Date']) && moduleFilters['Next Step Due Date'][0]?.id
//         ? moduleFilters['Next Step Due Date'][0].id
//         : '';
//     } else if (moduleType === 'forms' && moduleFilters['Created On']) {
//       firstFilterBy = 'Created On';
//       defaultAttribute = Array.isArray(moduleFilters['Created On']) && moduleFilters['Created On'][0]?.id
//         ? moduleFilters['Created On'][0].id
//         : '';
//     } else {
//       // fallback to first available filter
//       firstFilterBy = Object.keys(moduleFilters)[0];
//       defaultAttribute = Array.isArray(moduleFilters[firstFilterBy]) && moduleFilters[firstFilterBy][0]?.id
//         ? moduleFilters[firstFilterBy][0].id
//         : '';
//     }
//     setFilters([{
//       filterBy: firstFilterBy,
//       attribute: defaultAttribute,
//       isMandatory: true,
//     }]);
//   }
// }, [moduleFilters, moduleType]);


//   useEffect(() => {
//     const fetchModuleFilters = async () => {
//       try {
//         setFiltersLoading(true);

//         const filterMap = {
//           issues: 'issue-filters',
//           forms: 'form-filters',
//           reviews: 'review-filters',
//         };

//         const filterEndpoint = filterMap[moduleType];


//         const res = await fetch(`${getBackendUrl()}/api/autodesk/${projectId}/${filterEndpoint}`, {
//           method: 'GET',
//           credentials: 'include', // ✅ Include cookies for authentication
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         });
//         if (!res.ok) throw new Error(`Failed to fetch filters: ${res.status}`);

//         const data = await res.json();
//         console.log(`Fetched filters for module "${moduleType}":`, data.data);

//         setModuleFilters(data?.data || []);
//       } catch (error) {
//         console.error('Error fetching module-specific filters:', error);
//       } finally {
//         setFiltersLoading(false);
//       }
//     };

//     if (projectId && moduleType) {
//       fetchModuleFilters(); // runs only once if both values are set
//     }
//   }, [projectId, moduleType]);
//   console.log(getBackendUrl())

//   console.log(moduleFilters)

//   // Handlers for WorkflowFilter component
//   const handleFilterChange = (index, field, value) => {
//     setFilters((prev) => prev.map((f, i) => (i === index ? { ...f, [field]: value } : f)));
//   };

//   const addFilter = () => {
//   if (!moduleFilters) return;
//   const filterOptions = Object.keys(moduleFilters);

//   // Exclude the mandatory filter from available options
//   const usedFilters = filters.map(f => f.filterBy);
//   const mandatoryFilter = filters[0]?.filterBy;
//   const remainingOptions = filterOptions.filter(opt => !usedFilters.includes(opt) && opt !== mandatoryFilter);

//   if (remainingOptions.length > 0) {
//     const nextFilterBy = remainingOptions[0];
//     const newFilter = {
//       filterBy: nextFilterBy,
//       attribute: '',
//       isMandatory: false,
//     };
//     setFilters(prev => [...prev, newFilter]);
//   }
// };



//   const handleDeleteFilter = (index) => {
//   if (index === 0) return; // Prevent deleting the mandatory filter
//   setFilters((prev) => prev.filter((_, i) => i !== index));
// };

//   const resetFilters = () => {
//   if (!moduleFilters) return;
//   const mandatoryFilter = filters[0]?.filterBy;
//   const defaultAttribute = Array.isArray(moduleFilters[mandatoryFilter]) && moduleFilters[mandatoryFilter][0]?.id
//     ? moduleFilters[mandatoryFilter][0].id
//     : '';
//   setFilters([{
//     filterBy: mandatoryFilter,
//     attribute: defaultAttribute,
//     isMandatory: true,
//   }]);
// };

//   // Handler for WorkflowSchedule component
//   const toggleDay = (dayKey) => {
//     setSelectedDays((prev) =>
//       prev.includes(dayKey) ? prev.filter((d) => d !== dayKey) : [...prev, dayKey]
//     );
//   };

//   const resetDays = () =>{
//     setSelectedDays(['mon', 'tue', 'wed', 'thu', 'fri']);
//   }

//   // Handler for the "Cancel" button
//   const handleCancel = () => {
//     navigate(-1); // Go back to the previous page
//   };

//   // Handler for the "Save as new template" button
//   const handleSave = async () => {
//     // Prepare the payload from all current states

//     const payload = {
//         workflow_name: title, // Renamed from workflowName
//         project_id: projectId, // Renamed from projectId
//         module: moduleType, // Renamed from moduleType
//         channels: [ // Changed structure to an array of strings
//           ...(isEmailSelected ? ['email'] : []),
//           ...(isWhatsAppSelected ? ['whatsapp'] : [])
//         ],
//         // Note: The 'filters' structure here remains as per your current React state.
//         // Your sample payload had a different, more nested structure for filters.
//         // If your backend strictly requires the sample's filter format,
//         // additional transformation logic would be needed here.
//         filters: filters, // Keeping current filter structure from React state
//         schedule: {
//           frequency: selectedDays
//         },
//         created_by: user.autodeskId, // Assuming user context is available
//       };

//     console.log(payload)

//     try {
//       const response = await fetch(`${getBackendUrl()}/api/workflows/`, {
//         credentials: 'include',
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(payload),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
//       }

//       const result = await response.json();
//       console.log('Workflow saved successfully:', result);
//       // Navigate back to the previous page after successful save
//       navigate(-1);

//     } catch (err) {
//       console.error("Error saving workflow:", err);
//       // Display an error message to the user, e.g., using a state variable for a notification
//       alert(`Failed to save workflow: ${err.message}`); // Using alert for simplicity, replace with custom modal
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <p className="text-lg text-gray-700">Loading configuration data...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <p className="text-lg text-red-600">{error}</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 font-inter"> {/* Added font-inter class */}
//       <WorkflowHeader />

//       {/* Main Content Area - Centered and with generous padding */}
//       <div className="max-w-7xl mx-auto px-6 py-8">
//         {/* Page Header */}
//         <div className="flex items-center justify-between mb-8">
//           <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
//             Configure {moduleType ? moduleType.charAt(0).toUpperCase() + moduleType.slice(1) : ''} Notification Workflow
//           </h1>
//           <div className="flex gap-3">
//             <button
//               onClick={handleCancel}
//               className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-md transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleSave}
//               className="inline-flex items-center bg-black border border-black text-white px-4 py-2 text-sm font-medium rounded-md shadow hover:bg-gray-800 transition ease-in-out duration-300"
//             >
//               Save as new template
//             </button>
//           </div>
//         </div>

//         {/* Workflow Details Section */}
//         <div className="bg-white p-6 rounded-lg shadow-md mb-8">
//           <h2 className="text-xl font-semibold text-gray-800 mb-4">Notification Details</h2>
//           <NotificationDetails
//             title={title}
//             setTitle={setTitle}
//           />
//         </div>

//         {/* Notification Channels Section */}
//         <div className="bg-white p-6 rounded-lg shadow-md mb-8">
//           <h2 className="text-xl font-semibold text-gray-800 mb-3">Notification Channels</h2>
//           <NotificationChannels
//             isWhatsAppSelected={isWhatsAppSelected}
//             setIsWhatsAppSelected={setIsWhatsAppSelected}
//             isEmailSelected={isEmailSelected}
//             setIsEmailSelected={setIsEmailSelected}
//           />
//         </div>

//         <div className="lg:grid-cols-[1fr_auto] grid gap-8">
//         {/* Filters Section */}
//         <div className="bg-white p-6 rounded-lg shadow-md overflow-y-auto max-h-[80vh]">
//           <h2 className="text-xl font-semibold text-gray-800 mb-4">Workflow Filters</h2>
//           <WorkflowFilter
//             filters={filters}
//             moduleFilters={moduleFilters}
//             handleFilterChange={handleFilterChange}
//             addFilter={addFilter}
//             handleDeleteFilter={handleDeleteFilter}
//             resetFilters={resetFilters}
//           />
//         </div>

//         {/* Schedule Section */}
//         <div className="bg-white p-6 rounded-lg shadow-md max-h-[80vh] flex-shrink-0 self-start">
//           <h2 className="text-xl font-semibold text-gray-800 mb-4">Workflow Schedule</h2>
//           <NotifcationSchedule selectedDays={selectedDays} toggleDay={toggleDay} resetDays={resetDays} />
//         </div>
//       </div>
//       </div>
//     </div>
//   );
// };

// export default NotificationConfig;


// src/pages/WorkflowConfig.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import {
  NotificationHeader,
  NotificationDetails, // Renamed from WorkflowDetails as per your JSX usage
  NotificationChannels,
  NotificationFilter,
  NotificationSchedule, // Keep this name for now, but its internal logic will change
} from '../components/notificationWorkflow';
import { getBackendUrl } from '../utils/urlUtils';

const NotificationConfig = () => {
  const { projectId, moduleType } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('New Workflow Configuration');
  const [filters, setFilters] = useState([]);
  const [isWhatsAppSelected, setIsWhatsAppSelected] = useState(false);
  const [isEmailSelected, setIsEmailSelected] = useState(false);

  // New state for the schedule: number of days due
  const [daysDue, setDaysDue] = useState(1); // Default to 7 days

  const [moduleFilters, setModuleFilters] = useState(null);
  const [filtersLoading, setFiltersLoading] = useState(false);
  const [loading, setLoading] = useState(true); // For initial module filter fetch
  const [error, setError] = useState(null); // State to handle fetch errors
  const { user } = useAuth();

  useEffect(() => {
    setTitle('New Workflow Configuration');
  }, [projectId, moduleType]);

  // Fetch module-specific filters
  useEffect(() => {
    const fetchModuleFilters = async () => {
      try {
        setFiltersLoading(true);
        setLoading(true); // Set loading for the entire config page

        const filterMap = {
          issues: 'issue-filters',
          forms: 'form-filters',
          reviews: 'review-filters',
        };

        const filterEndpoint = filterMap[moduleType];

        const res = await fetch(`${getBackendUrl()}/api/autodesk/${projectId}/${filterEndpoint}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) throw new Error(`Failed to fetch filters: ${res.status}`);

        const data = await res.json();
        console.log(`Fetched filters for module "${moduleType}":`, data.data);

        setModuleFilters(data?.data || null); // Ensure it's null if no data
      } catch (error) {
        console.error('Error fetching module-specific filters:', error);
        setError("Failed to load workflow filters. Please try again.");
      } finally {
        setFiltersLoading(false);
        setLoading(false); // End loading for the entire config page
      }
    };

    if (projectId && moduleType) {
      fetchModuleFilters();
    }
  }, [projectId, moduleType]);

  // Set initial mandatory filter based on moduleType and fetched moduleFilters
  useEffect(() => {
    if (moduleFilters && filters.length === 0) {
      let firstFilterBy = null;
      let defaultAttribute = '';

      if (moduleType === 'issues' && moduleFilters['Due Date']) {
        firstFilterBy = 'Due Date';
        defaultAttribute = Array.isArray(moduleFilters['Due Date']) && moduleFilters['Due Date'][0]?.id
          ? moduleFilters['Due Date'][0].id
          : '';
      } else if (moduleType === 'reviews' && moduleFilters['Next Step Due Date']) {
        firstFilterBy = 'Next Step Due Date';
        defaultAttribute = Array.isArray(moduleFilters['Next Step Due Date']) && moduleFilters['Next Step Due Date'][0]?.id
          ? moduleFilters['Next Step Due Date'][0].id
          : '';
      } else if (moduleType === 'forms' && moduleFilters['Created On']) {
        firstFilterBy = 'Created On';
        defaultAttribute = Array.isArray(moduleFilters['Created On']) && moduleFilters['Created On'][0]?.id
          ? moduleFilters['Created On'][0].id
          : '';
      } else if (Object.keys(moduleFilters).length > 0) {
        // Fallback to first available filter if module-specific one not found or empty
        firstFilterBy = Object.keys(moduleFilters)[0];
        defaultAttribute = Array.isArray(moduleFilters[firstFilterBy]) && moduleFilters[firstFilterBy][0]?.id
          ? moduleFilters[firstFilterBy][0].id
          : '';
      }

      if (firstFilterBy) {
        setFilters([{
          filterBy: firstFilterBy,
          attribute: defaultAttribute,
          isMandatory: true,
        }]);
      }
    }
  }, [moduleFilters, moduleType, filters.length]); // Add filters.length to dependency array to prevent re-initialization

  // Handlers for WorkflowFilter component
  const handleFilterChange = (index, field, value) => {
    setFilters((prev) => prev.map((f, i) => (i === index ? { ...f, [field]: value } : f)));
  };

  const addFilter = () => {
    if (!moduleFilters) return;
    const filterOptions = Object.keys(moduleFilters);

    const usedFilters = filters.map(f => f.filterBy);
    const mandatoryFilter = filters[0]?.filterBy;
    const remainingOptions = filterOptions.filter(opt => !usedFilters.includes(opt) && opt !== mandatoryFilter);

    if (remainingOptions.length > 0) {
      const nextFilterBy = remainingOptions[0];
      const newFilter = {
        filterBy: nextFilterBy,
        attribute: '',
        isMandatory: false,
      };
      setFilters(prev => [...prev, newFilter]);
    }
  };

  const handleDeleteFilter = (index) => {
    if (index === 0) return; // Prevent deleting the mandatory filter
    setFilters((prev) => prev.filter((_, i) => i !== index));
  };

  const resetFilters = () => {
    if (!moduleFilters || filters.length === 0) return;
    const mandatoryFilter = filters[0]?.filterBy;
    const defaultAttribute = Array.isArray(moduleFilters[mandatoryFilter]) && moduleFilters[mandatoryFilter][0]?.id
      ? moduleFilters[mandatoryFilter][0].id
      : '';
    setFilters([{
      filterBy: mandatoryFilter,
      attribute: defaultAttribute,
      isMandatory: true,
    }]);
  };

  // Handler for the "Cancel" button
  const handleCancel = () => {
    navigate(-1); // Go back to the previous page
  };

  // Handler for the "Save as new template" button
  const handleSave = async () => {
    const payload = {
      workflow_name: title,
      project_id: projectId,
      module: moduleType,
      channels: [
        ...(isEmailSelected ? ['email'] : []),
        ...(isWhatsAppSelected ? ['whatsapp'] : [])
      ],
      filters: filters,
      schedule: {
        days_due: daysDue // Changed to days_due
      },
      created_by: user.autodeskId,
    };

    console.log("Saving workflow with payload:", payload);

    try {
      const response = await fetch(`${getBackendUrl()}/api/workflows/`, {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Workflow saved successfully:', result);
      navigate(-1);

    } catch (err) {
      console.error("Error saving workflow:", err);
      alert(`Failed to save workflow: ${err.message}`);
    }
  };

  if (loading || filtersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-gray-700">Loading configuration data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      <NotificationHeader />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Configure {moduleType ? moduleType.charAt(0).toUpperCase() + moduleType.slice(1) : ''} Notification Workflow
          </h1>
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center bg-black border border-black text-white px-4 py-2 text-sm font-medium rounded-md shadow hover:bg-gray-800 transition ease-in-out duration-300"
            >
              Save as new template
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Notification Details Section */}
          <div className="bg-white p-6 rounded-md shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Notification Details</h2>
            <NotificationDetails
              title={title}
              setTitle={setTitle}
            />
          </div>

          {/* Notification Channels Section */}
          <div className="bg-white p-6 rounded-md shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Notification Channels</h2>
            <NotificationChannels
              isWhatsAppSelected={isWhatsAppSelected}
              setIsWhatsAppSelected={setIsWhatsAppSelected}
              isEmailSelected={isEmailSelected}
              setIsEmailSelected={setIsEmailSelected}
            />
          </div>
        </div>

        <div className="lg:grid-cols-[2fr_1fr] grid gap-8">
          {/* Filters Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm overflow-y-auto max-h-auto">
            <h2 className="text-xl font-semibold text-gray-800">Workflow Filters</h2>
            <NotificationFilter
              filters={filters}
              moduleFilters={moduleFilters}
              handleFilterChange={handleFilterChange}
              addFilter={addFilter}
              handleDeleteFilter={handleDeleteFilter}
              resetFilters={resetFilters}
            />
          </div>

          {/* Schedule Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm max-h-auto flex-shrink-0 self-start">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Workflow Schedule</h2>
            <NotificationSchedule
              daysDue={daysDue}
              setDaysDue={setDaysDue}
              moduleType={moduleType} // Pass moduleType to customize options
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationConfig;