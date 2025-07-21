// src/components/dashboard/EditWorkflowModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

const DayPicker = ({ currentDays, onSave }) => {
  const dayOptions = [
    { key: 'M', label: 'Mon', display: 'M' },
    { key: 'T1', label: 'Tue', display: 'T' },
    { key: 'W', label: 'T' }, // Display 'T' for Tuesday
    { key: 'T2', label: 'Thu', display: 'T' }, // Display 'T' for Thursday
    { key: 'F', label: 'Fri', display: 'F' },
    { key: 'S1', label: 'Sat', display: 'S' },
    { key: 'S2', label: 'Sun', display: 'S' },
  ];

  const [selectedDays, setSelectedDays] = useState(currentDays);

  const toggleDay = (dayKey) => {
    setSelectedDays(prev =>
      prev.includes(dayKey)
        ? prev.filter(d => d !== dayKey)
        : [...prev, dayKey]
    );
  };

  const handleApply = () => {
    onSave(selectedDays);
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
      <h4 className="text-sm font-medium text-gray-700 mb-2">Select Days for Frequency</h4>
      <div className="grid grid-cols-7 gap-2">
        {dayOptions.map(({ key, label, display }) => (
          <div key={key} className="text-center">
            <div className="text-xs text-gray-500 mb-1">{label}</div>
            <button
              type="button" // Important: Prevent form submission
              onClick={() => toggleDay(key)}
              className={`w-8 h-8 text-xs font-medium rounded-full transition-colors duration-200 ${
                selectedDays.includes(key)
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
            >
              {display}
            </button>
          </div>
        ))}
      </div>
      <div className="flex justify-end space-x-2 mt-4">
        <button
          type="button" // Important: Prevent form submission
          onClick={handleApply}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
        >
          Apply Frequency
        </button>
      </div>
    </div>
  );
};

const EditWorkflowModal = ({ workflow, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: workflow.name,
    channels: workflow.channels,
    module: workflow.module,
    status: workflow.status,
    frequency: workflow.frequency,
  });

  const modalRef = useRef(null);

  // Close modal on outside click and Escape key press
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        channels: checked
          ? [...prev.channels, value]
          : prev.channels.filter(c => c !== value)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleStatusToggle = () => {
    setFormData(prev => ({
      ...prev,
      status: prev.status === 'active' ? 'inactive' : 'active'
    }));
  };

  const handleFrequencySave = (newDays) => {
    setFormData(prev => ({ ...prev, frequency: newDays }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(workflow.id, formData); // Pass workflow ID and updated data
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md animate-scale-in">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Edit Workflow: {workflow.name}</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 rounded-full p-1 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Workflow Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Channels</label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="channels"
                  value="email"
                  checked={formData.channels.includes('email')}
                  onChange={handleChange}
                  className="form-checkbox h-4 w-4 text-blue-600 rounded"
                />
                <span className="ml-2 text-gray-700">Email</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="channels"
                  value="whatsapp"
                  checked={formData.channels.includes('whatsapp')}
                  onChange={handleChange}
                  className="form-checkbox h-4 w-4 text-blue-600 rounded"
                />
                <span className="ml-2 text-gray-700">WhatsApp</span>
              </label>
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="module" className="block text-sm font-medium text-gray-700 mb-1">Module</label>
            <input
              type="text"
              id="module"
              name="module"
              value={formData.module}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>

          {/* DayPicker integrated here */}
          <DayPicker currentDays={formData.frequency} onSave={handleFrequencySave} />

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
              <input
                type="checkbox"
                name="status"
                id="toggle"
                checked={formData.status === 'active'}
                onChange={handleStatusToggle}
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
              />
              <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
            </div>
            <span className="text-gray-700 font-medium">
              {formData.status === 'active' ? 'Active' : 'Inactive'}
            </span>
            {/* Inline style for the toggle switch */}
            <style jsx>{`
              .toggle-checkbox:checked {
                right: 0;
                border-color: #2563eb; /* blue-600 */
              }
              .toggle-checkbox:checked + .toggle-label {
                background-color: #2563eb; /* blue-600 */
              }
              .toggle-label {
                transition: background-color 0.2s ease-in;
              }
              .toggle-checkbox {
                transition: right 0.2s ease-in, border-color 0.2s ease-in;
              }
            `}</style>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditWorkflowModal;