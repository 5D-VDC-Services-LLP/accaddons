// components/ProtectedRoute.jsx (Revised)
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { useAutodeskAuth } from '../utils/useAutodeskAuth'; // Import your specific Autodesk auth hook

const ProtectedRoute = ({ children, allowNonAdmin = false, redirectNonAdminTo = '/beta' }) => {
  const { loading, isAuthenticated, checkedOnce, checkAuth, user } = useAuth(); // General auth state
  const { authStatus } = useAutodeskAuth(); // Get the specific Autodesk auth status
  const location = useLocation();

  // --- NEW LOGIC: Only call checkAuth if it's not a special auth flow ---
  useEffect(() => {
    // If we are already authenticated by the main AuthContext, no need to check again
    if (isAuthenticated) return;

    // If we are in the middle of a special Autodesk OAuth flow (pendingPhone, error, or success),
    // do NOT trigger the general auth check immediately. useAutodeskAuth will handle the redirect.
    if (location.pathname === '/verify-phone' || authStatus === 'pendingPhone' || authStatus === 'error' || authStatus === 'authenticated') {
      return;
    }

    // Otherwise, perform the general authentication check
    checkAuth(); // Only runs if not already checked
  }, [isAuthenticated, location.pathname, authStatus, checkAuth]);


  // --- Render logic for allowing special flows ---
  // Allow access to the /verify-phone route if the path matches
  if (location.pathname === '/verify-phone') {
    return children;
  }

  // If the Autodesk authentication flow indicates pending phone verification,
  // allow access temporarily to let useAutodeskAuth handle the navigation.
  if (authStatus === 'pendingPhone') {
    // You might show a "Redirecting..." message here if needed.
    return children;
  }

  // --- Standard ProtectedRoute logic for other cases ---
  if (loading || !checkedOnce) {
    return <div>Loading...</div>;
  }

  // If not authenticated and not in a special flow, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!allowNonAdmin && user && !user.is_admin) {
    return <Navigate to={redirectNonAdminTo} replace />;
  }

  // If authenticated (and not in pendingPhone flow), render children
  return children;
};

export default ProtectedRoute;