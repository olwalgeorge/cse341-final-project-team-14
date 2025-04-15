// src/server.js
const app = require("./app.js");
const config = require("./config/config.js");
const { createLogger } = require("./utils/logger.js");
const mongoose = require("mongoose");
const logger = createLogger('Server');

/**
 * Gracefully shutdown the application with proper cleanup
 * @param {Error} error - The error that triggered the shutdown
 * @param {string} source - Source of the shutdown trigger (uncaught, unhandled, etc.)
 */
const gracefulShutdown = async (error, source) => {
  try {
    logger.error(`${source}! 💥 Shutting down...`, error);
    logger.error(error.stack);

    // Close database connections
    if (mongoose.connection.readyState !== 0) { // If connection is not closed
      logger.info('Closing database connections...');
      await mongoose.connection.close();
      logger.info('Database connections closed');
    }

    // In production, perform additional cleanup operations
    if (config.env === 'production') {
      // Additional production-specific cleanup operations can be added here
      logger.info('Production cleanup completed');
    }

    logger.info('Graceful shutdown complete');
    
    // Exit with error code
    process.exit(1);
  } catch (cleanupError) {
    logger.error('Error during graceful shutdown:', cleanupError);
    process.exit(1); // Force exit even if cleanup fails
  }
};

/**
 * Global error handlers for uncaught exceptions and unhandled rejections
 * These are critical for preventing server crashes
 */
process.on('uncaughtException', (error) => {
  gracefulShutdown(error, 'UNCAUGHT EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...', reason);
  logger.error(`Promise: ${promise}`);
  
  // Instead of immediately exiting, we close the server gracefully
  // This allows existing connections to complete
  server.close(() => {
    gracefulShutdown(reason, 'UNHANDLED REJECTION');
  });
});

// Add a graceful shutdown function for SIGTERM signals
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Shutting down gracefully.');
  server.close(async () => {
    try {
      // Close database connections
      if (mongoose.connection.readyState !== 0) {
        logger.info('Closing database connections...');
        await mongoose.connection.close();
        logger.info('Database connections closed');
      }
      logger.info('Process terminated.');
      process.exit(0);
    } catch (err) {
      logger.error('Error during SIGTERM cleanup:', err);
      process.exit(1);
    }
  });
});

/**
 * Starts the server on the configured port and logs the server status.
 * Logs an error message if the server fails to start.
 */
const startServer = () => {
  try {
    const server = app.listen(config.port, () => {
      logger.info(
        `Server running on at http://localhost:${config.port} in ${config.env} mode`
      );
    });

    // Define server error handler
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${config.port} is already in use. Please choose a different port.`);
      } else {
        logger.error('Server error:', error);
      }
      process.exit(1);
    });
    
    return server;
  } catch (error) {
    logger.error("Error starting server:", error);
    process.exit(1);
  }
};

const server = startServer();
