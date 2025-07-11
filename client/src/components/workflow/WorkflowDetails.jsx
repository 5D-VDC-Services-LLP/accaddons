// // src/components/workflow/WorkflowDetails.jsx
// import React from 'react';
// import { Search } from 'lucide-react';

// const WorkflowDetails = ({
//   title,
//   setTitle,
//   isUserActive,
//   setIsUserActive,
//   searchUser,
//   setSearchUser,
//   isRoleActive,
//   setIsRoleActive,
//   searchRole,
//   setSearchRole,
//   isCompanyActive,
//   setIsCompanyActive,
//   searchCompany,
//   setSearchCompany,
//   users,
//   companies
// }) => {

//   const filteredUsers = users.filter((u) =>
//     `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchUser.toLowerCase())
//   );

//   const filteredCompanies = companies.filter((c) =>
//     c.name.toLowerCase().includes(searchCompany.toLowerCase())
//   );
  
//   return (
//     <div className="bg-white rounded-lg p-6 shadow-sm">
//       <h2 className="text-lg font-medium text-gray-900 mb-2">Details</h2>

//       <div className="grid grid-cols-5 gap-6">
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
//           />
//         </div>

//         {/* Escalate To - User */}
//         <div className="col-span-1">
//           <div className="flex items-center mb-1">
//             <input
//               type="checkbox"
//               checked={isUserActive}
//               onChange={() => setIsUserActive((prev) => !prev)}
//               className="form-checkbox accent-blue-500 mr-2"
//             />
//             <label className="text-sm font-medium text-gray-700">Escalate To - User</label>
//           </div>
//           <div className="relative">
//             <input
//               type="text"
//               placeholder="Search user..."
//               value={searchUser}
//               onChange={(e) => setSearchUser(e.target.value)}
//               disabled={!isUserActive}
//               className={`w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none ${
//                 isUserActive
//                   ? 'bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
//                   : 'bg-gray-100 text-gray-400 cursor-not-allowed'
//               }`}
//             />
//             <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
//           </div>
//         </div>

//         {/* Escalate To - Role */}
//         <div className="col-span-1">
//           <div className="flex items-center mb-1">
//             <input
//               type="checkbox"
//               checked={isRoleActive}
//               onChange={() => setIsRoleActive((prev) => !prev)}
//               className="form-checkbox accent-blue-500 mr-2"
//             />
//             <label className="text-sm font-medium text-gray-700">Escalate To - Role</label>
//           </div>
//           <div className="relative">
//             <input
//               type="text"
//               placeholder="Search role..."
//               value={searchRole}
//               onChange={(e) => setSearchRole(e.target.value)}
//               disabled={!isRoleActive}
//               className={`w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none ${
//                 isRoleActive
//                   ? 'bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
//                   : 'bg-gray-100 text-gray-400 cursor-not-allowed'
//               }`}
//             />
//             <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
//           </div>
//         </div>

//         {/* Escalate To - Company */}
//         <div className="col-span-1">
//           <div className="flex items-center mb-1">
//             <input
//               type="checkbox"
//               checked={isCompanyActive}
//               onChange={() => setIsCompanyActive((prev) => !prev)}
//               className="form-checkbox accent-blue-500 mr-2"
//             />
//             <label className="text-sm font-medium text-gray-700">Escalate To - Company</label>
//           </div>
//           <div className="relative">
//             <input
//               type="text"
//               placeholder="Search company..."
//               value={searchCompany}
//               onChange={(e) => setSearchCompany(e.target.value)}
//               disabled={!isCompanyActive}
//               className={`w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none ${
//                 isCompanyActive
//                   ? 'bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
//                   : 'bg-gray-100 text-gray-400 cursor-not-allowed'
//               }`}
//             />
//             <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default WorkflowDetails;

import React from "react";
import { Search, Check } from "lucide-react";

const WorkflowDetails = ({
  title,
  setTitle,
  isUserActive,
  setIsUserActive,
  searchUser,
  setSearchUser,
  isCompanyActive,
  setIsCompanyActive,
  searchCompany,
  setSearchCompany,
  users,
  companies,
  selectedUsers,
  setSelectedUsers,
  selectedCompanies,
  setSelectedCompanies,
}) => {
  // Filtered Users
  const filteredUsers = Array.isArray(users)
    ? users.filter((u) =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchUser.toLowerCase()) &&
          !selectedUsers.includes(u.autodeskId)
      )
    : [];

  // Filtered Companies
  const filteredCompanies = Array.isArray(companies)
    ? companies.filter((c) =>
        c.name.toLowerCase().includes(searchCompany.toLowerCase())
      )
    : [];

  // Toggle User Selection
