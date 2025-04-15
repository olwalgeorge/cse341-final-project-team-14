const { createLogger } = require('../utils/logger');
const { healthCheck, serverStatus } = require('../middlewares/health.middleware');

const logger = createLogger('HealthController');

/**
 * Controller for health-related endpoints
 */
const healthController = {
  /**
   * Basic health check endpoint for load balancers and monitoring tools
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getHealth: (req, res) => {
    logger.debug('Health check requested');
    return healthCheck(req, res);
  },

  /**
   * Detailed server status information endpoint
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getStatus: (req, res) => {
    logger.debug('Server status requested');
    return serverStatus(req, res);
  }
};

module.exports = healthController;