import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { getBackendUrl } from '../utils/urlUtils';
import { replace } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    loading: false,
    isAuthenticated: false,
    checkedOnce: false,
    user: null,
  });

  const checkAuth = useCallback(async () => {
    if (authState.checkedOnce) return;

    setAuthState(prev => ({ ...prev, loading: true }));

    try {
      const response = await axios.get(`${getBackendUrl()}/api/auth/check`, {
        withCredentials: true
      });

      setAuthState({
        loading: false,
        isAuthenticated: response.data.authenticated,
        checkedOnce: true,
        user: response.data.user || null,
      });
    } catch {
      setAuthState({
        loading: false,
        isAuthenticated: false,
        checkedOnce: true,
        user: null,
      });
    }
  }, [authState.checkedOnce]);

  const logout = useCallback(async (redirectPath = '/') => {
    setAuthState(prev => ({ ...prev, loading: true }));
    try {
      // Make a POST request to the backend logout endpoint
      // The backend will clear the JWT cookie and session
      const response = await axios.post(`${getBackendUrl()}/api/auth/logout`, null, {
        withCredentials: true,
        params: { redirectTo: redirectPath } // Pass redirect path to backend
      });

      // Update frontend auth state
      setAuthState({ loading: false, isAuthenticated: false, checkedOnce: true, user: null });
      // Force a full page reload and redirect using window.location.href
      // This will clear the SPA's state and navigate the browser entirely.
      if (response.data && response.data.redirectTo) {
        window.location.href = response.data.redirectTo; // Use the URL provided by the backend
      } else {
        // Fallback if redirectTo isn't provided by backend (shouldn't happen with the above change)
        window.location.href = redirectPath; // Use the path passed to the logout function
      }
    } catch (error) {
      console.error('Logout failed:', error);
      setAuthState(prev => ({ ...prev, loading: false })); // Stop loading even on error
      console.log('Logout failed. Please try again.');
    }
  }, []);

  // ✅ Memoize the context value
  const contextValue = useMemo(() => ({
    ...authState,
    checkAuth,
    logout,
  }), [authState, checkAuth]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

