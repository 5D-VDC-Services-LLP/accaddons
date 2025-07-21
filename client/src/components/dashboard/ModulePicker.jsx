import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, Settings } from "lucide-react";

const ModulePicker = ({ modules, selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => setIsOpen((prev) => !prev);
  const handleSelect = (module) => {
    onSelect(module);
    setIsOpen(false);
  };

  return (
    <div ref={pickerRef} className="relative inline-block">
      {/* Button */}
      <div
        className="flex border border-gray-300 rounded-md justify-between overflow-hidden cursor-pointer select-none w-30"
        onClick={handleToggle}
      >
        {/* Left colored block */}
        <div className="bg-blue-200 text-blue-900 flex items-center justify-center rounded-md p-2 m-1">
          <Settings size={20} />
        </div>
        <div className="flex justify-center items-center text-gray-700 font-medium px-1">
            {selected?.name || "Select"}
        </div>
        {/* Right dropdown arrow */}
        <div className="bg-white flex items-center justify-center p-1">
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
          {modules.map((module) => (
            <div
              key={module.id}
              onClick={() => handleSelect(module)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {module.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModulePicker;
