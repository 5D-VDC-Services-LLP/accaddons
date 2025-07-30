// src/components/workflow/NotificationWorkflowSchedule.jsx
import React from 'react';

const NotificationWorkflowSchedule = ({ selectedDueIn, setSelectedDueIn }) => {
  // Define the specific options for days due
  const dayOptions = [
  { id: 'due_0', name: 'On the due date' },
  { id: 'due_1', name: '1 day from due date' },
  { id: 'due_2', name: '2 days from due date' },
  { id: 'due_3', name: '3 days from due date' },
  { id: 'due_5', name: '5 days from due date' },
  { id: 'due_7', name: 'a week from due date' },
];


  return (
    <div className="flex flex-col space-y-4 p-4 h-full">
      <select
      value={selectedDueIn} // holds the selected id (e.g. '0', '1', ...)
      onChange={(e) => setSelectedDueIn(e.target.value)}
      >
      {dayOptions.map(option => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ))}
    </select>
      <div className="flex-grow"></div> {/* This will push the content to the top */}
    </div>
  );
};

export default NotificationWorkflowSchedule;