import React from 'react'
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom'
import HomePage from './pages/HomePage'
import './index.css'
import CompanyGrid from './pages/CompanyGrid'
import CompanyLandingPage from './pages/CompanyLandingPage'
import { useAutodeskAuth } from './utils/useAutodeskAuth'
import { ProjectProvider } from './context/ProjectContext';
import Dashboard from './pages/Dashboard'
import VerifyPhone from './pages/VerifyPhone';
import ProtectedRoute from './components/ProtectedRoute'
import WorkflowConfig from './pages/WorkflowConfig'
import NotificationConfig from './pages/NotificationConfig'
import EditWorkflowDispatcher from './pages/EditWorkflowDispatcher';
import NotFound from './pages/NotFound'



const AppContent = () => {
  const { authStatus, currentSubdomain } = useAutodeskAuth();
  const location = useLocation();
  const navigate = useNavigate();
  console.log("Hello from", currentSubdomain);
  const RootComponent = currentSubdomain ? CompanyLandingPage : HomePage;

  React.useEffect(() => {
    if (currentSubdomain && location.pathname === '/company-grid') {
      navigate('/', { replace: true });
    }
  }, [currentSubdomain, location.pathname, navigate]);

  return (
    <div>
        <Routes>
          <Route path="/" element={<RootComponent />} />
          <Route path="/company-grid" element={<CompanyGrid />} />
          <Route path="/verify-phone" element={<VerifyPhone />}/>
          {/* Protected routes wrapped with context */}
          <Route
            path="/workflows"
            element={
              <ProtectedRoute>
                <Dashboard/>
              </ProtectedRoute>
            }
          />
          <Route
            path="/workflows/:projectId"
            element={
              <ProtectedRoute>
                <Dashboard/>
              </ProtectedRoute>
            }
          />

          <Route
            path="/workflows/:projectId/:moduleType/create-workflow"
            element={
              <ProtectedRoute>
                <WorkflowConfig />
              </ProtectedRoute>
            }
          />

          <Route
            path="/workflows/:projectId/:moduleType/create-notification"
            element={
              <ProtectedRoute>
                <NotificationConfig />
              </ProtectedRoute>
            }
          />

        <Route
          path="/workflows/:projectId/:moduleType/edit-workflow/:workflow_id"
          element={
            <ProtectedRoute>
              <EditWorkflowDispatcher />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>

    </div>
  )
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App