const toggleUserSelection = (userObject) => {
    // --- ADD THIS CONSOLE LOG TO INSPECT THE OBJECT BEING ADDED/REMOVED ---
    console.log("toggleUserSelection: Received userObject:", userObject);

    // Robust validation for userObject before proceeding
    if (!userObject || !userObject.autodeskId) {
      console.error("Invalid user object passed to toggleUserSelection (missing userObject or autodeskId):", userObject);
      // Optionally, you might want to show a toast/alert to the user or skip the update
      return;
    }

    setSelectedUsers((prev) => {
      // Ensure 'prev' is always an array, though useState([]) handles this initially
      const currentSelected = Array.isArray(prev) ? prev : [];

      if (currentSelected.some(su => su && su.autodeskId === userObject.autodeskId)) {
        // Remove user object by matching autodeskId
        return currentSelected.filter((su) => su && su.autodeskId !== userObject.autodeskId);
      } else {
        // Add the full user object
        return [...currentSelected, userObject];
      }
    });
  };

  // Toggle Company Selection
  const toggleCompanySelection = (companyId) => {
    setSelectedCompanies((prev) =>
      prev.includes(companyId)
        ? prev.filter((id) => id !== companyId)
        : [...prev, companyId]
    );
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-lg font-medium text-gray-900 mb-2">Details</h2>

      <div className="grid grid-cols-5 gap-6">
        {/* Title */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Escalate To - User */}
        <div className="col-span-1">
          <div className="flex items-center mb-1">
            <input
              type="checkbox"
              checked={isUserActive}
              onChange={() => setIsUserActive((prev) => !prev)}
              className="form-checkbox accent-blue-500 mr-2"
            />
            <label className="text-sm font-medium text-gray-700">Escalate To - User</label>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search user..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              disabled={!isUserActive}
              className={`w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none ${
                isUserActive
                  ? "bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            />
            <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />

            {/* Dropdown */}
            {isUserActive && searchUser && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredUsers.map((u) => (
                  u && u.autodeskId && u.firstName && u.lastName ? (
                    <div
                      key={u.autodeskId}
                      className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      // THIS IS THE LINE THAT NEEDS TO BE FIXED
                      onClick={() => toggleUserSelection(u)} // <--- Your current code likely looks like this
                    >
                      <span>{u.firstName} {u.lastName}</span>
                      {selectedUsers.some(su => su && su.autodeskId === u.autodeskId) && (
                        <Check className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  ) : (
                    console.warn("Skipping rendering of malformed user object in dropdown:", u),
                    null
                  )
                ))}
                {filteredUsers.length === 0 && (
                  <div className="px-3 py-2 text-gray-500">No users found</div>
                )}
              </div>
            )}
          {/* Display selected users below the search bar */}
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedUsers.map((autodeskId) => {
                // Find the full user object from the 'users' prop to display name
                const user = users.find(u => u.autodeskId === autodeskId);
                return user ? (
                  <span
                    key={user.autodeskId}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {user.firstName} {user.lastName}
                    <button
                      type="button"
                      onClick={() => toggleUserSelection(user)} // Pass the user object to remove it
                      className="ml-2 -mr-0.5 h-4 w-4 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ) : null;
              })}
            </div>
          </div>
        </div>

        {/* Escalate To - Company */}
        <div className="col-span-1">
          <div className="flex items-center mb-1">
            <input
              type="checkbox"
              checked={isCompanyActive}
              onChange={() => setIsCompanyActive((prev) => !prev)}
              className="form-checkbox accent-blue-500 mr-2"
            />
            <label className="text-sm font-medium text-gray-700">Escalate To - Company</label>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search company..."
              value={searchCompany}
              onChange={(e) => setSearchCompany(e.target.value)}
              disabled={!isCompanyActive}
              className={`w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none ${
                isCompanyActive
                  ? "bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            />
            <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />

            {/* Dropdown */}
            {isCompanyActive && searchCompany && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredCompanies.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => toggleCompanySelection(c.id)}
                  >
                    <span>{c.name}</span>
                    {selectedCompanies.includes(c.id) && (
                      <Check className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                ))}
                {filteredCompanies.length === 0 && (
                  <div className="px-3 py-2 text-gray-500">No companies found</div>
                )}
              </div>
            )}
          {/* Display selected companies below the search bar */}
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedCompanies.map((companyId) => {
                const company = companies.find(c => c.id === companyId);
                return company ? (
                  <span
                    key={company.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {company.name}
                    <button
                      type="button"
                      onClick={() => toggleCompanySelection(company.id)}
                      className="ml-2 -mr-0.5 h-4 w-4 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ) : null;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowDetails;
