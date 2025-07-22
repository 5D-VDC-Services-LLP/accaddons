// // src/utils/useAutodeskAuth.js
// import { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useProjectContext } from '../context/ProjectContext'; // 🔔 Import this
// import { getBackendUrl } from '../utils/urlUtils'; // Ensure this utility is available


// export const useAutodeskAuth = () => {
//   const [authStatus, setAuthStatus] = useState('idle'); // idle, authenticating, authenticated, error, reauthenticating
//   const [errorMsg, setErrorMsg] = useState('');
//   const [initialProjects, setInitialProjects] = useState([]);
//   const navigate = useNavigate();
//   const { projects, setProjects } = useProjectContext(); // 🔔 Access context updater

//   const getSubdomain = () => {
//     const hostname = window.location.hostname;
//    if (hostname.endsWith('.localhost')) {
//       const parts = hostname.split('.');
//       if (parts.length >= 2 && parts[0] !== '') {
//         return parts[0];
//       }
//       return '';
//     }

//     const domainParts = hostname.split('.');
//     if (domainParts.length > 2 && domainParts[0] !== '') {
//       return domainParts[0];
//     }
//     return '';
//   };

//   const currentSubdomain = getSubdomain();
//   const backendBaseUrl = getBackendUrl();

//   // 🔍 Check if JWT exists by pinging backend
//   const checkAuthStatus = useCallback(async () => {
//     try {
//       const response = await fetch(`${backendBaseUrl}/api/auth/check`, {
//         credentials: 'include',
//       });

//       if (!response.ok) throw new Error('Not authenticated');
//       const data = await response.json();

//       return data.authenticated === true;
//     } catch {
//       return false;
//     }
//   }, [backendBaseUrl]);

//   const fetchInitialProjects = useCallback(async () => {
//     try {
//       const response = await fetch(`${backendBaseUrl}/api/auth/initial-projects`, {
//         method: 'GET',
//         credentials: 'include',
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Failed to fetch initial projects.');
//       }

//       const projects = await response.json();
//       // setInitialProjects(projects);
//       setProjects(projects);            // Global context ✅
//       setAuthStatus('authenticated');
//       setErrorMsg('');
//       navigate('/workflows');
//     } catch (err) {
//       console.error('Error fetching initial projects:', err);
//       setAuthStatus('error');
//       setErrorMsg(`Failed to load projects: ${err.message}. Please try logging in again.`);
//       navigate('/');
//     }
//   }, [backendBaseUrl, navigate]);

//   const login = useCallback(async () => {
//     const frontendOrigin = `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}`;
//     const redirectTo = `${frontendOrigin}/workflows`;
//     console.log(redirectTo)
//     setErrorMsg('');

//     const isAuthenticated = await checkAuthStatus();

//     if (isAuthenticated) {
//       console.log('✅ JWT valid. Attempting silent re-authentication...');
//       setAuthStatus('reauthenticating');

//       // Check if projects are already cached
//       const cached = sessionStorage.getItem('autodeskProjects');
//       if (cached) {
//         try {
//           const parsed = JSON.parse(cached);
//           if (Array.isArray(parsed) && parsed.length > 0) {
//             setProjects(parsed);
//             setAuthStatus('authenticated');
//             navigate('/workflows');
//             return;
//           }
//         } catch {
//           console.warn('Cached project data was invalid, refetching...');
//         }
//       }

//       try {
//         const response = await fetch(`${backendBaseUrl}/api/auth/reauthenticate`, {
//           credentials: 'include',
//         });

//         if (!response.ok) throw new Error('Re-authentication failed');
//         await fetchInitialProjects();
//       } catch (err) {
//         console.warn('❌ Silent re-authentication failed:', err.message);
//         setAuthStatus('authenticating');
//         window.location.href = `${backendBaseUrl}/api/auth/autodesk/login?redirectTo=${encodeURIComponent(redirectTo)}`;
//       }
//     } else {
//       console.log('🔒 No valid JWT. Initiating full Autodesk OAuth login...');
//       setAuthStatus('authenticating');
//       window.location.href = `${backendBaseUrl}/api/auth/autodesk/login?redirectTo=${encodeURIComponent(redirectTo)}`;
//     }
//   }, [backendBaseUrl, checkAuthStatus, fetchInitialProjects]);

//   // Handle redirect from Autodesk OAuth callback
//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const status = urlParams.get('authStatus');
//     const message = urlParams.get('message');

//     if (status === 'error') {
//       setAuthStatus('error');
//       setErrorMsg(decodeURIComponent(message || 'Authentication failed.'));
//       navigate(window.location.pathname, { replace: true });
//     } else if (status === 'pendingPhone') {
//       setAuthStatus('pendingPhone');
//       navigate('/verify-phone', { replace: true });
//     } else if (window.location.pathname === '/workflows' && status === 'success') {
//       console.log('✅ OAuth redirect success. Fetching initial projects...');
//       fetchInitialProjects();
//       navigate(window.location.pathname, { replace: true });
//     }
//   }, [navigate, fetchInitialProjects]);

//   // Automatic re-auth attempt if user reloads workflows page with valid cookie
//   useEffect(() => {
//     if (window.location.pathname === '/workflows' && authStatus === 'idle') {
//       console.log('🔄 Checking if user is already authenticated...');
//       login();
//     }
//   }, [authStatus, login]);

