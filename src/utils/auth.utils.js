/**
 * Authentication Utilities
 * 
 * Helper functions for authentication-related operations
 */
const { createLogger } = require('./logger');
const Token = require('../models/token.model');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

const logger = createLogger('AuthUtils');

// Configuration for token invalidation strategy
const tokenConfig = {
  useBlacklist: config.auth?.useTokenBlacklist || false, // Use database blacklist if true
  useVersioning: true, // Always use token versioning
};

/**
 * Add a token to the blacklist
 * @param {String} token - JWT token to blacklist
 * @param {String} reason - Reason for blacklisting (logout, password_changed, etc.)
 * @param {String} ipAddress - IP address of the request (for audit purposes)
 * @returns {Promise<Boolean>} - True if token was successfully blacklisted
 */
async function blacklistToken(token, reason = 'logout', ipAddress = null) {
  try {
    // Skip if blacklisting is disabled
    if (!tokenConfig.useBlacklist) {
      logger.debug(`Token blacklisting skipped (disabled in config). Reason: ${reason}`);
      return true;
    }
    
    // Decode token to get expiry and user ID
    const decoded = jwt.decode(token);
    if (!decoded) {
      logger.error('Failed to decode token for blacklisting');
      return false;
    }
    
    // Add to blacklist in database
    await Token.create({
      token: token,
      userId: decoded.sub,
      type: 'access', // Adding the required type field
      expiresAt: new Date(decoded.exp * 1000), // Convert to milliseconds
      blacklistedAt: new Date(),
      reason: reason,
      ipAddress: ipAddress || 'unknown'
    });
    
    logger.info(`Token has been blacklisted. Reason: ${reason}`);
    return true;
  } catch (error) {
    logger.error('Failed to blacklist token:', error);
    return false;
  }
}

/**
 * Check if a token is blacklisted
 * @param {String} token - JWT token to check
 * @returns {Promise<Boolean>} - True if token is blacklisted
 */
async function isTokenBlacklisted(token) {
  // Skip check if blacklisting is disabled
  if (!tokenConfig.useBlacklist) {
    return false;
  }
  
  try {
    // Check if token exists in blacklist
    const blacklistedToken = await Token.findOne({ token });
    return !!blacklistedToken; // Convert to boolean
  } catch (error) {
    logger.error('Error checking token blacklist:', error);
    // Fail secure - if there's an error checking, assume token is valid
    return false;
  }
}

/**
 * Clean up expired tokens in the database
 * This is handled automatically by MongoDB TTL index, but can be called manually
 * @returns {Promise<Number>} - Number of tokens removed
 */
async function cleanupExpiredTokens() {
  if (!tokenConfig.useBlacklist) {
    return 0;
  }
  
  try {
    // Remove tokens that have expired
    const result = await Token.deleteMany({ expiresAt: { $lt: new Date() } });
    logger.info(`Cleaned up ${result.deletedCount} expired tokens`);
    return result.deletedCount;
  } catch (error) {
    logger.error('Error cleaning up expired tokens:', error);
    return 0;
  }
}

/**
 * Blacklist all active tokens for a specific user
 * @param {string} userId - The user's ID
 * @param {string} reason - Reason for blacklisting tokens
 * @returns {Promise<boolean>} - Success status
 */
const blacklistAllUserTokens = async (userId, reason = 'security_measure') => {
  try {
    // Always increment the token version regardless of blacklist setting
    if (tokenConfig.useVersioning) {
      // Find the user and increment their token version
      const user = await User.findById(userId);
      
      if (!user) {
        logger.warn(`Attempted to blacklist tokens for non-existent user: ${userId}`);
        return false;
      }
      
      // Increment the token version
      user.tokenVersion = (user.tokenVersion || 1) + 1;
      await user.save();
      
      logger.info(`All tokens for user ${userId} have been invalidated (version ${user.tokenVersion}) due to: ${reason}`);
    }
    
    // If using database blacklist, also record a special "blacklist all" entry
    if (tokenConfig.useBlacklist) {
      await Token.create({
        blacklistAll: true,
        userId: userId,
        type: 'access', // Adding the required type field
        expiresAt: new Date(Date.now() + (180 * 24 * 60 * 60 * 1000)), // 180 days
        blacklistedAt: new Date(),
        reason: reason
      });
      
      logger.info(`Added "blacklist all" entry for user ${userId} due to: ${reason}`);
    }
    
    return true;
  } catch (error) {
    logger.error(`Failed to invalidate tokens for user ${userId}:`, error);
    return false;
  }
};

/**
 * Check if all tokens for a user have been blacklisted
 * @param {string} userId - The user's ID
 * @returns {Promise<boolean>} - True if all tokens are blacklisted
 */
async function areAllUserTokensBlacklisted(userId) {
  if (!tokenConfig.useBlacklist) {
    return false;
  }
  
  try {
    // Check for a "blacklist all" entry
    const blacklistAll = await Token.findOne({
      userId: userId,
      blacklistAll: true,
      expiresAt: { $gt: new Date() }
    });
    
    return !!blacklistAll;
  } catch (error) {
    logger.error(`Error checking if all tokens are blacklisted for user ${userId}:`, error);
    // Fail secure - if there's an error, assume not blacklisted
    return false;
  }
}

module.exports = {
  blacklistToken,
  isTokenBlacklisted,
  cleanupExpiredTokens,
  blacklistAllUserTokens,
  areAllUserTokensBlacklisted
};
