import React from "react";

const WorkflowTitle = ({ title, setTitle }) => (
  <div className="bg-white rounded-lg p-6 shadow-sm">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Title <span className="text-red-500">*</span>
    </label>
    <input
      type="text"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      placeholder="Enter Notification Workflow title"
    />
  </div>
);

export default WorkflowTitle;
