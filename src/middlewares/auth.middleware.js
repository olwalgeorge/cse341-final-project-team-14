// src/middlewares/auth.middleware.js

/**
 * Authentication & Authorization Middleware
 * 
 * Provides middleware functions to protect routes with authentication and role-based authorization
 */

const { verifyToken, extractTokenFromRequest } = require('../auth/jwt');
const { createLogger } = require('../utils/logger');
const { AuthError } = require('../utils/errors');
const { hasRole } = require('../utils/auth.utils');

const logger = createLogger('Middleware:Auth');

/**
 * Middleware to authenticate requests using JWT
 * This should be used before any route that requires authentication
 */
const authenticate = async (req, res, next) => {
  try {
    // Extract token from the request
    const token = extractTokenFromRequest(req);

    if (!token) {
      logger.warn('No authentication token provided');
      return next(AuthError.unauthorized('Authentication required. Please provide a valid token.'));
    }

    // Verify the token
    const decoded = await verifyToken(token);
    
    if (!decoded) {
      logger.warn('Invalid or expired token provided');
      return next(AuthError.unauthorized('Invalid or expired token. Please log in again.'));
    }

    // Attach user info to the request object for use in route handlers
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return next(AuthError.unauthorized('Authentication failed.'));
  }
};

/**
 * Middleware factory to restrict access based on user roles
 * @param {Array|String} roles - Authorized role(s) for the route
 * @returns {Function} Middleware function
 */
const authorize = (roles) => {
  // Convert string to array if a single role is provided
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    try {
      // Check if user exists (authenticate middleware should be called first)
      if (!req.user) {
        logger.warn('Authorization attempted without authentication');
        return next(AuthError.unauthorized('Authentication required before authorization.'));
      }

      // Check if user has sufficient role based on hierarchy
      const hasPermission = allowedRoles.some(role => 
        hasRole(req.user.role, role)
      );

      if (!hasPermission) {
        logger.warn(`Access denied for user ${req.user.userId} with role ${req.user.role}`);
        return next(AuthError.forbidden(`You do not have permission to access this resource. Required role: ${allowedRoles.join(' or ')}`));
      }

      // User has appropriate role
      next();
    } catch (error) {
      logger.error('Authorization error:', error);
      return next(AuthError.forbidden('Authorization failed.'));
    }
  };
};

/**
 * Middleware to check if user is requesting their own resource
 * Useful for routes that should only allow users to access their own data
 * @param {Function} extractResourceUserId - Function to extract user ID from request
 */
const authorizeOwnership = (extractResourceUserId) => {
  return async (req, res, next) => {
    try {
      const resourceUserId = await extractResourceUserId(req);
      
      // Allow admins to access any resource
      if (req.user.role === 'ADMIN') {
        return next();
      }
      
      // Check if the resource belongs to the requesting user
      if (req.user.userId !== resourceUserId) {
        logger.warn(`User ${req.user.userId} attempted to access resource owned by ${resourceUserId}`);
        return next(AuthError.forbidden('You do not have permission to access this resource. You can only access your own data.'));
      }
      
      next();
    } catch (error) {
      logger.error('Ownership authorization error:', error);
      return next(AuthError.forbidden('Authorization failed when checking resource ownership.'));
    }
  };
};

// For backward compatibility with existing code
// This makes the default export function as the authenticate middleware
// while still allowing destructured imports for the new API
const isAuthenticated = authenticate;

// Export both the new object-based API and the legacy function
module.exports = isAuthenticated;

// Add the new functions as properties to maintain the new object-based API
module.exports.authenticate = authenticate;
module.exports.authorize = authorize;
module.exports.authorizeOwnership = authorizeOwnership;
