import React, { useState, useEffect } from 'react';
import { ChevronDown, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const PROJECTS_PER_PAGE = 5;

const ProjectDropdown = ({ projects, selectedProject, setSelectedProject, projectDropdownRef }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [page, setPage] = useState(0);

  // Filter and paginate projects
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(projectSearch.toLowerCase())
  );
  const paginatedProjects = filteredProjects.slice(
    page * PROJECTS_PER_PAGE,
    (page + 1) * PROJECTS_PER_PAGE
  );
  const totalPages = Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen, projectDropdownRef]);

  // Reset page when search query changes
  useEffect(() => {
    setPage(0);
  }, [projectSearch]);

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
        <ChevronDown className={`w-4 h-4 ml-2 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
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
              className="w-full pl-10 pr-2 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {/* Project List */}
          <ul className="max-h-60 overflow-y-auto divide-y divide-gray-100">
            {paginatedProjects.length > 0 ? (
              paginatedProjects.map((project) => (
                <li
                  key={project.id}
                  className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-800 text-sm transition-colors"
                  onClick={() => handleSelectProject(project)}
                >
                  {project.name}
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-gray-400 text-sm text-center">No projects found.</li>
            )}
          </ul>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-2 border-t border-gray-100">
              <button
                onClick={() => setPage(0)}
                disabled={page === 0}
                className="p-1 rounded text-gray-400 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                title="First Page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(prev => Math.max(0, prev - 1))}
                disabled={page === 0}
                className="p-1 rounded text-gray-400 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium text-gray-700">
                {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={page === totalPages - 1}
                className="p-1 rounded text-gray-400 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(totalPages - 1)}
                disabled={page === totalPages - 1}
                className="p-1 rounded text-gray-400 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                title="Last Page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectDropdown;