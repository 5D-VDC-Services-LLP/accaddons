// src/app.js
const express = require('express');
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
// const { scheduleEscalationSender } = require('./cron/sendEscalationCron');
const { scheduleAggregationCron } = require('./services/escalationAggregatorService');

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
  cookie: { secure: process.env.NODE_ENV === 'production' } // secure: true in production (HTTPS)
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

app.get('/api/debug/jwt', (req, res) => {
  const token = req.cookies.jwt;
  res.json({ jwt: token });
});

app.use('/api/user', userRoutes); // Protected routes using JWT, also leverage tenantResolver
app.use('/api/workflows', workflowRoutes);
app.use('/api/autodesk', autodeskDataRoutes);
app.use('/api/escalation', escalationRoutes);

// Centralized Error Handling Middleware (must be last)
app.use(errorHandler);

const AUTODESK_ACCESS_TOKEN = "eyJhbGciOiJSUzI1NiIsImtpZCI6IlhrUFpfSmhoXzlTYzNZS01oRERBZFBWeFowOF9SUzI1NiIsInBpLmF0bSI6ImFzc2MifQ.eyJzY29wZSI6WyJkYXRhOnJlYWQiLCJhY2NvdW50OnJlYWQiXSwiY2xpZW50X2lkIjoiREFJRTV1OVJvU3B1bjFSZ0dHblA1TGVGeVBucXhzVVoiLCJpc3MiOiJodHRwczovL2RldmVsb3Blci5hcGkuYXV0b2Rlc2suY29tIiwiYXVkIjoiaHR0cHM6Ly9hdXRvZGVzay5jb20iLCJqdGkiOiJrQzE5V3J3cWlNWHlSaU9PSU5HRGRYVmF0SUp1YTlyVUNOWk5TblFucGtkWHlHUWxzNXNBR040bGdzS09Hc0dvIiwiZXhwIjoxNzUyMDcxMjMwLCJ1c2VyaWQiOiI3TE4yUUo1WlFFV0NCNzJDIn0.OV1IDGI1UhxvkgmgCpsfrfhlxtco9KbkrfmsEGQm8g3elf4ngMPlqoQSb1IBtTOH_V3mMV9-N5y9GGhDqbrDCsXETeuslJz4MzGv08F4PtKnh_2QynyX9pcfezI9absyKCd44iLjiRuGRzlzqdRkKhoQjpIonAg_2i45p4sOszjDSxWGZrSl9xLDNQigiodSPLzukY7CFKzhgLJ7xaJwBBhA09la-kAEh4rSwiiHYxEFvGxR37UiHLHYfHf4rHiVw8YsjvOJlCZwOW93qk_fKeLz8lRJfZmELVv99-tJcQfm-TL9wOy-HYgK1PPGdCWp7ALSAeNob0wBVzAbPmycgA"

// Start CRON Scheduler (only if not in test environment)
if (process.env.NODE_ENV !== 'test') {
  scheduleAggregationCron(AUTODESK_ACCESS_TOKEN); // Replace with actual token
  // scheduleEscalationSender();
}

module.exports = app;