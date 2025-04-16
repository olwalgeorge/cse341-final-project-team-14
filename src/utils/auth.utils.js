/**
 * Authentication and Authorization Utilities
 */
const { createLogger } = require('./logger');
const { AuthError, DatabaseError } = require('./errors');
const Token = require('../models/token.model');
const User = require('../models/user.model');
const config = require('../config/config');

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
 * @throws {DatabaseError} If token blacklisting fails
 */
async function blacklistToken(token, userId, expiresAt, reason = 'LOGOUT') {
  try {
    if (!token || !userId) {
      throw new AuthError('Missing required parameters for token blacklisting');
    }
    
    if (!tokenConfig.useBlacklist) {
      logger.debug(`Token blacklisting skipped (disabled in config).`);
      return true;
    }

    await Token.blacklistToken(token, userId, expiresAt, reason);
    logger.info(`Token blacklisted for user ${userId}`);
    return true;
  } catch (error) {
    logger.error('Error blacklisting token:', error);
    
    if (error instanceof AuthError) {
      throw error;
    }
    
    throw DatabaseError.queryError('Failed to blacklist token');
  }
}

/**
 * Blacklist all tokens for a user
 * @param {String} userId - User ID
 * @throws {DatabaseError} If token invalidation fails
 */
async function blacklistAllUserTokens(userId) {
  try {
    if (!userId) {
      throw new AuthError('Missing user ID for token blacklisting');
    }
    
    // Always increment the token version regardless of blacklist setting
    if (tokenConfig.useVersioning) {
      const user = await User.findById(userId);
      
      if (!user) {
        throw DatabaseError.notFound('User', userId);
      }
      
      user.tokenVersion = (user.tokenVersion || 1) + 1;
      await user.save();
      
      logger.info(`All tokens for user ${userId} have been invalidated (version ${user.tokenVersion}).`);
    }

    if (tokenConfig.useBlacklist) {
      await Token.blacklistAllUserTokens(userId);
      logger.info(`All tokens blacklisted for user ${userId}`);
    }

    return true;
  } catch (error) {
    logger.error('Error blacklisting all user tokens:', error);
    
    if (error instanceof AuthError || error instanceof DatabaseError) {
      throw error;
    }
    
    throw DatabaseError.queryError('Failed to invalidate user tokens');
  }
}

/**
 * Clean up expired tokens in the database
 * This is handled automatically by MongoDB TTL index, but can be called manually
 * @returns {Promise<Number>} - Number of tokens removed
 * @throws {DatabaseError} If token cleanup fails
 */
async function cleanupExpiredTokens() {
  if (!tokenConfig.useBlacklist) {
    return 0;
  }
  
  try {
    const result = await Token.deleteMany({ 
      type: 'blacklisted', 
      expiresAt: { $lt: new Date() } 
    });
    
    logger.info(`Cleaned up ${result.deletedCount} expired tokens`);
    return result.deletedCount;
  } catch (error) {
    logger.error('Error cleaning up expired tokens:', error);
    throw DatabaseError.queryError('Failed to clean up expired tokens');
  }
}

module.exports = {
  hasRole,
  isOwnerOrAdmin,
  blacklistToken,
  blacklistAllUserTokens,
  cleanupExpiredTokens,
  ROLE_HIERARCHY
};
