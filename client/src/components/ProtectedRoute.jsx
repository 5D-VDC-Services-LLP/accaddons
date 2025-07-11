// components/ProtectedRoute.jsx
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const ProtectedRoute = ({ children }) => {
  const { loading, isAuthenticated, checkedOnce, checkAuth } = useAuth();

  useEffect(() => {
    checkAuth(); // Only runs if not already checked
  }, [checkAuth]);

  console.log(isAuthenticated)

  if (loading || !checkedOnce) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;