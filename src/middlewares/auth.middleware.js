// src/middlewares/auth.middleware.js

/**
 * Authentication & Authorization Middleware
 * 
 * Provides middleware functions to protect routes with authentication and role-based authorization
 * Supports both JWT token and session-based authentication
 */

const { verifyToken, extractTokenFromRequest } = require('../auth/jwt');
const { createLogger } = require('../utils/logger');
const { AuthError } = require('../utils/errors');
const { hasRole } = require('../utils/auth.utils');
const User = require('../models/user.model');

const logger = createLogger('Middleware:Auth');

/**
 * Middleware to authenticate requests using either JWT or session
 * This should be used before any route that requires authentication
 */
const authenticate = async (req, res, next) => {
  try {
    // First check if user is already authenticated via session (Passport.js)
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      logger.debug('User authenticated via session');
      // If we have a session but not all user data, fetch additional data if needed
      if (!req.user._id && req.user.sub) {
        // If we only have JWT data in the session, fetch full user
        try {
          const user = await User.findById(req.user.sub);
          if (user) {
            req.user = user;
          }
        } catch (err) {
          logger.error('Error fetching full user data from JWT session:', err);
        }
      }
      return next();
    }

    // If no session, try JWT authentication
    const token = extractTokenFromRequest(req);

    if (!token) {
      logger.warn('No authentication token provided and no active session found');
      return next(AuthError.unauthorized('Authentication required. Please log in.'));
    }

    // Verify the JWT token
    const decoded = await verifyToken(token);
    
    if (!decoded) {
      logger.warn('Invalid or expired token provided');
      return next(AuthError.unauthorized('Invalid or expired token. Please log in again.'));
    }

    // Set the user info from the JWT
    req.user = decoded;
    
    // Optionally, fetch the full user from database if needed
    try {
      const user = await User.findById(decoded.sub);
      if (user) {
        // Merge JWT data with user data from database
        req.user = { ...decoded, ...user.toObject() };
      }
    } catch (err) {
      // Continue even if this fails, we already have the essential JWT data
      logger.debug('Could not fetch full user data for JWT token:', err);
    }

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
        logger.warn(`Access denied for user ${req.user._id || req.user.userId || req.user.sub} with role ${req.user.role}`);
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

/**
 * Middleware to apply rate limiting with exemptions
 * @param {Function} limiter - Rate limiting function
 * @returns {Function} Middleware function
 */
const applyRateLimit = (limiter) => {
  return async (req, res, next) => {
    try {
      // Skip rate limiting for exempt users
      if (req.user && req.user.rateLimitExemptUntil && new Date(req.user.rateLimitExemptUntil) > new Date()) {
        return next();
      }
      
      // Apply rate limiting for non-exempt users
      return limiter(req, res, next);
    } catch (error) {
      next(error);
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
module.exports.applyRateLimit = applyRateLimit;
