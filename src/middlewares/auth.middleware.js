// src/middlewares/auth.middleware.js

/**
 * Authentication Middleware
 * 
 * Handles user authentication via session or JWT
 */

const { createLogger } = require('../utils/logger');
const User = require('../models/user.model');
const { AuthError } = require('../utils/errors');
const jwt = require('jsonwebtoken');
const { isTokenBlacklisted } = require('../utils/auth.utils');
// Use process.env directly
const JWT_SECRET = process.env.JWT_SECRET;

const logger = createLogger('AuthMiddleware');

/**
 * Middleware to check if the user is authenticated
 * Supports both session-based and token-based authentication
 */
const isAuthenticated = async (req, res, next) => {
  try {
    // Check for Bearer token in Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // If no token in header, check for token in session
      if (req.isAuthenticated && req.isAuthenticated()) {
        return next(); 
      }
      // Use AuthError from utils/errors instead of direct response
      return next(AuthError.unauthorized('Authorization failed. No valid authentication found.'));
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    try {
      // Check if token is blacklisted first
      const blacklisted = await isTokenBlacklisted(token);
      if (blacklisted) {
        logger.warn('Attempt to use blacklisted token');
        return next(AuthError.unauthorized('Token has been invalidated. Please log in again.'));
      }
      
      // Verify the token with a nested try-catch for better error specificity
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Find the user
      const user = await User.findById(decoded.sub);
      
      // Check if user exists
      if (!user) {
        return next(AuthError.unauthorized('User not found'));
      }
      
      // Check if token version matches (if token versioning is implemented)
      if (user.tokenVersion && (!decoded.version || decoded.version < user.tokenVersion)) {
        return next(AuthError.tokenExpired('Token is no longer valid. Please log in again.'));
      }
      
      // Set the user on the request object
      req.user = user;
      
      next();
    } catch (tokenError) {
      // Handle specific JWT verification errors
      if (tokenError.name === 'TokenExpiredError') {
        return next(AuthError.tokenExpired('Token has expired'));
      } else if (tokenError.name === 'JsonWebTokenError') {
        return next(AuthError.invalidToken('Invalid token'));
      }
      
      // For any other token errors
      return next(AuthError.unauthorized('Token validation failed'));
    }
  } catch (err) {
    // For any other unexpected errors
    logger.error('Authentication middleware error:', err);
    next(AuthError.serverError('Authentication error'));
  }
};

module.exports = isAuthenticated;
