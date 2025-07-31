import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { BarLoader } from 'react-spinners';

import {
  WorkflowHeader,
  WorkflowTitle,
  WorkflowEscalateTo,
  NotificationChannels,
  WorkflowFilter, // This component handles the issues/forms/reviews specific filters
  WorkflowSchedule,
} from '../components/workflow';
import { getBackendUrl } from '../utils/urlUtils';

const WorkflowConfig = () => {
  const { projectId, moduleType, workflow_id } = useParams(); // Get workflow_id
  const navigate = useNavigate();
  const { user } = useAuth(); // Assuming user context provides autodeskId

  // State to hold the workflow data when editing
  const [editingWorkflowData, setEditingWorkflowData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false); // New state to indicate edit mode

  // Form states, initialized with defaults or empty values
  const [title, setTitle] = useState(''); // Workflow Name
  const [filters, setFilters] = useState([]); // Module-specific filters
  const [selectedDays, setSelectedDays] = useState(['mon', 'tue', 'wed', 'thu', 'fri']); // Schedule frequency
  const [isWhatsAppSelected, setIsWhatsAppSelected] = useState(false); // Channels
  const [isEmailSelected, setIsEmailSelected] = useState(false);

  // States for Escalation ( component)
  const [searchUser, setSearchUser] = useState('');
  const [searchCompany, setSearchCompany] = useState('');
  const [searchRole, setSearchRole] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]); // Stores selected user objects {autodeskId, email, name, etc.}
  const [selectedCompanies, setSelectedCompanies] = useState([]); // Stores selected company objects {id, name}
  const [selectedRoles, setSelectedRoles] = useState([]); // Stores selected role strings (roleGroupIds)

  const [isUserActive, setIsUserActive] = useState(false);
  const [isCompanyActive, setIsCompanyActive] = useState(false);
  const [isRoleActive, setIsRoleActive] = useState(false);

  // States for fetching dropdown data (users, companies, roles, module filters)
  const [allUsers, setAllUsers] = useState([]); // Renamed to avoid conflict with selectedUsers
  const [allCompanies, setAllCompanies] = useState([]); // Renamed to avoid conflict with selectedCompanies
  const [allRoles, setAllRoles] = useState([]); // Renamed to avoid conflict with selectedRoles
  const [loading, setLoading] = useState(true); // Overall loading for initial data
  const [error, setError] = useState(null);
  const [moduleFilters, setModuleFilters] = useState(null);
  const [filtersLoading, setFiltersLoading] = useState(false);


  // 1. Effect to detect edit mode and fetch existing workflow data
  useEffect(() => {
    if (workflow_id) {
      setIsEditMode(true);
      const fetchExistingWorkflow = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(`${getBackendUrl()}/api/workflows/escalation-workflows/edit/${workflow_id}`, {
            method: 'GET',
            credentials: 'include',
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch existing workflow.');
          }
          const data = await response.json();
          console.log("Fetched existing workflow data:", data);
          setEditingWorkflowData(data); // Store the fetched data

          // Populate form states with fetched data
          setTitle(data.workflow_name || '');
          setSelectedDays(data.frequency || ['mon', 'tue', 'wed', 'thu', 'fri']);
          setIsWhatsAppSelected(data.channels?.includes('whatsapp') || false);
          setIsEmailSelected(data.channels?.includes('email') || false);

          // Populate filters
          setFilters(data.filters || []);
          console.log(data.filters);

          // Set active states based on whether escalation targets exist
          setIsUserActive(data.escalate_to?.users?.length > 0);
          setIsCompanyActive(data.escalate_to?.company?.length > 0);
          setIsRoleActive(data.escalate_to?.roles?.length > 0);

          // selectedRoles can be set directly as it expects IDs
          setSelectedRoles(data.escalate_to?.roles || []);

        } catch (err) {
          console.error("Error fetching existing workflow:", err);
          setError("Failed to load existing workflow details. " + err.message);
        } finally {
          // Do not set loading to false here, as dropdown data might still be loading
          // The combined loading state will be handled by the mapping useEffect
        }
      };
      fetchExistingWorkflow();
    } else {
      setIsEditMode(false);
      setLoading(false); // If not in edit mode, no initial fetch needed for workflow data
      setTitle('New Workflow Configuration'); // Set default title for new workflow
    }
  }, [workflow_id]); // Rerun when workflow_id changes

  // 2. Fetch all users, companies, roles data for dropdowns
  useEffect(() => {
    const fetchDropdownData = async () => {
      // Only set loading/error for dropdown data if not already loading for workflow_id
      if (!workflow_id) setLoading(true);
      setError(null);

      try {
        const [usersRes, companiesRes] = await Promise.all([
          fetch(`${getBackendUrl()}/api/autodesk/${projectId}/users`),
          fetch(`${getBackendUrl()}/api/autodesk/${projectId}/company`),
        ]);

        if (!usersRes.ok) throw new Error(`HTTP error! status: ${usersRes.status} for users`);
        if (!companiesRes.ok) throw new Error(`HTTP error! status: ${companiesRes.status} for companies`);

        const usersData = await usersRes.json();
        const companiesData = await companiesRes.json();

        const rolesData = usersData.data?.roles || []; // Assuming roles are nested within usersData

        setAllUsers(usersData.data?.users || []); // Assuming users are under a 'users' key
        setAllCompanies(companiesData.data || []);
        setAllRoles(rolesData || []);

      } catch (err) {
        console.error("Error fetching dropdown data:", err);
        setError("Failed to load user, company, and role data. Please try again.");
      } finally {
        // Only unset overall loading if not in workflow_id fetch, or if workflow_id fetch is done
        if (!workflow_id || (workflow_id && editingWorkflowData)) setLoading(false);
      }
    };

    if (projectId) {
      fetchDropdownData();
    }
  }, [projectId, workflow_id, editingWorkflowData]); // Added editingWorkflowData to re-evaluate loading state

  // 3. Effect to map fetched workflow data to selected states once all dropdown data is available
  useEffect(() => {
    if (isEditMode && editingWorkflowData && allUsers.length > 0 && allCompanies.length > 0) {
      console.log("Mapping fetched data to selected states...");

      // Map selected users: find full user objects from allUsers
      const mappedUsers = (editingWorkflowData.escalate_to?.users || [])
        .map(selectedUser =>
          allUsers.find(u => u.autodeskId === selectedUser.autodeskId)
        )
        .filter(Boolean); // Filter out any undefined/null if a user isn't found
      setSelectedUsers(mappedUsers);
      console.log("Mapped Users:", mappedUsers);

      // Map selected companies: find full company objects from allCompanies
      const mappedCompanies = (editingWorkflowData.escalate_to?.company || [])
        .map(selectedCompanyId => // Assuming selectedCompanyId is just the ID
          allCompanies.find(c => c.id === selectedCompanyId)
        )
        .filter(Boolean); // Filter out any undefined/null if a company isn't found
      setSelectedCompanies(mappedCompanies);
      console.log("Mapped Companies:", mappedCompanies);

      // Roles are already handled in the first useEffect, but ensure consistency
      setSelectedRoles(editingWorkflowData.escalate_to?.roles || []);
      console.log("Mapped Roles:", editingWorkflowData.escalate_to?.roles || []);

      setLoading(false); // All data is loaded and mapped, so set overall loading to false
    } else if (!isEditMode && !workflow_id) {
        setLoading(false); // Ensure loading is false if not in edit mode
    }
  }, [isEditMode, editingWorkflowData, allUsers, allCompanies, workflow_id]);


  // 4. Fetch module-specific filters (runs once projectId and moduleType are available)
  useEffect(() => {
    const fetchModuleFilters = async () => {
      setFiltersLoading(true);
      try {
        const filterMap = {
          issues: 'issue-filters',
          forms: 'form-filters',
          reviews: 'review-filters',
        };
        const filterEndpoint = filterMap[moduleType];

        const res = await fetch(`${getBackendUrl()}/api/autodesk/${projectId}/${filterEndpoint}?module=escalations`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) throw new Error(`Failed to fetch filters: ${res.status}`);

        const data = await res.json();
        console.log(`Fetched filters for module "${moduleType}":`, data.data);
        setModuleFilters(data?.data || {}); // Ensure it's an object

        // Initialize filters ONLY if in create mode (no workflow_id)
        if (!workflow_id) { // MODIFIED LINE: Changed condition here
          let firstFilterBy = null;
          let defaultAttribute = '';
          const currentModuleFilters = data?.data || {};

          if (moduleType === 'issues' && currentModuleFilters['Due Date']) {
            firstFilterBy = 'Due Date';
            defaultAttribute = Array.isArray(currentModuleFilters['Due Date']) && currentModuleFilters['Due Date'][0]?.id
              ? currentModuleFilters['Due Date'][0].id
              : '';
          } else if (moduleType === 'reviews' && currentModuleFilters['Next Step Due Date']) {
            firstFilterBy = 'Next Step Due Date';
            defaultAttribute = Array.isArray(currentModuleFilters['Next Step Due Date']) && currentModuleFilters['Next Step Due Date'][0]?.id
              ? currentModuleFilters['Next Step Due Date'][0].id
              : '';
          } else if (moduleType === 'forms' && currentModuleFilters['Created On']) {
            firstFilterBy = 'Created On';
            defaultAttribute = Array.isArray(currentModuleFilters['Created On']) && currentModuleFilters['Created On'][0]?.id
              ? currentModuleFilters['Created On'][0].id
              : '';
          } else if (Object.keys(currentModuleFilters).length > 0) {
            // fallback to first available filter if specific ones not found
            firstFilterBy = Object.keys(currentModuleFilters)[0];
            defaultAttribute = Array.isArray(currentModuleFilters[firstFilterBy]) && currentModuleFilters[firstFilterBy][0]?.id
              ? currentModuleFilters[firstFilterBy][0].id
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

      } catch (error) {
        console.error('Error fetching module-specific filters:', error);
        setError("Failed to load module filters. " + error.message);
      } finally {
        setFiltersLoading(false);
      }
    };

    if (projectId && moduleType) {
      fetchModuleFilters();
    }
  }, [projectId, moduleType, workflow_id, editingWorkflowData]); // Added workflow_id and editingWorkflowData to dependencies


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

  // Handler for WorkflowSchedule component
  const toggleDay = (dayKey) => {
    setSelectedDays((prev) =>
      prev.includes(dayKey) ? prev.filter((d) => d !== dayKey) : [...prev, dayKey]
    );
  };

  const resetDays = () => {
    setSelectedDays(['mon', 'tue', 'wed', 'thu', 'fri']);
  }

  // Handler for the "Cancel" button
  const handleCancel = () => {
    navigate(-1); // Go back to the previous page
  };

  // Handler for the "Save" or "Update" button
  const handleSave = async () => {
    const channels = [];
    if (isEmailSelected) channels.push('email');
    if (isWhatsAppSelected) channels.push('whatsapp');

    const payload = {
      workflow_name: title,
      project_id: projectId,
      module: moduleType,
      channels: channels,
      escalate_to: {
        users: selectedUsers.map(u => ({ autodeskId: u.autodeskId, email: u.email })),
        company: selectedCompanies.map(c => c.id), // Now selectedCompanies always contains objects, so map to ID
        roles: selectedRoles
      },
      filters: filters,
      frequency: selectedDays, // frequency is top-level in schema
      // created_by is only for creation, not update
    };

    // Add created_by only if in create mode
    if (!isEditMode) {
      payload.created_by = user.autodeskId;
    }

    console.log("Payload being sent:", payload);

    let apiUrl = '';
    let method = '';

    if (isEditMode) {
      apiUrl = `${getBackendUrl()}/api/workflows/escalation-workflows/${workflow_id}`;
      method = 'PATCH'; // Use PATCH for updates
    } else {
      apiUrl = `${getBackendUrl()}/api/workflows/escalation-workflows`;
      method = 'POST'; // Use POST for creation
    }

    try {
      const response = await fetch(apiUrl, {
        credentials: 'include',
        method: method,
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
      console.log('Workflow operation successful:', result);
      // Using alert for simplicity, replace with custom modal
      // IMPORTANT: Do NOT use alert() or confirm() in production code.
      // They block the UI and are not user-friendly in an iframe environment.
      // Use a custom modal component instead.
      alert(`Workflow ${isEditMode ? 'updated' : 'created'} successfully!`);
      navigate(-1); // Go back to the previous page (Dashboard)

    } catch (err) {
      console.error("Error saving workflow:", err);
      // Using alert for simplicity, replace with custom modal
      alert(`Failed to ${isEditMode ? 'update' : 'save'} workflow: ${err.message}`);
    }
  };

  // Show loading spinner if either initial workflow data or dropdown data is loading
  if (loading || filtersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <BarLoader color="#000000" />
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
      <WorkflowHeader />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            {isEditMode ? 'Edit' : 'Configure'} {moduleType ? moduleType.charAt(0).toUpperCase() + moduleType.slice(1) : ''} Workflow
          </h1>
        </div>

        <div className="lg:grid-cols-[2fr_1fr] grid gap-4 items-start mb-8">
          <div className="bg-white w-full p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800">Workflow Details</h2>
            <WorkflowTitle
              title={title}
              setTitle={setTitle}
            />
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Notification Channels
            </h2>
            <NotificationChannels
              isWhatsAppSelected={isWhatsAppSelected}
              setIsWhatsAppSelected={setIsWhatsAppSelected}
              isEmailSelected={isEmailSelected}
              setIsEmailSelected={setIsEmailSelected}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md overflow-y-auto max-h-[80vh] mb-8">
          <h2 className="text-xl font-semibold text-gray-800 ">Workflow Filters</h2>
          <WorkflowFilter
            filters={filters}
            moduleFilters={moduleFilters}
            handleFilterChange={handleFilterChange}
            addFilter={addFilter}
            handleDeleteFilter={handleDeleteFilter}
            resetFilters={resetFilters}
          />
        </div>

        <div className="lg:grid-cols-[2fr_1fr] mb-3 grid gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md overflow-visible">
            <h2 className="text-xl font-semibold text-gray-800 mb-8">Escalate To</h2>
            <WorkflowEscalateTo
              isUserActive={isUserActive}
              setIsUserActive={setIsUserActive}
              searchUser={searchUser}
              setSearchUser={setSearchUser}
              isCompanyActive={isCompanyActive}
              setIsCompanyActive={setIsCompanyActive}
              searchCompany={searchCompany}
              setSearchCompany={setSearchCompany}
              isRoleActive={isRoleActive}
              setIsRoleActive={setIsRoleActive}
              searchRole={searchRole}
              setSearchRole={setSearchRole}
              users={allUsers} // Pass the renamed state
              companies={allCompanies} // Pass the renamed state
              roles={allRoles} // Pass the renamed state
              selectedUsers={selectedUsers}
              setSelectedUsers={setSelectedUsers}
              selectedCompanies={selectedCompanies}
              setSelectedCompanies={setSelectedCompanies}
              selectedRoles={selectedRoles}
              setSelectedRoles={setSelectedRoles}
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md max-h-[80vh] flex-shrink-0 self-start">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Workflow Schedule</h2>
            <WorkflowSchedule selectedDays={selectedDays} toggleDay={toggleDay} resetDays={resetDays} />
          </div>
        </div>

        <div className="flex mt-8 justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={handleSave}
            className="inline-flex items-center bg-black border border-black text-white px-4 py-2 text-sm font-medium rounded-md shadow hover:bg-gray-800 transition ease-in-out duration-300"
          >
            {isEditMode ? 'Update Workflow' : 'Save as new template'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowConfig;