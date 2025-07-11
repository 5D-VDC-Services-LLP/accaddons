import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [projects, setProjectsState] = useState([]);

  // Load from sessionStorage
  useEffect(() => {
    const cached = sessionStorage.getItem('autodeskProjects');
    if (cached) {
      try {
        setProjectsState(JSON.parse(cached));
      } catch {
        console.warn('Could not parse cached project data.');
      }
    }
  }, []);

  // Set and persist
  const setProjects = (newProjects) => {
    setProjectsState(newProjects);
    sessionStorage.setItem('autodeskProjects', JSON.stringify(newProjects));
  };

  // ✅ Memoize value to prevent unnecessary renders
  const contextValue = useMemo(() => ({
    projects,
    setProjects
  }), [projects]);

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => useContext(ProjectContext);
