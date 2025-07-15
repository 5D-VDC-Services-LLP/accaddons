// // src/components/workflow/WorkflowSchedule.jsx
// import React from 'react';

// const NotificationSchedule = ({ selectedDays, toggleDay }) => {
//   const dayOptions = [
//     { key: 'mon', label: 'Mon', display: 'M' },
//     { key: 'tue', label: 'Tue', display: 'T' },
//     { key: 'wed', label: 'Wed', display: 'W' },
//     { key: 'thu', label: 'Thu', display: 'T' },
//     { key: 'fri', label: 'Fri', display: 'F' },
//     { key: 'sat', label: 'Sat', display: 'S' },
//     { key: 'sun', label: 'Sun', display: 'S' },
//   ];

//   return (
//     <div className="bg-white rounded-lg p-6 col-span-1 shadow-sm self-start">
//       <div className="flex items-center justify-between mb-6">
//         <button className="text-gray-500 text-sm hover:text-primary">Reset</button>
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-3">
//           Select day of the week
//         </label>
//         <div className="flex space-x-2">
//           {dayOptions.map(({ key, label, display }) => (
//             <button
//               key={key}
//               onClick={() => toggleDay(key)}
//               className={`w-8 h-8 rounded-full text-xs font-medium ${
//                 selectedDays.includes(key)
//                   ? 'bg-gray-100 text-primary hover:bg-gray-200'
//                   : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
//               }`}
//               title={label}
//             >
//               {display}
//             </button>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default NotificationSchedule;

// src/components/workflow/NotificationWorkflowSchedule.jsx
import React from 'react';

const NotificationWorkflowSchedule = ({ daysDue, setDaysDue }) => {
  // Define the specific options for days due
  const dayOptions = [
    { value: 1, label: 'Due Tomorrow' },
    { value: 2, label: 'Due in 2 days' },
    { value: 3, label: 'Due in 3 days' },
  ];

  return (
    <div className="flex flex-col space-y-4 p-4 h-full">
      <label htmlFor="daysDue" className="block text-sm font-medium text-gray-700">
        Timeframe:
      </label>
      <select
        id="daysDue"
        value={daysDue} // Controlled component: value reflects the state
        onChange={(e) => setDaysDue(parseInt(e.target.value, 10))} // Update state on change
        className="w-full rounded-md border-gray-300 border p-1 sm:text-sm"
      >
        {dayOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="flex-grow"></div> {/* This will push the content to the top */}
    </div>
  );
};

export default NotificationWorkflowSchedule;