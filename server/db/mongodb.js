// src/db/mongodb.js
const mongoose = require('mongoose');
const config = require('../config');

// Use a Map to store active connections for different MongoDB URIs
const mongoConnections = new Map();

/**
 * Establishes and manages a MongoDB connection for a given URI.
 * Reuses existing connections if available.
 * @param {string} mongoUri - The MongoDB connection URI for a specific tenant.
 * @returns {Promise<mongoose.Connection>} - The Mongoose connection object.
 */
const getMongoDBConnection = async (mongoUri) => {
  if (!mongoUri) {
    console.error('MongoDB URI is undefined or null.');
    throw new Error('MongoDB URI is required to establish a connection.');
  }

  // Check if a connection for this URI already exists and is ready
  if (mongoConnections.has(mongoUri) && mongoConnections.get(mongoUri).readyState === 1) {
    return mongoConnections.get(mongoUri);
  }

  console.log(`Attempting to connect to MongoDB: ${mongoUri.substring(0, mongoUri.indexOf('@') + 1)}...`); // Log without password

  try {
    // Create a new connection instance
    const connection = await mongoose.createConnection(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 2, // Minimum pool size
      family: 4, // Use IPv4, skip trying IPv6
    });

    connection.on('connected', () => {
      console.log(`Mongoose connected to ${mongoUri.substring(0, mongoUri.indexOf('@') + 1)}...`);
    });

    connection.on('error', (err) => {
      console.error(`Mongoose connection error for ${mongoUri.substring(0, mongoUri.indexOf('@') + 1)}...:`, err);
      // Remove the faulty connection from the map
      mongoConnections.delete(mongoUri);
    });

    connection.on('disconnected', () => {
      console.warn(`Mongoose disconnected from ${mongoUri.substring(0, mongoUri.indexOf('@') + 1)}...`);
      // Remove disconnected connection from the map
      mongoConnections.delete(mongoUri);
    });

    // Store the new connection in the map
    mongoConnections.set(mongoUri, connection);
    return connection;

  } catch (error) {
    console.error(`Failed to connect to MongoDB at ${mongoUri.substring(0, mongoUri.indexOf('@') + 1)}...:`, error);
    throw error;
  }
};

/**
 * Closes all active MongoDB connections.
 */
const closeAllMongoDBConnections = async () => {
  for (const [uri, conn] of mongoConnections.entries()) {
    if (conn.readyState === 1) { // Only close if connected
      try {
        await conn.close();
        console.log(`Closed MongoDB connection for: ${uri.substring(0, uri.indexOf('@') + 1)}...`);
      } catch (error) {
        console.error(`Error closing MongoDB connection for ${uri.substring(0, uri.indexOf('@') + 1)}...:`, error);
      }
    }
    mongoConnections.delete(uri); // Remove from map regardless
  }
  console.log('All MongoDB connections closed.');
};

module.exports = {
  getMongoDBConnection,
  closeAllMongoDBConnections,
};