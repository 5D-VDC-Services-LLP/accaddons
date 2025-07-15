// src/components/workflow/NotificationChannels.jsx
import React from 'react';
import wp_logo from '../../assets/wp_icon.png'; // Adjust path as needed
import { Mail } from 'lucide-react';

const NotificationChannels = ({
  isWhatsAppSelected,
  setIsWhatsAppSelected,
  isEmailSelected,
  setIsEmailSelected,
}) => {
  return (
    <div className="">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Select your choice of media
      </label>
      <div className="flex gap-6">
        {/* WhatsApp Option */}
        <label className="flex items-center gap-2 px-4 py-1 rounded-full bg-white cursor-pointer">
          <input
            type="checkbox"
            checked={isWhatsAppSelected}
            onChange={() => setIsWhatsAppSelected((prev) => !prev)}
            className="form-checkbox accent-green-500"
          />
          <div className="w-10 h-10 flex items-center justify-center">
            <img src={wp_logo} className="w-6 h-6" alt="WhatsApp" />
          </div>
          <span className="text-sm text-gray-800">WhatsApp</span>
        </label>

        {/* Email Option */}
        <label className="flex items-center gap-3 px-4 py-1 rounded-full bg-white cursor-pointer">
          <input
            type="checkbox"
            checked={isEmailSelected}
            onChange={() => setIsEmailSelected((prev) => !prev)}
            className="form-checkbox accent-gray-500 px-2"
          />
          <Mail className="w-6 h-6 text-gray-800" />
          <span className="text-sm text-gray-800">Email</span>
        </label>
      </div>
    </div>
  );
};

export default NotificationChannels;