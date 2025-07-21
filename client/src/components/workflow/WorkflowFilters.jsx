import React, { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

const WorkflowFilters = ({
  isUserActive,
  setIsUserActive,
  searchUser,
  setSearchUser,
  isCompanyActive,
  setIsCompanyActive,
  searchCompany,
  setSearchCompany,
  isRoleActive,
  setIsRoleActive,
  searchRole,
  setSearchRole,
  users,
  companies,
  roles,
  selectedUsers,
  setSelectedUsers,
  selectedCompanies,
  setSelectedCompanies,
  selectedRoles,
  setSelectedRoles,
}) => {
  const [openDropdown, setOpenDropdown] = useState(null); // 'user', 'company', 'role'
    const dropdownRefs = {
      user: useRef(null),
      company: useRef(null),
      role: useRef(null),
    };
  
    const toggleDropdown = (name) => {
      setOpenDropdown(openDropdown === name ? null : name);
    };
  
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          !Object.values(dropdownRefs).some(
            (ref) => ref.current && ref.current.contains(event.target)
          )
        ) {
          setOpenDropdown(null);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);
  
    const filteredUsers = Array.isArray(users)
      ? users.filter(
          (u) =>
            (u.name || `${u.firstName || ""} ${u.lastName || ""}`)
              .toLowerCase()
              .includes(searchUser.toLowerCase()) &&
            !selectedUsers.some((su) => su && su.autodeskId === u.autodeskId)
        )
      : [];
  
    const filteredCompanies = Array.isArray(companies)
      ? companies.filter(
          (c) =>
            c.name.toLowerCase().includes(searchCompany.toLowerCase()) &&
            !selectedCompanies.includes(c.id)
        )
      : [];
  
    const filteredRoles = Array.isArray(roles)
      ? roles.filter(
          (r) =>
            r.name.toLowerCase().includes(searchRole.toLowerCase()) &&
            !selectedRoles.includes(r.roleGroupId)
        )
      : [];
  
    const toggleUserSelection = (user) => {
      setSelectedUsers((prev) =>
        prev.some((su) => su && su.autodeskId === user.autodeskId)
          ? prev.filter((su) => su && su.autodeskId !== user.autodeskId)
          : [...prev, user]
      );
      setSearchUser("");
    };
  
    const toggleCompanySelection = (company) => {
      setSelectedCompanies((prev) =>
      prev.some((c) => c.id === company.id)
        ? prev.filter((c) => c.id !== company.id)
        : [...prev, company]
      );
      setSearchCompany("");
    };
  
    const toggleRoleSelection = (role) => {
      const roleGroupId = role.roleGroupId;
      setSelectedRoles((prev) =>
        prev.includes(roleGroupId)
          ? prev.filter((id) => id !== roleGroupId)
          : [...prev, roleGroupId]
      );
      setSearchRole("");
    };
  
    const getSelectedName = (id, list, isRole = false) => {
      const item = isRole
        ? list.find((r) => r.roleGroupId === id)
        : list.find((c) => c.id === id);
      return item ? item.name : "Unknown";
    };



  const renderDropdown = (
      type,
      isActive,
      selectedItems,
      setSelectedItems,
      searchValue,
      setSearchValue,
      filteredList,
      toggleSelection,
      placeholder
    ) => (
      <div className="relative z-50" ref={dropdownRefs[type]}>
        <div
          onClick={() => isActive && toggleDropdown(type)}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer flex gap-1 items-center overflow-x-auto min-h-[42px] ${
            isActive
              ? "bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
          style={{ scrollbarWidth: "thin" }}
        >
          {selectedItems.length > 0 ? (
            <div className="flex flex-nowrap gap-1 w-max flex-shrink-0">
              {selectedItems.map((item) => (
                <span
                  key={type === "role" ? item : item.id || item.autodeskId}
                  className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs whitespace-nowrap flex items-center gap-1 flex-shrink-0"
                >
                  {getSelectedName(
                    type === "role" ? item : item.id || item.autodeskId,
                    type === "role" ? roles : type === "company" ? companies : users,
                    type === "role"
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelection(
                        type === "role"
                          ? { roleGroupId: item }
                          : type === "company"
                          ? { id: item }
                          : item
                      );
                    }}
                    className="ml-1 text-blue-700 hover:text-blue-900 font-bold focus:outline-none"
                    aria-label={`Remove ${getSelectedName(
                      type === "role" ? item : item.id || item.autodeskId,
                      type === "role" ? roles : type === "company" ? companies : users,
                      type === "role"
                    )}`}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
  
        {openDropdown === type && isActive && (
          <div
            className={`absolute z-50 w-full max-h-48 overflow-y-auto border border-gray-300 rounded-md bg-white shadow ${
              dropdownRefs[type]?.current?.getBoundingClientRect().bottom + 200 >
              window.innerHeight
                ? "bottom-full mb-1"
                : "top-full mt-1"
            }`}
          >
            {/* Sticky Search Box */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-2 flex items-center gap-2">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search..."
                className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => setSearchValue("")}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
  
            {/* List Items */}
            {filteredList.length > 0 ? (
              filteredList.map((item) => (
                <button
                  key={item.roleGroupId || item.id || item.autodeskId}
                  type="button"
                  onClick={() => toggleSelection(item)}
                  className="flex items-center justify-between w-full px-3 py-2 text-left hover:bg-gray-50"
                >
                  <span className="text-sm text-gray-700">{item.name}</span>
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-500">No results found</div>
            )}
          </div>
        )}
      </div>
    );

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm z-50">
      <h2 className="text-lg font-medium text-gray-900 mb-2">Escalate To</h2>
      <div className="grid grid-cols-3 gap-6">

        {/* Dropdowns */}
        {[
          {
            type: "user",
            isActive: isUserActive,
            selectedItems: selectedUsers,
            setSelectedItems: setSelectedUsers,
            searchValue: searchUser,
            setSearchValue: setSearchUser,
            filteredList: filteredUsers,
            toggleSelection: toggleUserSelection,
            placeholder: "Select users",
          },
          {
            type: "company",
            isActive: isCompanyActive,
            selectedItems: selectedCompanies,
            setSelectedItems: setSelectedCompanies,
            searchValue: searchCompany,
            setSearchValue: setSearchCompany,
            filteredList: filteredCompanies,
            toggleSelection: toggleCompanySelection,
            placeholder: "Select companies",
          },
          {
            type: "role",
            isActive: isRoleActive,
            selectedItems: selectedRoles,
            setSelectedItems: setSelectedRoles,
            searchValue: searchRole,
            setSearchValue: setSearchRole,
            filteredList: filteredRoles,
            toggleSelection: toggleRoleSelection,
            placeholder: "Select roles",
          },
        ].map((config) => (
          <div key={config.type} className="col-span-1">
            <div className="flex items-center mb-1">
              <input
                type="checkbox"
                checked={config.isActive}
                onChange={() =>
                  config.type === "user"
                    ? setIsUserActive((prev) => !prev)
                    : config.type === "company"
                    ? setIsCompanyActive((prev) => !prev)
                    : setIsRoleActive((prev) => !prev)
                }
                className="form-checkbox accent-blue-500 mr-2"
              />
              <label className="text-sm font-medium text-gray-700 capitalize">
                Escalate To - {config.type}
              </label>
            </div>
            {renderDropdown(
              config.type,
              config.isActive,
              config.selectedItems,
              config.setSelectedItems,
              config.searchValue,
              config.setSearchValue,
              config.filteredList,
              config.toggleSelection,
              config.placeholder
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkflowFilters;
