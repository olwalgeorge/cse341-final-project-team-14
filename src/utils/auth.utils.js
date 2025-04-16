/**
 * Authentication and Authorization Utilities
 */
const { createLogger } = require('./logger');
const TokenBlacklist = require('../models/tokenBlacklist.model');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/user.model');

const logger = createLogger('Utils:Auth');

// Role hierarchy - higher roles inherit permissions from lower roles
const ROLE_HIERARCHY = {
  'USER': 0,
  'SUPERVISOR': 1,
  'MANAGER': 2, 
  'ADMIN': 3
};

// Configuration for token invalidation strategy
const tokenConfig = {
  useBlacklist: config.auth?.useTokenBlacklist || false, // Use database blacklist if true
  useVersioning: true, // Always use token versioning
};

/**
 * Check if a token is blacklisted
 * @param {String} token - JWT token
 * @returns {Boolean} True if token is blacklisted
 */
async function isTokenBlacklisted(token) {
  if (!tokenConfig.useBlacklist) {
    return false;
  }

  try {
    const blacklisted = await TokenBlacklist.findOne({ token });
    return !!blacklisted;
  } catch (error) {
    logger.error('Error checking token blacklist:', error);
    // If an error occurs, consider token invalid for security reasons
    return true;
  }
}

/**
 * Check if all tokens for a user are blacklisted
 * @param {String} userId - User ID
 * @returns {Boolean} True if all tokens for the user are blacklisted
 */
async function areAllUserTokensBlacklisted(userId) {
  if (!tokenConfig.useBlacklist) {
    return false;
  }

  try {
    const blacklisted = await TokenBlacklist.findOne({ 
      userId, 
      blacklistAll: true 
    });
    return !!blacklisted;
  } catch (error) {
    logger.error('Error checking user token blacklist:', error);
    // If an error occurs, consider tokens invalid for security reasons
    return true;
  }
}

/**
 * Check if a user has at least the specified minimum role
 * @param {String} userRole - User's role
 * @param {String} requiredRole - Minimum required role
 * @returns {Boolean} True if user has sufficient permission
 */
function hasRole(userRole, requiredRole) {
  if (!ROLE_HIERARCHY.hasOwnProperty(userRole) || !ROLE_HIERARCHY.hasOwnProperty(requiredRole)) {
    logger.warn(`Invalid role comparison: ${userRole} vs ${requiredRole}`);
    return false;
  }
  
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if user is owner of a resource or has admin rights
 * @param {String} userId - User's ID
 * @param {String} resourceUserId - Resource owner's ID
 * @param {String} userRole - User's role
 * @returns {Boolean} True if user is owner or has admin rights
 */
function isOwnerOrAdmin(userId, resourceUserId, userRole) {
  return userId === resourceUserId || userRole === 'ADMIN';
}

/**
 * Add a token to the blacklist
 * @param {String} token - JWT token to blacklist
 * @param {String} userId - User ID associated with the token
 * @param {Date} expiresAt - Token expiration date
 */
async function blacklistToken(token, userId, expiresAt) {
  if (!tokenConfig.useBlacklist) {
    logger.debug(`Token blacklisting skipped (disabled in config).`);
    return true;
  }

  try {
    await TokenBlacklist.create({
      token,
      userId,
      expiresAt,
      blacklistAll: false
    });
    logger.info(`Token blacklisted for user ${userId}`);
    return true;
  } catch (error) {
    logger.error('Error blacklisting token:', error);
    return false;
  }
}

/**
 * Blacklist all tokens for a user
 * @param {String} userId - User ID
 */
async function blacklistAllUserTokens(userId) {
  try {
    // Always increment the token version regardless of blacklist setting
    if (tokenConfig.useVersioning) {
      const user = await User.findById(userId);
      
      if (!user) {
        logger.warn(`Attempted to blacklist tokens for non-existent user: ${userId}`);
        return false;
      }
      
      user.tokenVersion = (user.tokenVersion || 1) + 1;
      await user.save();
      
      logger.info(`All tokens for user ${userId} have been invalidated (version ${user.tokenVersion}).`);
    }

    if (tokenConfig.useBlacklist) {
      await TokenBlacklist.create({
        userId,
        blacklistAll: true,
        blacklistedAt: new Date()
      });
      logger.info(`All tokens blacklisted for user ${userId}`);
    }

    return true;
  } catch (error) {
    logger.error('Error blacklisting all user tokens:', error);
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
    const result = await TokenBlacklist.deleteMany({ expiresAt: { $lt: new Date() } });
    logger.info(`Cleaned up ${result.deletedCount} expired tokens`);
    return result.deletedCount;
  } catch (error) {
    logger.error('Error cleaning up expired tokens:', error);
    return 0;
  }
}

module.exports = {
  isTokenBlacklisted,
  areAllUserTokensBlacklisted,
  hasRole,
  isOwnerOrAdmin,
  blacklistToken,
  blacklistAllUserTokens,
  cleanupExpiredTokens,
  ROLE_HIERARCHY
};
