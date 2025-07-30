// src/components/workflow/WorkflowHeader.jsx
import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/authContext'; // Assuming you have an auth context to get user info
import UserProfileMenu from './UserProfileMenu'; // Assuming you have a UserProfileMenu component

const WorkflowHeader = () => {
  const { user } = useAuth();
  const location = useLocation();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const projectName = location.state?.projectName || 'Default Project';
  return (
    <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-gray-500 text-sm font-semibold">{projectName}</span>
      </div>
      <button
              type='button'
              className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-sm font-medium text-white"
              onClick={() => setIsUserMenuOpen(true)}
              title="Open User Profile"
            >
              {user.first_name.charAt(0).toUpperCase() + user.last_name.charAt(0).toUpperCase()}
            </button>

          <UserProfileMenu
        isOpen={isUserMenuOpen}
        onClose={() => setIsUserMenuOpen(false)}
        userProfile={user}/>

    </div>
  );
};

export default WorkflowHeader;