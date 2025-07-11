// components/dashboard/WorkflowDropdown.jsx
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Keep useNavigate

const WorkflowDropdown = ({ workflowDropdownRef, navigate, selectedProjectId, selectedProjectName }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (workflowDropdownRef.current && !workflowDropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen, workflowDropdownRef]);

  return (
    <div className="relative hover:text-white" ref={workflowDropdownRef}>
      <button
        className="inline-flex items-center bg-primary border border-primary text-black px-4 py-2 text-sm font-medium rounded-full shadow hover:bg-black hover:text-white transition ease-in-out duration-300"
        onClick={() => setIsDropdownOpen((open) => !open)}
        type="button"
        title="Create New Workflow"
      >
        <Plus className="w-4 h-4 mr-1" /> Create
      </button>
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <button
            className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 text-sm rounded-t-lg transition-colors"
            onClick={() => {
              setIsDropdownOpen(false);
              // Check if a project is selected before navigating
              if (selectedProjectId) {
                navigate(`/workflows/${selectedProjectId}/issues/create-workflow`, { state: { projectId: selectedProjectId, projectName: selectedProjectName } });
              } else {
                alert('Please select a project first to create an Issues workflow.'); // You might replace this with a toast
              }
            }}
          >
            Create new Issues Workflow
          </button>
          <button
            className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 text-sm rounded-t-lg transition-colors"
            onClick={() => {
              setIsDropdownOpen(false);
              // Check if a project is selected before navigating
              if (selectedProjectId) {
                navigate(`/workflows/${selectedProjectId}/forms/create-workflow`, { state: { projectId: selectedProjectId, projectName: selectedProjectName } });
              } else {
                alert('Please select a project first to create an Forms workflow.'); // You might replace this with a toast
              }
            }}
          >
            Create new Forms Workflow
          </button>
          <button
            className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 text-sm rounded-t-lg transition-colors"
            onClick={() => {
              setIsDropdownOpen(false);
              // Check if a project is selected before navigating
              if (selectedProjectId) {
                navigate(`/workflows/${selectedProjectId}/reviews/create-workflow`, { state: { projectId: selectedProjectId, projectName: selectedProjectName } });
              } else {
                alert('Please select a project first to create an Reviews workflow.'); // You might replace this with a toast
              }
            }}
          >
            Create new Reviews Workflow
          </button>
        </div>
      )}
    </div>
  );
};

export default WorkflowDropdown;