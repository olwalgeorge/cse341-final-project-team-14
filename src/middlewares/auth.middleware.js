// src/middlewares/auth.middleware.js

/**
 * Authentication Middleware
 * 
 * Handles user authentication via session or JWT
 */
const { verifyToken, extractTokenFromRequest } = require('../auth/jwt');
const { createLogger } = require('../utils/logger');
const User = require('../models/user.model');
const { AuthError } = require('../utils/errors');
const { isTokenBlacklisted } = require('../utils/auth.utils');

const logger = createLogger('AuthMiddleware');

/**
 * Middleware to check if the user is authenticated
 * Supports both session-based and token-based authentication
 */
module.exports = async function isAuthenticated(req, res, next) {
  try {
    // First check if user is authenticated via session
    if (req.isAuthenticated && req.isAuthenticated()) {
      logger.debug(`Session authenticated user: ${req.user.username || req.user._id}`);
      return next();
    }

    // If not authenticated via session, check for JWT token
    const token = extractTokenFromRequest(req);
    if (!token) {
      logger.debug('No authentication token provided');
      throw AuthError.unauthorized('You need to be logged in to access this resource');
    }

    // Check if token is blacklisted
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) {
      logger.debug('Token is blacklisted');
      throw AuthError.unauthorized('Token has been revoked');
    }

    // Verify the JWT token
    const decoded = await verifyToken(token);
    if (!decoded) {
      logger.debug('Invalid authentication token');
      throw AuthError.unauthorized('Invalid or expired token');
    }

    // Find the user by ID from the token
    const user = await User.findById(decoded.sub);
    if (!user) {
      logger.debug(`User not found for token: ${decoded.sub}`);
      throw AuthError.unauthorized('User not found');
    }

    // Attach the user to the request object
    req.user = user;
    logger.debug(`JWT authenticated user: ${user.username || user._id}`);
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    // Pass the error to the error handling middleware
    if (!(error instanceof AuthError)) {
      error = new AuthError('An error occurred during authentication', {
        originalError: error.message
      });
    }
    next(error);
  }
};
