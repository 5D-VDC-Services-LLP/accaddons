// src/components/workflow/WorkflowSchedule.jsx
import React from 'react';

const WorkflowSchedule = ({ selectedDays, toggleDay }) => {
  const dayOptions = [
    { key: 'mon', label: 'Mon', display: 'M' },
    { key: 'tue', label: 'Tue', display: 'T' },
    { key: 'wed', label: 'Wed', display: 'W' },
    { key: 'thu', label: 'Thu', display: 'T' },
    { key: 'fri', label: 'Fri', display: 'F' },
    { key: 'sat', label: 'Sat', display: 'S' },
    { key: 'sun', label: 'Sun', display: 'S' },
  ];

  return (
    <div className="bg-white rounded-lg p-6 col-span-1 shadow-sm self-start">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">Schedule</h2>
        <button className="text-gray-500 text-sm hover:text-primary">Reset</button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select day of the week
        </label>
        <div className="flex space-x-2">
          {dayOptions.map(({ key, label, display }) => (
            <button
              key={key}
              onClick={() => toggleDay(key)}
              className={`w-8 h-8 rounded-full text-xs font-medium ${
                selectedDays.includes(key)
                  ? 'bg-gray-100 text-primary hover:bg-gray-200'
                  : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
              }`}
              title={label}
            >
              {display}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkflowSchedule;