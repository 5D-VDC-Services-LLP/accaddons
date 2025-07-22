// // components/ProtectedRoute.jsx
// import React, { useEffect } from 'react';
// import { Navigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../context/authContext'; // Assuming this provides general auth state
// import { useAutodeskAuth } from '../utils/useAutodeskAuth'; // Import your specific Autodesk auth hook

// const ProtectedRoute = ({ children }) => {
//   const { loading, isAuthenticated, checkedOnce, checkAuth } = useAuth(); // General auth state
//   const { authStatus } = useAutodeskAuth(); // Get the specific Autodesk auth status
//   const location = useLocation();

//   // This useEffect ensures the general auth check runs, but it might still cause the 401 if
//   // not carefully managed alongside the special 'pendingPhone' flow.
//   // We'll keep it for now but be aware it's the source of the 401.
//   useEffect(() => {
//     checkAuth(); // Only runs if not already checked
//   }, [checkAuth]);

//   console.log('ProtectedRoute - isAuthenticated:', isAuthenticated); // Keep this for debugging
//   console.log('ProtectedRoute - authStatus (from Autodesk hook):', authStatus); // ADD THIS LOG
//   console.log('ProtectedRoute - Current path:', location.pathname); // ADD THIS LOG

//   // Allow access to the /verify-phone route if the path matches,
//   // regardless of other authentication states, as this is a special flow.
//   if (location.pathname === '/verify-phone') {
//     console.log('ProtectedRoute - Allowing access to /verify-phone.');
//     return children;
//   }

//   // If the Autodesk authentication flow indicates pending phone verification,
//   // allow access *temporarily* until the navigation to /verify-phone completes.
//   // This state is set by useAutodeskAuth *before* the navigate.
//   if (authStatus === 'pendingPhone') {
//     console.log('ProtectedRoute - Detected pendingPhone status, allowing access temporarily.');
//     // You might show a "Redirecting..." message here if needed.
//     return children;
//   }

//   // Existing loading state checks
//   if (loading || !checkedOnce) {
//     console.log('ProtectedRoute - Loading or not checked yet...');
//     return <div>Loading...</div>;
//   }

//   // Standard protected route logic: if not authenticated, redirect to login
//   if (!isAuthenticated) {
//     console.log('ProtectedRoute - Not authenticated, redirecting to /.');
//     return <Navigate to="/" replace />;
//   }

//   // If authenticated (and not in pendingPhone flow), render children
//   console.log('ProtectedRoute - Authenticated, rendering children.');
//   return children;
// };

// export default ProtectedRoute;


// components/ProtectedRoute.jsx (Revised)
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { useAutodeskAuth } from '../utils/useAutodeskAuth'; // Import your specific Autodesk auth hook

const ProtectedRoute = ({ children }) => {
  const { loading, isAuthenticated, checkedOnce, checkAuth } = useAuth(); // General auth state
  const { authStatus } = useAutodeskAuth(); // Get the specific Autodesk auth status
  const location = useLocation();

  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated);
  console.log('ProtectedRoute - authStatus (from Autodesk hook):', authStatus);
  console.log('ProtectedRoute - Current path:', location.pathname);

  // --- NEW LOGIC: Only call checkAuth if it's not a special auth flow ---
  useEffect(() => {
    // If we are already authenticated by the main AuthContext, no need to check again
    if (isAuthenticated) return;

    // If we are in the middle of a special Autodesk OAuth flow (pendingPhone, error, or success),
    // do NOT trigger the general auth check immediately. useAutodeskAuth will handle the redirect.
    if (location.pathname === '/verify-phone' || authStatus === 'pendingPhone' || authStatus === 'error' || authStatus === 'authenticated') {
      console.log('ProtectedRoute - Skipping checkAuth due to special auth flow or current status.');
      return;
    }

    // Otherwise, perform the general authentication check
    console.log('ProtectedRoute - Initiating general checkAuth()...');
    checkAuth(); // Only runs if not already checked
  }, [isAuthenticated, location.pathname, authStatus, checkAuth]);


  // --- Render logic for allowing special flows ---
  // Allow access to the /verify-phone route if the path matches
  if (location.pathname === '/verify-phone') {
    console.log('ProtectedRoute - Allowing access to /verify-phone.');
    return children;
  }

  // If the Autodesk authentication flow indicates pending phone verification,
  // allow access temporarily to let useAutodeskAuth handle the navigation.
  if (authStatus === 'pendingPhone') {
    console.log('ProtectedRoute - Detected pendingPhone status, allowing access temporarily.');
    // You might show a "Redirecting..." message here if needed.
    return children;
  }

  // --- Standard ProtectedRoute logic for other cases ---
  if (loading || !checkedOnce) {
    console.log('ProtectedRoute - Loading or not checked yet...');
    return <div>Loading...</div>;
  }

  // If not authenticated and not in a special flow, redirect to login
  if (!isAuthenticated) {
    console.log('ProtectedRoute - Not authenticated, redirecting to /.');
    return <Navigate to="/" replace />;
  }

  // If authenticated (and not in pendingPhone flow), render children
  console.log('ProtectedRoute - Authenticated, rendering children.');
  return children;
};

export default ProtectedRoute;