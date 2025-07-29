import React from 'react';
import { X } from 'lucide-react';

const UserProfileMenu = ({ isOpen, onClose, userProfile, onSignOut }) => {
  return (
    <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className={`fixed right-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-semibold text-gray-800">User Details</span>
          <button type='button' onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          {/* Add more user details here if available from userProfile */}
          <div className='space-y-1'>
            <div className="text-gray-700 font-semibold text-sm">{userProfile?.first_name} {userProfile?.last_name}</div>
            <div className="text-gray-400 text-xs">{userProfile?.email_id || 'N/A'}</div>
          </div>

          <div className='space-y-1'>
            <div className="text-gray-800 text-sm">+{userProfile?.phone_number || 'N/A'}</div>
          <div className="flex items-center space-x-2 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors">
            <span className="text-xs">Change Phone Number</span>
          </div>
          </div>
          
          
          <button
          type='button'
            className="flex items-center space-x-2 text-red-600 p-2 rounded-lg cursor-pointer hover:text-red-700 hover:bg-red-100 transition-colors w-full text-left"
            onClick={onSignOut}
          >
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileMenu;