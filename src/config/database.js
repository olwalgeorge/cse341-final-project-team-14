// src/config/database.js
const mongoose = require("mongoose");
const { db } = require("../config/config.js");
const { createLogger } = require("../utils/logger.js");
const logger = createLogger("Database");

// Mongoose connection options with improved resilience
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000, // Timeout for server selection
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
  maxPoolSize: 10, // Maintain up to 10 socket connections
  autoIndex: false, // Don't build indexes in production
  retryWrites: true, // Retry failed writes
};

/**
 * Connect to MongoDB with improved error handling
 */
const connectDB = async () => {
  try {
    // Connect to MongoDB with better options
    const conn = await mongoose.connect(db.uri, mongooseOptions);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    
    // Set up connection event handlers
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
      // Don't exit process, let reconnection handle it
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...');
    });
    
    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected successfully');
    });
    
    // Handle application termination
    process.on('SIGINT', async () => {
      await closeConnection('SIGINT signal');
    });
    
    return conn;
  } catch (err) {
    logger.error("MongoDB connection error:", err);
    
    // Don't immediately exit on connection errors in production
    if (process.env.NODE_ENV === 'production') {
      logger.info('Retrying connection in 5 seconds...');
      setTimeout(connectDB, 5000); // Try to reconnect after 5 seconds
    } else {
      // In development, exit to make the error obvious
      process.exit(1);
    }
  }
};

/**
 * Close the MongoDB connection gracefully
 * @param {string} source - What triggered the close (for logging)
 * @returns {Promise<void>}
 */
const closeConnection = async (source) => {
  try {
    logger.info(`Closing MongoDB connection due to ${source}`);
    await mongoose.connection.close(false); // false = don't force close
    logger.info('MongoDB connection closed successfully');
  } catch (err) {
    logger.error('Error closing MongoDB connection:', err);
    // Don't throw, just log the error
  }
};

module.exports = { connectDB, closeConnection };
