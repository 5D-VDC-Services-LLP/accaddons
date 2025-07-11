// src/components/dashboard/WorkflowTable.jsx
import React from 'react';
import WorkflowRow from './WorkflowRow'; // Path to the renamed WorkflowRow.jsx
import EditWorkflowModal from './EditWorkflowModal'; // Path to the newly created EditWorkflowModal.jsx
import ConfirmationModal from '../ConfirmationModal';
import { getBackendUrl } from '../../utils/urlUtils';
import { useState } from 'react';


const WorkflowTable = ({
  workflows,
  isLoading,
  error,
  onEditWorkflow,
  // onDeleteWorkflow, // This prop will now be handled internally
  onUpdateWorkflowStatus,
  isEditModalOpen,
  setIsEditModalOpen,
  editingWorkflow,
  handleSaveEditedWorkflow,
  // You might need a way to refetch workflows after delete from parent
  onWorkflowsUpdated // New prop for refetching or updating parent state
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [workflowToDelete, setWorkflowToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null); // State for delete errors

  // Function to open the delete confirmation modal
  const handleDeleteWorkflow = (workflowId) => {
    const workflow = workflows.find(w => w.workflow_id === workflowId);
    if (workflow) {
      setWorkflowToDelete(workflow);
      setIsDeleteModalOpen(true);
      setDeleteError(null); // Clear previous errors
    }
  };

  // Function to perform the actual deletion after confirmation
  const confirmDeleteWorkflow = async () => {
    if (!workflowToDelete) return;

    try {
      const response = await fetch(`${getBackendUrl()}/api/workflows/${workflowToDelete.workflow_id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      console.log(`Workflow ${workflowToDelete.workflow_id} deleted successfully.`);
      setIsDeleteModalOpen(false);
      setWorkflowToDelete(null);
      
      // Update workflows state in the parent by calling onWorkflowsUpdated
      // This is crucial for reflecting the change in the UI
      onWorkflowsUpdated(); 

    } catch (err) {
      console.error("Error deleting workflow:", err);
      setDeleteError(`Failed to delete workflow: ${err.message}`);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setWorkflowToDelete(null);
    setDeleteError(null);
  };

  // 1. Handle Loading State
  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-lg font-medium">Loading workflows...</p>
        <p className="text-sm mt-1">This might take a moment.</p>
      </div>
    );
  }

  // 2. Handle Error State
  if (error) {
    return (
      <div className="text-center py-8 text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-lg font-medium mb-2">Error loading workflows:</p>
        <p className="text-sm">{error}</p>
        <p className="text-sm mt-2">Please try refreshing the page.</p>
      </div>
    );
  }

  // 3. Handle No Workflows Found State
  if (!workflows || workflows.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">
        No notification workflows found for this project.
        <br />
        Use the <span className='font-semibold text-gray-600'>"+ Create"</span>  button to add a new one
      </p>
    );
  }

  // 4. Render Table if Workflows Exist
  return (
    <div className="bg-white shadow overflow-hidden rounded-lg mb-8">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
              ID
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
              Channels
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
              Module
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
              Frequency
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">More Options</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {workflows.map((workflow) => (
            <WorkflowRow
              key={workflow._id}
              workflow={workflow}
              onEditWorkflow={onEditWorkflow}
              onDeleteWorkflow={handleDeleteWorkflow}
              onUpdateWorkflowStatus={onUpdateWorkflowStatus}
            />
          ))}
        </tbody>
      </table>

      {/* Render Edit Workflow Modal conditionally */}
      {isEditModalOpen && editingWorkflow && (
        <EditWorkflowModal
          workflow={editingWorkflow}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveEditedWorkflow}
        />
      )}

      {/* Render Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Confirm Workflow Deletion"
        message={
          deleteError ? (
            <p className="text-red-600">{deleteError}</p>
          ) : (
            `Are you sure you want to delete the workflow ${workflowToDelete?.workflow_name}? This action cannot be undone.`
          )
        }
        onConfirm={confirmDeleteWorkflow}
        onCancel={cancelDelete}
      />
    </div>
  );
};

export default WorkflowTable;