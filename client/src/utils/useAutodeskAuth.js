import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectContext } from '../context/ProjectContext';
import { getBackendUrl } from '../utils/urlUtils';

export const useAutodeskAuth = () => {
    const [authStatus, setAuthStatus] = useState('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();
    const { setProjects } = useProjectContext();

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
    // Ref to ensure initial project fetch via OAuth callback is idempotent
    const initialProjectsFetchedRef = useRef(false);

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

    // Centralized navigation function for workflows with project ID
    const navigateToWorkflowsWithProject = useCallback((projects) => {
        if (Array.isArray(projects) && projects.length > 0) {
            const projectId = projects[0].id; // Assuming you always want the first project
            console.log(`Navigating to /workflows/${projectId}?tab=Escalation`);
            navigate(`/workflows/${projectId}?tab=escalation`, { replace: true });
        } else {
            console.warn("No projects found. Redirecting to home or an appropriate 'no projects' page.");
            // If no projects are found, redirect to root or a dedicated 'no projects' page.
            // DO NOT navigate to /workflows if it's not a valid route without a project ID.
            navigate('/', { replace: true });
            setErrorMsg('No projects found for your account. Please contact support.'); // Provide user feedback
        }
    }, [navigate]);

    const fetchInitialProjects = useCallback(async () => {
        // Prevent redundant *API fetches* if projects were already loaded successfully.
        // The subsequent navigation would be handled by other effects or explicit calls if state changes.
        if (initialProjectsFetchedRef.current) {
            console.log('Initial projects already fetched during this session. Skipping API fetch.');
            if (authStatus !== 'authenticated') {
                setAuthStatus('authenticated');
            }
            setErrorMsg('');
            // No navigation here. The assumption is that if it's already fetched,
            // the user is either on the correct page or will be redirected by `login` or other paths.
            return;
        }

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
            setProjects(projects); // Update global project context
            sessionStorage.setItem('autodeskProjects', JSON.stringify(projects)); // Cache projects

            setAuthStatus('authenticated');
            setErrorMsg('');
            initialProjectsFetchedRef.current = true; // Mark as fetched after successful retrieval

            // CRITICAL: Use the new helper for navigation with dynamic project ID
            navigateToWorkflowsWithProject(projects);

        } catch (err) {
            console.error('Error fetching initial projects:', err);
            setAuthStatus('error');
            setErrorMsg(`Failed to load projects: ${err.message}. Please try logging in again.`);
            navigate('/'); // Redirect to home on error
        }
    }, [backendBaseUrl, navigate, setProjects, authStatus, navigateToWorkflowsWithProject]); // Added navigateToWorkflowsWithProject to deps

    const login = useCallback(async () => {
        // Prevent multiple login attempts if one is already in progress via this `login` function
        if (loginCalledRef.current && authStatus === 'authenticating') {
            console.log('Login already in progress via this hook, skipping redundant call.');
            return;
        }

        const frontendOrigin = `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}`;
        // This redirectTo is what your backend's OAuth callback will use. It should be a valid landing page.
        // Since /workflows is not a general route, it might need to be / (home) or a specific landing.
        // However, the frontend will always redirect to projectId after project fetch.
        const redirectTo = `${frontendOrigin}/workflows/`; // Backend still redirects here initially for success/error parameters

        setErrorMsg('');
        // Set status to authenticating only if it's currently idle, error, or pendingPhone
        if (authStatus === 'idle' || authStatus === 'error' || authStatus === 'pendingPhone') {
            setAuthStatus('authenticating');
        }

        const isAuthenticated = await checkAuthStatus();

        if (isAuthenticated) {
            console.log('✅ JWT valid. Attempting silent re-authentication or project load...');

            const cached = sessionStorage.getItem('autodeskProjects');
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setProjects(parsed);
                        setAuthStatus('authenticated');
                        setErrorMsg('');
                        // CRITICAL: Use the new helper for navigation with cached projects
                        navigateToWorkflowsWithProject(parsed);
                        return; // Exit early if cached projects are valid
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
                // If re-authentication successful, fetch projects.
                // fetchInitialProjects will handle setting authStatus to 'authenticated',
                // marking initialProjectsFetchedRef, and navigating with the project ID.
                await fetchInitialProjects();
            } catch (err) {
                console.warn('❌ Silent re-authentication failed:', err.message);
                // Fallback to full OAuth if silent re-auth fails or if silent re-auth *fails*
                setAuthStatus('authenticating'); // Reset status to trigger full login
                window.location.href = `${backendBaseUrl}/api/auth/autodesk/login?redirectTo=${encodeURIComponent(redirectTo)}`;
            }
        } else {
            console.log('🔒 No valid JWT. Initiating full Autodesk OAuth login...');
            if (authStatus !== 'authenticating') {
                setAuthStatus('authenticating');
            }
            window.location.href = `${backendBaseUrl}/api/auth/autodesk/login?redirectTo=${encodeURIComponent(redirectTo)}`;
        }
    }, [backendBaseUrl, checkAuthStatus, fetchInitialProjects, navigateToWorkflowsWithProject, setProjects, authStatus]); // Added navigateToWorkflowsWithProject to deps

    // Handle redirect from Autodesk OAuth callback
    useEffect(() => {
        // Prevent re-running if URL parameters have already been processed
        if (oauthHandledRef.current) return;

        const urlParams = new URLSearchParams(window.location.search);
        const status = urlParams.get('authStatus');
        const message = urlParams.get('message');

        if (status) { // Only process if an authStatus param exists
            if (status === 'error') {
                setAuthStatus('error');
                setErrorMsg(decodeURIComponent(message || 'Authentication failed.'));
                // Navigate to root to clear error params and potentially show login UI
                navigate('/', { replace: true });
            } else if (status === 'pendingPhone') {
                console.log('useAutodeskAuth - Navigating to /verify-phone due to pendingPhone status.');
                setAuthStatus('pendingPhone');
                // Navigate directly to /verify-phone and clear params.
                navigate('/verify-phone', { replace: true });
            } else if (status === 'success') {
                console.log('✅ OAuth redirect success. Fetching initial projects...');
                // fetchInitialProjects will handle setting authStatus to 'authenticated',
                // initialProjectsFetchedRef to true, and crucially, navigation with the project ID.
                fetchInitialProjects();
                // Clear URL params. The actual navigation is handled by fetchInitialProjects.
                navigate(window.location.pathname, { replace: true });
            }
            oauthHandledRef.current = true; // Mark as handled regardless of success/error
        }
    }, [navigate, fetchInitialProjects]);

    // Attempt silent login only once per page load and if not already handled by OAuth callback
    useEffect(() => {
        // This effect should only run if:
        // 1. We are on the /workflows path (the initial backend redirect target after OAuth or OTP verification).
        // 2. The authentication status is 'idle' (meaning no explicit auth process has started).
        // 3. The login process hasn't been explicitly initiated by this effect (`loginCalledRef`).
        // 4. Crucially, the OAuth redirect success has *not* been handled yet (`oauthHandledRef.current`).
        //    This prevents redundant calls if the server just redirected after a successful OAuth or OTP.
        if (
            // This useEffect still checks for `/workflows` as a trigger for initial silent login.
            // If you want *any* page to trigger this, you could remove this condition.
            // However, typically, `/workflows` is your main entry point after login.
            window.location.pathname === '/workflows' &&
            authStatus === 'idle' &&
            !loginCalledRef.current &&
            !oauthHandledRef.current
        ) {
            loginCalledRef.current = true; // Mark that this effect has triggered login
            console.log('🔄 Checking if user is already authenticated (initial render check via useEffect)...');
            login(); // This will eventually set authStatus to 'authenticated' or trigger a full redirect
        }
    }, [authStatus, login, oauthHandledRef.current]);

    // Memoize returned object to avoid unnecessary re-renders in consumers
    return useMemo(() => ({
        authStatus,
        errorMsg,
        login,
        currentSubdomain,
    }), [authStatus, errorMsg, login, currentSubdomain]);
};