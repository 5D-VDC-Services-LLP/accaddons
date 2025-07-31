// src/app.js
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session'); // For OAuth state management
const config = require('./config');
const CustomError = require('./utils/customError');
const errorHandler = require('./middleware/errorHandler');
const tenantResolver = require('./middleware/tenantResolver'); // Middleware to resolve tenant config
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const companyRoutes = require('./routes/companyRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const autodeskDataRoutes = require('./routes/autodeskDataRoutes'); // NEW: Import new routes
const escalationRoutes = require('./routes/escalationRoutes'); // NEW: Import new routes
const accRoutes = require('./routes/accRoutes');
// const { scheduleEscalationSender } = require('./cron/sendEscalationCron');
const { scheduleAggregationCron } = require('./services/escalationAggregatorService');
const { schedulePDFCron } = require('./services/pdfService');

const app = express();

// const runPythonWorker = require('./python-workers/run_py'); // Import the Python worker script
// runPythonWorker(); // Run the Python worker immediately

const corsMiddleware = require('./middleware/cors');
app.use(corsMiddleware);

// Middleware
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(cookieParser());

// Session middleware for OAuth state management (server-side storage for CSRF protection)
app.use(session({
  secret: config.jwtSecret, // Use the same secret as JWT for consistency, or a separate one
  resave: false,
  saveUninitialized: true,
  // cookie: { secure: process.env.NODE_ENV === 'production' } // secure: true in production (HTTPS)
}));

// Health check endpoint (public)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend is healthy' });
});

app.use('/api/company', companyRoutes);

// Tenant Resolver Middleware (applies to all routes after this)
app.use(tenantResolver);

// Routes
app.use('/api/auth', authRoutes);

app.use('/api/email', require('./routes/emailRoutes')); // NEW: Import email routes TENTATIVE

app.use('/api/pdf', require('./routes/pdfRoutes')); // NEW: Import email routes TENTATIVE

app.get('/api/debug/jwt', (req, res) => {
  const token = req.cookies.jwt;
  res.json({ jwt: token });
});

app.use('/api/user', userRoutes); // Protected routes using JWT, also leverage tenantResolver
app.use('/api/workflows', workflowRoutes);
app.use('/api/autodesk', autodeskDataRoutes);
app.use('/api/escalation', escalationRoutes);

app.use('/api', accRoutes);

// Centralized Error Handling Middleware (must be last)
app.use(errorHandler);

if (process.env.NODE_ENV === 'production') {
  // Resolve the project root: go up from 'src' to 'server', then up again to 'your_project_root'
  const projectRoot = path.resolve(__dirname, '../');
  // Construct the full path to the client's build directory
  const clientBuildPath = path.join(projectRoot, 'client', 'dist');

  app.use(express.static(clientBuildPath));

  app.use((req, res) => {
    const indexPath = path.join(clientBuildPath, 'index.html');
    res.sendFile(indexPath);
  });
}

const AUTODESK_ACCESS_TOKEN = "eyJhbGciOiJSUzI1NiIsImtpZCI6IlZiakZvUzhQU3lYODQyMV95dndvRUdRdFJEa19SUzI1NiIsInBpLmF0bSI6ImFzc2MifQ.eyJzY29wZSI6WyJkYXRhOnJlYWQiLCJhY2NvdW50OnJlYWQiXSwiY2xpZW50X2lkIjoiREFJRTV1OVJvU3B1bjFSZ0dHblA1TGVGeVBucXhzVVoiLCJpc3MiOiJodHRwczovL2RldmVsb3Blci5hcGkuYXV0b2Rlc2suY29tIiwiYXVkIjoiaHR0cHM6Ly9hdXRvZGVzay5jb20iLCJqdGkiOiJmRDVoZFI1OEFCQlRGdW1NQlprTjlLSkUxV3VhVjVBcnZTYWEzNk5taEU5WmhURUY5VFIwNkVhQ3VhRFgzRXRBIiwidXNlcmlkIjoiN0xOMlFKNVpRRVdDQjcyQyIsImV4cCI6MTc1Mzk0Njg3OH0.Iqni4ajMOQoTCdwuAjuTPUkay0haOfpwYW6Z2GKd8ecrlzEqcwjhiCQ644FQO6BPTn1PBrQhyggXdiMHCrCCMAAsUwLZrgSOwptp_FwJf3HZCP0mQVB7KpzcVQmJC7tkmlCwwGCdHlRiW3M1n9U3gzurjwgHNB-MXO_YfwSw4tBA63JbAksq20K8F3dw8SbjXGXPTREHx18NRIHKtnCD1dNqRhNMmz-X9VvmT5EC3J9259xLvLJf2f2vWHLY7lw0xNWGCw7WEmsXvyHT5a3t0g5VnyP3dR9hxrenYySPRI6wEElVptj93c7TqbJFvxmTdE9XYlEXzinsOugO8M-d1A"

// Start CRON Scheduler (only if not in test environment)
if (process.env.NODE_ENV !== 'test') {
  // scheduleAggregationCron(AUTODESK_ACCESS_TOKEN); // Replace with actual token
  // schedulePDFCron(AUTODESK_ACCESS_TOKEN)
  // scheduleEscalationSender();
}

module.exports = app;