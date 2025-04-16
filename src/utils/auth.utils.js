/**
 * Authentication Utilities
 * 
 * Helper functions for authentication-related operations
 */
const jwt = require('jsonwebtoken');
const { createLogger } = require('./logger');
const Token = require('../models/token.model');

const logger = createLogger('AuthUtils');

/**
 * Add a token to the blacklist
 * @param {String} token - JWT token to blacklist
 * @param {String} reason - Reason for blacklisting (logout, password_changed, etc.)
 * @param {String} ipAddress - IP address of the requester
 * @returns {Promise<Boolean>} - True if token was successfully blacklisted
 */
async function blacklistToken(token, reason = 'logout', ipAddress = null) {
  try {
    if (!token) return false;

    // Decode token to extract user ID and expiration
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      logger.warn('Could not decode token for blacklisting');
      return false;
    }

    // Convert expiration timestamp to Date object
    const expiresAt = new Date(decoded.exp * 1000);
    
    // Add token to database blacklist
    return await Token.blacklist(
      token,
      decoded.sub,
      expiresAt,
      reason,
      ipAddress
    );
  } catch (error) {
    logger.error('Error blacklisting token:', error);
    return false;
  }
}

/**
 * Check if a token is blacklisted
 * @param {String} token - JWT token to check
 * @returns {Promise<Boolean>} - True if token is blacklisted
 */
async function isTokenBlacklisted(token) {
  return await Token.isBlacklisted(token);
}

/**
 * Clean up expired tokens in the database
 * This is handled automatically by MongoDB TTL index, but can be called manually
 * @returns {Promise<Number>} - Number of tokens removed
 */
async function cleanupExpiredTokens() {
  return await Token.cleanupExpired();
}

module.exports = {
  blacklistToken,
  isTokenBlacklisted,
  cleanupExpiredTokens
};
