// src/config/database.js
const mongoose = require("mongoose");
const { db } = require("../config/config.js");
const { createLogger } = require("../utils/logger.js");
const logger = createLogger("Database");

/**
 * Singleton database connection manager
 */
class DatabaseManager {
  constructor() {
    this.isConnected = false;
    this.isShuttingDown = false;
    this.connectionPromise = null;

    // Mongoose connection options with improved resilience
    this.connectionOptions = {
      serverSelectionTimeoutMS: 5000, // Timeout for server selection
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      maxPoolSize: 10, // Maintain up to 10 socket connections
      autoIndex: process.env.NODE_ENV !== 'production', // Only build indexes in development
      retryWrites: true, // Retry failed writes
    };
  }

  /**
   * Connect to MongoDB with improved error handling
   * @returns {Promise<mongoose.Connection>} Mongoose connection
   */
  async connect() {
    if (this.isShuttingDown) {
      logger.warn("Connection attempt during shutdown - ignoring");
      return null;
    }

    // If we already have a connection or are in the process of connecting, return it
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    // Create a new connection promise
    this.connectionPromise = (async () => {
      try {
        // Connect to MongoDB with better options
        const conn = await mongoose.connect(db.uri, this.connectionOptions);
        logger.info(`MongoDB Connected: ${conn.connection.host}`);
        this.isConnected = true;
        
        // Set up connection event handlers
        this._setupEventHandlers();
        
        return conn;
      } catch (err) {
        logger.error("MongoDB connection error:", err);
        this.connectionPromise = null;
        
        if (process.env.NODE_ENV === 'production') {
          // In production, retry connection rather than crashing
          logger.info('Retrying connection in 5 seconds...');
          setTimeout(() => this.connect(), 5000);
          return null;
        } else {
          // In development, throw the error to make it obvious
          throw err;
        }
      }
    })();

    return this.connectionPromise;
  }

  /**
   * Set up MongoDB connection event handlers
   * @private
   */
  _setupEventHandlers() {
    mongoose.connection.on('error', (err) => {
      if (!this.isShuttingDown) {
        logger.error('MongoDB connection error:', err);
      }
    });
    
    mongoose.connection.on('disconnected', () => {
      this.isConnected = false;
      
      if (!this.isShuttingDown) {
        logger.warn('MongoDB disconnected. Attempting to reconnect...');
      }
    });
    
    mongoose.connection.on('reconnected', () => {
      this.isConnected = true;
      logger.info('MongoDB reconnected successfully');
    });
  }

  /**
   * Close the MongoDB connection gracefully
   * @param {string} source - What triggered the close (for logging)
   * @returns {Promise<void>}
   */
  async close(source) {
    // Prevent duplicate close operations
    if (this.isShuttingDown) {
      logger.debug(`Already closing connection, ignoring duplicate request from ${source}`);
      return Promise.resolve();
    }
    
    this.isShuttingDown = true;

    // If no connection has been established yet, return immediately
    if (!mongoose.connection || mongoose.connection.readyState === 0) {
      logger.info('No active MongoDB connection to close');
      return Promise.resolve();
    }

    logger.info(`Closing MongoDB connection due to ${source}`);
    
    // Return a promise that resolves when the connection is closed
    return new Promise((resolve, reject) => {
      mongoose.connection.close(false) // false = don't force close
        .then(() => {
          logger.info('MongoDB connection closed successfully');
          this.isConnected = false;
          this.connectionPromise = null;
          resolve();
        })
        .catch((err) => {
          logger.error('Error closing MongoDB connection:', err);
          this.connectionPromise = null;
          reject(err);
          resolve();
        });
    });
  }
}

// Create singleton instance
const dbManager = new DatabaseManager();

module.exports = {
  connectDB: () => dbManager.connect(),
  closeConnection: (source) => dbManager.close(source)
};
