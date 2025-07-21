import React, { useState, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

const ProjectDropdown = ({ projects, selectedProject, setSelectedProject, projectDropdownRef }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');

  // Filter projects based on search query
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(projectSearch.toLowerCase())
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [projectDropdownRef]);

  const handleSelectProject = (project) => {
    setSelectedProject(project);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative" ref={projectDropdownRef}>
      <button
        type="button"
        className="flex items-center m-3 font-semibold px-3 py-2 border rounded-md border-gray-100 shadow-sm text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
        onClick={() => setIsDropdownOpen((open) => !open)}
        title="Select Autodesk Project"
      >
        {selectedProject?.name || (projects.length > 0 ? projects[0].name : 'Select Project')}
        <ChevronDown
          className={`w-4 h-4 ml-2 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* Search bar */}
          <div className="p-2 border-b border-gray-100 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={projectSearch}
              onChange={e => setProjectSearch(e.target.value)}
              className="w-full pl-10 pr-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          {/* Project List with scroll */}
          <ul className="max-h-48 overflow-y-auto divide-y divide-gray-100">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <li
                  key={project.id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-800 rounded-md text-sm transition-colors"
                  onClick={() => handleSelectProject(project)}
                >
                  {project.name}
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-gray-400 text-sm text-center">No projects found.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProjectDropdown;
