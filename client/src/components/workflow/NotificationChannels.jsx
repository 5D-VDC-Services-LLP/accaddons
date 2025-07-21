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
    <div className="flex flex-col gap-4">
      {/* Subheading inside the component */}
      <p className="text-sm font-medium text-gray-600">
        Select your preferred channels:
      </p>

      <div className="flex flex-wrap gap-4">
        {/* WhatsApp Option */}
        <label className="flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition">
          <input
            type="checkbox"
            checked={isWhatsAppSelected}
            onChange={() => setIsWhatsAppSelected((prev) => !prev)}
            className="form-checkbox accent-gray-500"
          />
          <img src={wp_logo} className="w-5 h-5" alt="WhatsApp" />
          <span className="text-gray-800 text-sm">WhatsApp</span>
        </label>

        {/* Email Option */}
        <label className="flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition">
          <input
            type="checkbox"
            checked={isEmailSelected}
            onChange={() => setIsEmailSelected((prev) => !prev)}
            className="form-checkbox accent-gray-500"
          />
          <Mail className="w-5 h-5 text-red-700" />
          <span className="text-gray-800 text-sm">Email</span>
        </label>
      </div>
    </div>
  );
};

export default NotificationChannels;
