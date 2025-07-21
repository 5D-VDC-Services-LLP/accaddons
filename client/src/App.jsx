import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import './index.css' // Ensure your global styles are imported
import CompanyGrid from './pages/CompanyGrid'
import CompanyLandingPage from './pages/CompanyLandingPage'
import { useAutodeskAuth } from './utils/useAutodeskAuth'
import { ProjectProvider } from './context/ProjectContext';
import Dashboard from './pages/Dashboard'
import VerifyPhone from './pages/VerifyPhone';
import { AuthProvider } from './context/authContext'
import ProtectedRoute from './components/ProtectedRoute'
import WorkflowConfig from './pages/WorkflowConfig'
import NotificationConfig from './pages/NotificationConfig'


const AppContent = () => {
  const { authStatus, currentSubdomain } = useAutodeskAuth(); 
  const RootComponent = currentSubdomain ? CompanyLandingPage : HomePage;

  return (
    <div>
        <Routes>
          <Route path="/" element={<RootComponent />} />
          <Route path="/company-grid" element={<CompanyGrid />} />
          {/* 🚨 OTP Verification Route */}
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

        </Routes>
    </div>
  )
};

function App() {
  return (
    <Router>
      <AppContent /> {/* Render the new wrapper component here */}
    </Router>
  );
}

export default App