//   return { authStatus, errorMsg, initialProjects, login, currentSubdomain };
// };


// src/utils/useAutodeskAuth.js
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectContext } from '../context/ProjectContext';
import { getBackendUrl } from '../utils/urlUtils';

export const useAutodeskAuth = () => {
  const [authStatus, setAuthStatus] = useState('idle'); // idle, authenticating, authenticated, error, reauthenticating
  const [errorMsg, setErrorMsg] = useState('');
  const [initialProjects, setInitialProjects] = useState([]);
  const navigate = useNavigate();
  const { projects, setProjects } = useProjectContext();

  const currentSubdomain = useMemo(() => {
    const hostname = window.location.hostname;

    if (hostname.endsWith('.localhost')) {
      const parts = hostname.split('.');
      return parts.length >= 2 && parts[0] !== '' ? parts[0] : '';
    }

    const domainParts = hostname.split('.');
    return domainParts.length > 2 && domainParts[0] !== '' ? domainParts[0] : '';
  }, []);

  const backendBaseUrl = useMemo(() => getBackendUrl(), []);

  // --- Guarded login trigger ref ---
  const loginCalledRef = useRef(false);
  const oauthHandledRef = useRef(false);

  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await fetch(`${backendBaseUrl}/api/auth/check`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Not authenticated');
      const data = await response.json();
      return data.authenticated === true;
    } catch {
      return false;
    }
  }, [backendBaseUrl]);

  const fetchInitialProjects = useCallback(async () => {
    try {
      const response = await fetch(`${backendBaseUrl}/api/auth/initial-projects`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch initial projects.');
      }

      const projects = await response.json();
      setProjects(projects); // ✅ Global context
      setAuthStatus('authenticated');
      setErrorMsg('');
      navigate('/workflows');
    } catch (err) {
      console.error('Error fetching initial projects:', err);
      setAuthStatus('error');
      setErrorMsg(`Failed to load projects: ${err.message}. Please try logging in again.`);
      navigate('/');
    }
  }, [backendBaseUrl, navigate, setProjects]);

  const login = useCallback(async () => {
    const frontendOrigin = `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}`;
    const redirectTo = `${frontendOrigin}/workflows`;

    setErrorMsg('');

    const isAuthenticated = await checkAuthStatus();

    if (isAuthenticated) {
      console.log('✅ JWT valid. Attempting silent re-authentication...');
      setAuthStatus('reauthenticating');

      const cached = sessionStorage.getItem('autodeskProjects');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProjects(parsed);
            setAuthStatus('authenticated');
            navigate('/workflows');
            return;
          }
        } catch {
          console.warn('Cached project data was invalid, refetching...');
        }
      }

      try {
        const response = await fetch(`${backendBaseUrl}/api/auth/reauthenticate`, {
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Re-authentication failed');
        await fetchInitialProjects();
      } catch (err) {
        console.warn('❌ Silent re-authentication failed:', err.message);
        setAuthStatus('authenticating');
        window.location.href = `${backendBaseUrl}/api/auth/autodesk/login?redirectTo=${encodeURIComponent(redirectTo)}`;
      }
    } else {
      console.log('🔒 No valid JWT. Initiating full Autodesk OAuth login...');
      setAuthStatus('authenticating');
      window.location.href = `${backendBaseUrl}/api/auth/autodesk/login?redirectTo=${encodeURIComponent(redirectTo)}`;
    }
  }, [backendBaseUrl, checkAuthStatus, fetchInitialProjects, navigate, setProjects]);

  // Handle redirect from Autodesk OAuth callback
  useEffect(() => {
    if (oauthHandledRef.current) return;
    oauthHandledRef.current = true;

    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('authStatus');
    const message = urlParams.get('message');
    console.log('useAutodeskAuth - Detected authStatus:', status); // Very important log
  console.log('useAutodeskAuth - Current pathname:', window.location.pathname); // Also important

    if (status === 'error') {
      setAuthStatus('error');
      setErrorMsg(decodeURIComponent(message || 'Authentication failed.'));
      navigate(window.location.pathname, { replace: true });
    } else if (status === 'pendingPhone') {
      console.log('useAutodeskAuth - Navigating to /verify-phone due to pendingPhone status.');
    setAuthStatus('pendingPhone');
    navigate('/verify-phone', { credentials: 'include', replace: true });
    } else if (window.location.pathname === '/workflows' && status === 'success') {
      console.log('✅ OAuth redirect success. Fetching initial projects...');
      fetchInitialProjects();
      navigate(window.location.pathname, { replace: true });
    }
  }, [navigate, fetchInitialProjects]);

  // Attempt silent login only once per page load
  useEffect(() => {
    if (
      window.location.pathname === '/workflows' &&
      authStatus === 'idle' &&
      !loginCalledRef.current
    ) {
      loginCalledRef.current = true;
      console.log('🔄 Checking if user is already authenticated...');
      login();
    }
  }, [authStatus, login]);

  // ✅ Memoize returned object to avoid re-renders in consumers
  return useMemo(() => ({
    authStatus,
    errorMsg,
    initialProjects,
    login,
    currentSubdomain,
  }), [authStatus, errorMsg, initialProjects, login, currentSubdomain]);
};
