import React, { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';

const WorkflowDropdown = ({
  workflowDropdownRef,
  navigate,
  selectedProjectId,
  selectedProjectName,
  activeTab,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Close dropdown on outside click
  const localRef = useRef(null);
  const containerRef = workflowDropdownRef || localRef;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [containerRef]);

  const handleNavigate = (pathSuffix) => {
    setIsDropdownOpen(false);
    if (selectedProjectId) {
      navigate(pathSuffix, {
        state: { projectId: selectedProjectId, projectName: selectedProjectName },
      });
    } else {
      alert('Please select a project first.'); // Replace with toast if needed
    }
  };

  return (
    <div className="relative hover:text-white"
    ref={containerRef}>
      <button
        type="button"
        className="inline-flex items-center bg-primary border border-primary text-black px-4 py-2 text-sm font-medium rounded-full shadow hover:bg-black hover:text-white transition ease-in-out duration-300"
        onClick={() => setIsDropdownOpen((open) => !open)}
        title="Create New Workflow"
      >
        <Plus className="w-4 h-4 mr-1" /> Create
      </button>


      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-md z-50">
          {activeTab === "Escalations" && (
            <>
              <button
                type="button"
                className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 text-sm rounded-t-lg transition-colors"
                onClick={() => handleNavigate(`/workflows/${selectedProjectId}/issues/create-workflow`)}
              >
                Issues Escalation
              </button>
              <button
                type="button"
                className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 text-sm transition-colors"
                onClick={() => handleNavigate(`/workflows/${selectedProjectId}/forms/create-workflow`)}
              >
                Forms Escalation
              </button>
              <button
                type="button"
                className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 text-sm rounded-b-lg transition-colors"
                onClick={() => handleNavigate(`/workflows/${selectedProjectId}/reviews/create-workflow`)}
              >
                Reviews Escalation
              </button>
            </>
          )}

          {activeTab === "Notifications" && (
            <>
              <button
                type="button"
                className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 text-sm rounded-t-lg transition-colors"
                onClick={() => handleNavigate(`/workflows/${selectedProjectId}/issues/create-notification`)}
              >
                Issues Notification
              </button>
              <button
                type="button"
                className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 text-sm transition-colors"
                onClick={() => handleNavigate(`/workflows/${selectedProjectId}/forms/create-notification`)}
              >
                Forms Notification
              </button>
              <button
                type="button"
                className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 text-sm rounded-b-lg transition-colors"
                onClick={() => handleNavigate(`/workflows/${selectedProjectId}/reviews/create-notification`)}
              >
                Reviews Notification
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkflowDropdown;
