// src/server.js
const app = require('./app');
const config = require('./config');
const { pool: pgPool } = require('./db/postgres'); // Ensure PostgreSQL pool is initialized
const { closeAllMongoDBConnections } = require('./db/mongodb'); // For graceful shutdown

const PORT = config.port;

const startServer = async () => {
  try {
    // Test PostgreSQL connection
    await pgPool.query('SELECT 1');
    console.log('PostgreSQL database connection tested successfully.');

    // Start the Express server
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      if (app._router && app._router.stack) {
      app._router.stack.forEach((middleware) => {
        if (middleware.route) {
          console.log('Registered route:', middleware.route.path);
        }
    });
  }
      console.log(`Access backend at http://localhost:${PORT}`);
      console.log(`Main Domain for Multi-tenancy: ${config.mainDomain}`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM signal received: Closing HTTP server.');
      server.close(async () => {
        console.log('HTTP server closed.');
        await pgPool.end(); // Close PostgreSQL pool
        await closeAllMongoDBConnections(); // Close all active MongoDB connections
        console.log('Database connections closed. Exiting process.');
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      console.log('SIGINT signal received: Closing HTTP server.');
      server.close(async () => {
        console.log('HTTP server closed.');
        await pgPool.end(); // Close PostgreSQL pool
        await closeAllMongoDBConnections(); // Close all active MongoDB connections
        console.log('Database connections closed. Exiting process.');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();