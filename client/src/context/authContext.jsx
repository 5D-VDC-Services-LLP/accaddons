// // context/AuthContext.jsx
// import React, { createContext, useContext, useState, useCallback } from 'react';
// import axios from 'axios';
// import { getBackendUrl } from '../utils/urlUtils';

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [authState, setAuthState] = useState({
//     loading: false,
//     isAuthenticated: false,
//     checkedOnce: false,
//     user: null,
//   });

//   const checkAuth = useCallback(async () => {
//     // Avoid rechecking if already done
//     if (authState.checkedOnce) return;

//     setAuthState(prev => ({ ...prev, loading: true }));

//     try {
//       const response = await axios.get(`${getBackendUrl()}/api/auth/check`, {
//         withCredentials: true
//       });

//       console.log(response)

//       setAuthState({
//         loading: false,
//         isAuthenticated: response.data.authenticated,
//         checkedOnce: true,
//         user: response.data.user || null,
//       });
//     } catch (err) {
//       // No console.error here – silent fail
//       setAuthState({
//         loading: false,
//         isAuthenticated: false,
//         checkedOnce: true,
//         user: null,
//       });
//     }
//   }, [authState.checkedOnce]);

//   return (
//     <AuthContext.Provider value={{ ...authState, checkAuth }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { getBackendUrl } from '../utils/urlUtils';

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

  // ✅ Memoize the context value
  const contextValue = useMemo(() => ({
    ...authState,
    checkAuth,
  }), [authState, checkAuth]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);