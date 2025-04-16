// src/server.js
const app = require("./app.js");
const config = require("./config/config.js");
const { createLogger } = require("./utils/logger.js");
const { closeConnection } = require("./config/database.js");
const { validateEnvironment, logEnvironmentSummary } = require("./validators/envValidator.js");
const logger = createLogger('Server');

/**
 * Manages the server lifecycle, including graceful shutdown
 */
class ServerManager {
  constructor() {
    this.server = null;
    this.setupShutdownHandlers();
  }

  /**
   * Initialize and start the server
   */
  async start() {
    try {
      // Validate environment variables before proceeding
      const validationResult = validateEnvironment();
      
      // Log environment summary regardless of validation result
      logEnvironmentSummary(validationResult);
      
      if (!validationResult.success) {
        logger.error('Server initialization failed due to invalid environment configuration:');
        validationResult.errors.forEach(err => {
          logger.error(`- ${err.name}: ${err.value}`);
        });
        
        // Create a structured error report
        const errorReport = {
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development',
          errors: validationResult.errors.map(err => ({
            variable: err.name,
            status: err.value
          })),
          message: 'Server cannot start with invalid configuration'
        };
        
        // Log structured error for easier parsing
        logger.error('STRUCTURED_ERROR', errorReport);
        
        process.exit(1);
      }

      // Start the HTTP server
      const port = config.port;
      this.server = app.listen(port, () => {
        logger.info(`Server running on ${config.env === 'production' ? config.appUrl : `http://localhost:${port}`} in ${config.env} mode`);
        logger.info(`API Documentation: ${config.env === 'production' ? config.appUrl : `http://localhost:${port}`}/api-docs`);
      });

    } catch (error) {
      logger.error("Failed to start server:", error);
      process.exit(1);
    }
  }

  /**
   * Set up handlers for process termination signals
   */
  setupShutdownHandlers() {
    // Handle normal termination
    process.on("SIGTERM", () => {
      logger.info("SIGTERM signal received, shutting down gracefully");
      this.shutdown();
    });

    // Handle interrupt (e.g., Ctrl+C)
    process.on("SIGINT", () => {
      logger.info("SIGINT signal received, shutting down gracefully");
      this.shutdown();
    });

    // Handle unhandled exceptions and rejections
    process.on("uncaughtException", (err) => {
      logger.error("Uncaught exception:", err);
      this.shutdown(1);
    });

    process.on("unhandledRejection", (reason, promise) => {
      logger.error("Unhandled Rejection at:", promise, "reason:", reason);
      this.shutdown(1);
    });
  }

  /**
   * Perform graceful shutdown
   */
  async shutdown(exitCode = 0) {
    logger.info("Shutting down server...");

    if (this.server) {
      // Close the HTTP server first
      await new Promise(resolve => {
        this.server.close(() => {
          logger.info("HTTP server closed");
          resolve();
        });
      });
    }

    try {
      // Close database connections
      await closeConnection();
      logger.info("Database connections closed");
    } catch (err) {
      logger.error("Error closing database connection:", err);
      exitCode = 1;
    }

    logger.info(`Server shutdown complete with exit code ${exitCode}`);
    process.exit(exitCode);
  }
}

// Initialize server manager as the only instance
const serverManager = new ServerManager();

// Start the server
serverManager.start();

// Export for testing purposes
module.exports = serverManager;
