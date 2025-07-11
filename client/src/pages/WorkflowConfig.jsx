// src/pages/WorkflowConfig.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useParams and useNavigate
import { useAuth } from '../context/authContext'; // Importing auth context for user data
import {
  WorkflowHeader,
  WorkflowDetails,
  NotificationChannels,
  WorkflowFilter,
  WorkflowSchedule,
} from '../components/workflow';
import { getBackendUrl } from '../utils/urlUtils';

const WorkflowConfig = () => {
  // Extract projectId and moduleType from the URL
  const { projectId, moduleType } = useParams();
  const navigate = useNavigate(); // Initialize useNavigate hook for navigation

  const [title, setTitle] = useState('Issues on sheets'); // Default title, can be dynamic
  // saveOption state is not directly used in the UI for this task, but kept for consistency
  const [saveOption, setSaveOption] = useState('new-file');
  const [filters, setFilters] = useState([]);
  const [selectedDays, setSelectedDays] = useState(['mon', 'tue', 'wed', 'thu', 'fri']);
  const [isWhatsAppSelected, setIsWhatsAppSelected] = useState(false);
  const [isEmailSelected, setIsEmailSelected] = useState(false);

  // States for WorkflowDetails component's search and selection
  const [searchUser, setSearchUser] = useState('');
  const [searchCompany, setSearchCompany] = useState('');
  const [isUserActive, setIsUserActive] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]); // Stores selected user objects
  const [selectedCompanies, setSelectedCompanies] = useState([]); // Stores selected company objects
  const [isCompanyActive, setIsCompanyActive] = useState(false);

  // States for fetching dropdown data
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // State to handle fetch errors
  const [moduleFilters, setModuleFilters] = useState(null);
  const [filtersLoading, setFiltersLoading] = useState(false);
  const { user } = useAuth();

  // Optional: Set initial title based on moduleType, or fetch project details
  useEffect(() => {
    // You can use projectId to fetch actual project details (e.g., project name)
    // and moduleType to tailor the workflow configuration.
    setTitle('New Workflow Configuration');
  }, [projectId, moduleType]); // Re-run when projectId or moduleType changes

  // Fetch users and companies data for dropdowns
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        setLoading(true);
        setError(null); // Clear previous errors

        const [usersRes, companiesRes] = await Promise.all([
          fetch(`${getBackendUrl()}/api/autodesk/${projectId}/users`),
          fetch(`${getBackendUrl()}/api/autodesk/${projectId}/company`)
        ]);

        if (!usersRes.ok) throw new Error(`HTTP error! status: ${usersRes.status} for users`);
        if (!companiesRes.ok) throw new Error(`HTTP error! status: ${companiesRes.status} for companies`);

        const usersData = await usersRes.json();
        console.log(usersData)
        const companiesData = await companiesRes.json();
        console.log(companiesData)

        setUsers(usersData.data || []);
        setCompanies(companiesData.data || []);
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
        setError("Failed to load user and company data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) { // Only fetch if projectId is available
      fetchDropdownData();
    }
  }, [projectId]); // Dependency on projectId to refetch if it changes

  useEffect(() => {
  if (moduleFilters && filters.length === 0) {
    const filterOptions = Object.keys(moduleFilters);
    const singleSelectFilters = ['Created On', 'Due Date', 'Status'];
    const firstFilter = filterOptions[0];

    setFilters([{
      filterBy: firstFilter,
      attribute: singleSelectFilters.includes(firstFilter) ? '' : [],
    }]);
  }
}, [moduleFilters]);


  useEffect(() => {
    const fetchModuleFilters = async () => {
      try {
        setFiltersLoading(true);

        const filterMap = {
          issues: 'issue-filters',
          forms: 'form-filters',
          reviews: 'review-filters',
        };

        const filterEndpoint = filterMap[moduleType];


        const res = await fetch(`${getBackendUrl()}/api/autodesk/${projectId}/${filterEndpoint}`, {
          method: 'GET',
          credentials: 'include', // ✅ Include cookies for authentication
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) throw new Error(`Failed to fetch filters: ${res.status}`);

        const data = await res.json();
        console.log(`Fetched filters for module "${moduleType}":`, data);

        setModuleFilters(data?.data || []);
      } catch (error) {
        console.error('Error fetching module-specific filters:', error);
      } finally {
        setFiltersLoading(false);
      }
    };

    if (projectId && moduleType) {
      fetchModuleFilters(); // runs only once if both values are set
    }
  }, [projectId, moduleType]);

  console.log(moduleFilters)

  const singleSelectFilters = ['Created On', 'Due Date', 'Status'];


  // Handlers for WorkflowFilter component
  const handleFilterChange = (index, field, value) => {
    setFilters((prev) => prev.map((f, i) => (i === index ? { ...f, [field]: value } : f)));
  };

  const addFilter = () => {
  if (!moduleFilters) return; // Prevent errors if filters haven't loaded yet

  const filterOptions = Object.keys(moduleFilters);
  const singleSelectFilters = ['Created On', 'Due Date', 'Status'];

  const remainingOptions = filterOptions.filter(
    (opt) => !filters.some((f) => f.filterBy === opt)
  );

  if (remainingOptions.length > 0) {
    const nextFilterBy = remainingOptions[0];
    const newFilter = {
      filterBy: nextFilterBy,
      attribute: singleSelectFilters.includes(nextFilterBy) ? '' : [],
    };
    setFilters((prev) => [...prev, newFilter]);
  }
};



  const handleDeleteFilter = (index) => {
    setFilters((prev) => prev.filter((_, i) => i !== index));
  };

  const resetFilters = () => {
  if (!moduleFilters) return;
  const firstFilter = Object.keys(moduleFilters)[0];
  setFilters([{
    filterBy: firstFilter,
    attribute: singleSelectFilters.includes(firstFilter) ? '' : [],
  }]);
};

  // Handler for WorkflowSchedule component
  const toggleDay = (dayKey) => {
    setSelectedDays((prev) =>
      prev.includes(dayKey) ? prev.filter((d) => d !== dayKey) : [...prev, dayKey]
    );
  };

  // Handler for the "Cancel" button
  const handleCancel = () => {
    navigate(-1); // Go back to the previous page
  };

  // Handler for the "Save as new template" button
  const handleSave = async () => {
    // Prepare the payload from all current states

    const payload = {
        workflow_name: title, // Renamed from workflowName
        project_id: projectId, // Renamed from projectId
        module: moduleType, // Renamed from moduleType
        channels: [ // Changed structure to an array of strings
          ...(isEmailSelected ? ['email'] : []),
          ...(isWhatsAppSelected ? ['whatsapp'] : [])
        ],
        escalate_to: { // Renamed from recipients, and added roles
          users: selectedUsers.map(user => ({
            autodeskId: user.autodeskId,
            email: user.email
        })),
          company: selectedCompanies.map(selectedCompany => selectedCompany)
        },
        // Note: The 'filters' structure here remains as per your current React state.
        // Your sample payload had a different, more nested structure for filters.
        // If your backend strictly requires the sample's filter format,
        // additional transformation logic would be needed here.
        filters: filters, // Keeping current filter structure from React state
        schedule: {
          frequency: selectedDays
        },
        created_by: user.autodeskId, // Assuming user context is available
      };

    console.log(payload)

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
      // Navigate back to the previous page after successful save
      navigate(-1);

    } catch (err) {
      console.error("Error saving workflow:", err);
      // Display an error message to the user, e.g., using a state variable for a notification
      alert(`Failed to save workflow: ${err.message}`); // Using alert for simplicity, replace with custom modal
    }
  };

  if (loading) {
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
    <div className="min-h-screen bg-gray-50 font-inter"> {/* Added font-inter class */}
      <WorkflowHeader />

      {/* Main Content Area - Centered and with generous padding */}
      <div className="max-w-7xl mx-auto px-6 py-8"> {/* Increased vertical padding */}
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Configure {moduleType ? moduleType.charAt(0).toUpperCase() + moduleType.slice(1) : ''} Workflow
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

        {/* Workflow Details Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Workflow Details</h2>
          <WorkflowDetails
            title={title}
            setTitle={setTitle}
            isUserActive={isUserActive}
            setIsUserActive={setIsUserActive}
            searchUser={searchUser}
            setSearchUser={setSearchUser}
            isCompanyActive={isCompanyActive}
            setIsCompanyActive={setIsCompanyActive}
            searchCompany={searchCompany}
            setSearchCompany={setSearchCompany}
            users={users}
            companies={companies}
            selectedUsers={selectedUsers}
            setSelectedUsers={setSelectedUsers}
            selectedCompanies={selectedCompanies}
            setSelectedCompanies={setSelectedCompanies}
          />
        </div>

        {/* Notification Channels Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Notification Channels</h2>
          <NotificationChannels
            isWhatsAppSelected={isWhatsAppSelected}
            setIsWhatsAppSelected={setIsWhatsAppSelected}
            isEmailSelected={isEmailSelected}
            setIsEmailSelected={setIsEmailSelected}
          />
        </div>

        {/* Filters and Schedule Section - Now below the above modules */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Filters Column */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Workflow Filters</h2>
            <WorkflowFilter
              filters={filters}
              moduleFilters={moduleFilters}
              handleFilterChange={handleFilterChange}
              addFilter={addFilter}
              handleDeleteFilter={handleDeleteFilter}
              resetFilters={resetFilters}
            />
          </div>

          {/* Schedule Column */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Workflow Schedule</h2>
            <WorkflowSchedule selectedDays={selectedDays} toggleDay={toggleDay} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowConfig;
