import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Mail, MessageCircle, Edit, Trash2, MoreHorizontal, X, CirclePlay } from 'lucide-react';
import { getBackendUrl } from '../../utils/urlUtils';

// --- MoreOptionsButton Component (No changes needed here) ---
const MoreOptionsButton = ({onPlay, onEdit, onDelete, itemId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [isRunning, setIsRunning] = useState(false);

  const handlePlayNow = async () => {
  setIsOpen(false);
  setIsRunning(true);

  try {
    await onPlay?.(itemId);
  } finally {
    setIsRunning(false);
  }
};

  const handleEditClick = () => {
    setIsOpen(false);
    onEdit?.(itemId);
  };

  const handleDeleteClick = () => {
    setIsOpen(false);
    onDelete?.(itemId);
  };


  return (
    <div className="relative">
      <button
      type="button"
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-400 hover:text-gray-600 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
        title="More options"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[120px] origin-top-right animate-fade-in"
          style={{ transformOrigin: 'top right' }} // For proper animation origin
          
        >
          <button
          type="button"
            onClick={handlePlayNow}
            disabled={isRunning}
            className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 rounded-b-md transition-colors ${
              isRunning ? 'opacity-50 cursor-wait' : ''
            }`}
          >
            {isRunning ? (
              <svg className="animate-spin h-4 w-4 text-gray-600" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="4" fill="none"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
            ) : (
              <CirclePlay className="w-4 h-4" />
            )}
            Run Now
          </button>

          <button
          type="button"
            onClick={handleEditClick}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-t-md transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
          type="button"
            onClick={handleDeleteClick}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-b-md transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

// --- WorkflowRow Component (APPLIED WHITESPACE FIX) ---
const WorkflowRow = ({ workflow, onEditWorkflow, onDeleteWorkflow, onUpdateWorkflowStatus }) => {
  console.log("Workflow prop in WorkflowRow:", workflow); // ADD THIS LOG to verify incoming data

  const [isActive, setIsActive] = useState(workflow.status === 'active');

  useEffect(() => {
    setIsActive(workflow.status === 'active');
  }, [workflow.status]);

  const toggleStatus = () => {
    const newStatus = isActive ? 'paused' : 'active'; // Status should be 'paused' or 'active'
    setIsActive(!isActive);
    onUpdateWorkflowStatus(workflow.workflow_id, { status: newStatus }); // Pass object with status
  };

  const getDayDisplayChar = (dayKey) => {
    // This function is fine as it correctly maps the *stored* keys to display chars
    const dayMap = {
      'mon': 'M', 'tue': 'T', 'wed': 'W', 'thu': 'T', 'fri': 'F', 'sat': 'S', 'sun': 'S'
    };
    return dayMap[dayKey] || '';
  };

  // Define the array of standard day keys that match your database enum
  const standardDayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  const handleRunNow = async (workflowId) => {
  try {
    // Get current protocol + host dynamically
    const { protocol, host } = window.location;
    const apiBaseURL = `${protocol}//${host}`;

    // Build the escalation API URL
    const escalationURL = `${getBackendUrl()}/api/escalation/workflows/${workflowId}/escalate`;
    console.log("Escalation API URL:", escalationURL);

    // Show loading state
    alert("Running escalation...");

    const response = await fetch(escalationURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (response.ok) {
      console.log("Escalation success:", result);
      alert("Escalation sent successfully to users/companies!");
    } else {
      console.error("Escalation failed:", result);
      alert(`Failed to escalate: ${result.message || "Unknown error"}`);
    }
  } catch (error) {
    console.error("Error running escalation:", error);
    alert("An error occurred while running escalation.");
  }
};

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 text-sm text-gray-900 hidden md:table-cell">
        {workflow.display_id?.toString()} {/* Use optional chaining for safety */}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="font-medium text-gray-900">{workflow.workflow_name}</div>
        </div>
      </td>
      <td className="px-6 py-4 hidden lg:table-cell">
        <div className="flex items-center space-x-2">
          {workflow.channels?.map((channel, index) => ( // Use optional chaining for safety
            <div key={`${channel}-${index}`} className="text-gray-700" title={channel}>
              {channel === 'email' && <Mail className="w-5 h-5" />}
              {channel === 'whatsapp' && <MessageCircle className="w-5 h-5" />}
            </div>
          ))}
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900 hidden lg:table-cell">
        {workflow.module?.charAt(0).toUpperCase() + workflow.module?.slice(1).toLowerCase()}
      </td>
      <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell relative">
        <div className="flex items-center space-x-0.5">
          {/* FIX HERE: Iterate over the standard day keys */}
          {standardDayKeys.map((dayKey) => { // Changed 'key' to 'dayKey' for clarity with the map
            // Now, workflow.frequency.includes(dayKey) will correctly check for 'mon', 'tue', etc.
            const isSelected = workflow.frequency?.includes(dayKey); // Use optional chaining for safety
            return (
              <span
                key={dayKey} // Use dayKey from the iteration
                className={`inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full ${
                  isSelected ? 'text-black' : 'text-gray-300'
                }`}
                title={isSelected ? `Runs on ${getDayDisplayChar(dayKey)}` : `Does not run on ${getDayDisplayChar(dayKey)}`}
              >
                {getDayDisplayChar(dayKey)} {/* Pass the correct dayKey to get its display char */}
              </span>
            );
          })}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-2">
          <button
          type="button"
            onClick={toggleStatus}
            className={`p-2 rounded-full transition-colors ${
              isActive
                ? 'bg-green-100 text-green-600 cursor-default'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
            disabled={isActive}
            title="Activate Workflow" // Changed title for clarity
          >
            <Play className="w-4 h-4" />
          </button>
          <button
          type="button"
            onClick={toggleStatus}
            className={`p-2 rounded-full transition-colors ${
              !isActive
                ? 'bg-red-100 text-red-600 cursor-default'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
            disabled={!isActive}
            title="Pause Workflow"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </td>
      <td className="absolute px-6 py-4 text-right">
        <MoreOptionsButton
          itemId={workflow.workflow_id}
          onPlay={handleRunNow}
          onEdit={onEditWorkflow}
          onDelete={onDeleteWorkflow}
        />
      </td>
    </tr>
  );
};

export default WorkflowRow;