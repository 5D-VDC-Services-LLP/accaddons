import React from 'react';

const AutodeskProjectsList = ({ projects }) => {
  return (
    <div className="mt-12 bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Autodesk Projects</h2>
      {projects.length > 0 ? (
        <ul className="divide-y divide-gray-100">
          {projects.map(project => (
            <li key={project.id} className="py-2 text-gray-700">
              <span className="font-medium">{project.name}</span> (ID: {project.id})
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No Autodesk projects found or loaded.</p>
      )}
      <p className="text-sm text-gray-500 mt-4">This data is fetched from your Autodesk account.</p>
    </div>
  );
};

export default AutodeskProjectsList;