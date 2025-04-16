// src/server.js
const app = require("./app.js");
const config = require("./config/config.js");
const { createLogger } = require("./utils/logger.js");
const { closeConnection } = require("./config/database.js");
const logger = createLogger('Server');

/**
 * Manages the server lifecycle, including graceful shutdown
 */
class ServerManager {
  constructor() {
    this.server = null;
    this.shuttingDown = false;
    this.initializeServer();
    this.setupSignalHandlers();
  }
  
  /**
   * Initialize the HTTP server
   */
  initializeServer() {
    try {
      // Create HTTP server
      this.server = app.listen(config.port, () => {
        logger.info(`Server running at http://localhost:${config.port} in ${config.env} mode`);
      });

      // Set up server error handler
      this.server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          logger.error(`Port ${config.port} is already in use. Please choose a different port.`);
        } else {
          logger.error('Server error:', error);
        }
        this.exitProcess(1);
      });
      
      // Track active connections for clean shutdown
      this.activeConnections = new Set();
      
      this.server.on('connection', (connection) => {
        this.activeConnections.add(connection);
        connection.on('close', () => {
          this.activeConnections.delete(connection);
        });
      });
    } catch (error) {
      logger.error("Failed to initialize server:", error);
      this.exitProcess(1);
    }
  }
  
  /**
   * Set up handlers for process signals and uncaught errors
   */
  setupSignalHandlers() {
    // Handle process signals
    process.on('SIGTERM', () => this.initiateShutdown('SIGTERM signal'));
    process.on('SIGINT', () => this.initiateShutdown('SIGINT signal (Ctrl+C)'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('UNCAUGHT EXCEPTION! 💥', error);
      this.initiateShutdown('uncaught exception', error);
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('UNHANDLED REJECTION! 💥 Shutting down...', reason);
      logger.error(`Promise: ${promise}`);
      this.initiateShutdown('unhandled rejection', reason);
    });
  }
  
  /**
   * Start the graceful shutdown sequence
   * @param {string} source - What triggered the shutdown
   * @param {Error} [error] - Optional error that triggered shutdown
   */
  initiateShutdown(source, error = null) {
    // Prevent multiple shutdown attempts
    if (this.shuttingDown) return;
    this.shuttingDown = true;
    
    logger.info(`${source} received. Starting graceful shutdown...`);
    
    if (error) {
      logger.error('Error details:', error);
    }
    
    // Use async/await and wrap in try/catch to ensure we can handle any errors
    (async () => {
      try {
        await this.performShutdown(source, error);
      } catch (shutdownError) {
        logger.error('Critical error during shutdown:', shutdownError);
        // Force exit after a short delay to ensure logs are flushed
        setTimeout(() => process.exit(1), 1000);
      }
    })();
  }
  
  /**
   * Execute the actual shutdown process in proper sequence
   * @param {string} source - Shutdown trigger source
   * @param {Error} error - Optional error object
   */
  async performShutdown(source, error) {
    // 1. Stop accepting new connections
    if (this.server) {
      logger.info('Closing HTTP server, stopping new connections...');
      
      // Close server in a promise to handle both sync and async scenarios
      await new Promise((resolve) => {
        this.server.close((err) => {
          if (err) {
            logger.error('Error closing HTTP server:', err);
          } else {
            logger.info('HTTP server closed successfully');
          }
          resolve();
        });
      });
    }
    
    // 2. Close any active connections for clean exit
    if (this.activeConnections.size > 0) {
      logger.info(`Terminating ${this.activeConnections.size} active connections...`);
      for (const conn of this.activeConnections) {
        try {
          conn.destroy();
        } catch (err) {
          /* Silent fail for connection destruction errors */
        }
      }
      this.activeConnections.clear();
    }
    
    // 3. Close database connection - MAKE SURE to await this properly
    logger.info('Closing database connections...');
    await closeConnection(source);
    
    // 4. Additional cleanup in production
    if (config.env === 'production') {
      logger.info('Running production-specific cleanup...');
      // Add any production-specific cleanup here
    }
    
    // Log successful shutdown
    logger.info('Graceful shutdown completed successfully');
    
    // Exit with appropriate code after ensuring logs are flushed
    this.exitProcess(error ? 1 : 0);
  }
  
  /**
   * Exit the process safely with proper log flushing
   * @param {number} code - Exit code (0 = success, 1 = error)
   */
  exitProcess(code) {
    // Use a longer delay to ensure logs are completely flushed
    // This is particularly important for Winston or other async loggers
    setTimeout(() => {
      // Add empty line for cleaner terminal output (especially in Windows)
      if (process.stdout.isTTY) {
        process.stdout.write('\n');
      }
      
      // Forcibly exit process
      process.exit(code);
    }, 1000);  // 1000ms (1 second) is much safer for ensuring logs flush
  }
}

// Initialize server manager as the only instance
const serverManager = new ServerManager();

// Export for testing purposes
module.exports = serverManager;
