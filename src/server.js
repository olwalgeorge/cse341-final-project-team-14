// src/server.js
const app = require("./app.js");
const config = require("./config/config.js");
const { createLogger } = require("./utils/logger.js");
const logger = createLogger('Server');

/**
 * Starts the server on the configured port and logs the server status.
 * Logs an error message if the server fails to start.
 */

const startServer = () => {
  try {
    app.listen(config.port, () => {
      logger.info(
        `Server running on at http://localhost:${config.port} in ${config.env} mode`
      );
    });
  } catch (error) {
    logger.error("Error starting server:", error);
  }
};

startServer();
