// import React, { useRef, useState, useEffect } from "react";
// import { Search, X } from "lucide-react";

// const NotificationDetails = ({
//   title,
//   setTitle,
// }) => {
//   return (
//     <div className="bg-white rounded-lg p-6 shadow-sm">
//       <h2 className="text-lg font-medium text-gray-900 mb-2">Details</h2>
//       <div className="grid grid-cols-5">
//         {/* Title */}
//         <div className="col-span-2">
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Title <span className="text-red-500">*</span>
//           </label>
//           <input
//             type="text"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             required
//             placeholder="Enter Notification Workflow title"
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default NotificationDetails;


// src/components/workflow/NotificationDetails.jsx
import React from 'react';

const NotificationDetails = ({ title, setTitle }) => {
  return (
    <div>
      <div className="mb-4">
        <label htmlFor="workflowTitle" className="block text-sm font-medium text-gray-700 mb-2">
          Workflow Name
        </label>
        <input
          type="text"
          id="workflowTitle"
          className="block w-full rounded-md border border-gray-300 py-2 px-3 sm:text-sm"
          placeholder="e.g., Daily Overdue Issues"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      {/* Removed any "Escalate To" or recipient selection UI */}
    </div>
  );
};

export default NotificationDetails;