const os = require('os');
const mongoose = require('mongoose');
const { createLogger } = require('../utils/logger');

const logger = createLogger('HealthMiddleware');

/**
 * Simple health check middleware for load balancers and monitoring tools
 * @returns {Function} Express middleware function
 */
const healthCheck = (req, res) => {
  const healthData = {
    status: 'UP',
    timestamp: new Date(),
    uptime: process.uptime(),
    host: os.hostname()
  };
  
  logger.debug('Health check executed');
  res.status(200).json(healthData);
};

/**
 * Detailed server status middleware with comprehensive system information
 * @returns {Function} Express middleware function
 */
const serverStatus = (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  }[dbState] || "unknown";

  const memoryUsage = process.memoryUsage();
  
  const serverStatusData = {
    status: 'operational',
    timestamp: new Date(),
    server: {
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform,
      hostname: os.hostname(),
      cpus: os.cpus().length,
      memoryFree: os.freemem(),
      memoryTotal: os.totalmem()
    },
    process: {
      pid: process.pid,
      memoryUsage: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`
      }
    },
    database: {
      status: dbStatus,
      connectionState: dbState
    }
  };

  logger.debug('Server status check executed');
  res.status(200).json(serverStatusData);
};

module.exports = {
  healthCheck,
  serverStatus
};