/**
 * Authentication Utilities
 * 
 * Helper functions for authentication-related operations
 */
const jwt = require('jsonwebtoken');
const { createLogger } = require('./logger');

const logger = createLogger('AuthUtils');

// In-memory token blacklist (consider Redis for production)
const tokenBlacklist = new Set();

/**
 * Add a token to the blacklist
 * @param {String} token - JWT token to blacklist
 * @returns {Boolean} - True if token was successfully blacklisted
 */
function blacklistToken(token) {
  try {
    if (!token) return false;

    // Add to blacklist
    tokenBlacklist.add(token);
    logger.debug('Token added to blacklist');

    // Get token expiry time to know how long to keep it in blacklist
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      // Set timeout to remove from blacklist after expiry
      const expiryMs = decoded.exp * 1000 - Date.now();
      if (expiryMs > 0) {
        setTimeout(() => {
          tokenBlacklist.delete(token);
          logger.debug('Expired token removed from blacklist');
        }, expiryMs);
      }
    }

    return true;
  } catch (error) {
    logger.error('Error blacklisting token:', error);
    return false;
  }
}

/**
 * Check if a token is blacklisted
 * @param {String} token - JWT token to check
 * @returns {Boolean} - True if token is blacklisted
 */
function isTokenBlacklisted(token) {
  return tokenBlacklist.has(token);
}

module.exports = {
  blacklistToken,
  isTokenBlacklisted
};
