const rateLimit = require('express-rate-limit');
const { createLogger } = require('../utils/logger');
const { ApiError } = require('../utils/errors');
const config = require('../config/config');

const logger = createLogger('RateLimitMiddleware');

/**
 * Checks if a user has admin privileges that exempt them from rate limiting
 * @param {Object} req - Express request object
 * @returns {boolean} True if the user should be exempted from rate limits
 */
const isAdminExempt = (req) => {
  // Check if user exists and has admin or superadmin role
  if (req.user && (req.user.role === 'ADMIN' || req.user.role === 'SUPERADMIN')) {
    logger.info(`Rate limit bypassed for admin user: ${req.user.userID || req.user.userId}`);
    return true;
  }
  // Check if user has a rate limit exemption timestamp that's still valid
  if (req.user && req.user.rateLimitExemptUntil && new Date(req.user.rateLimitExemptUntil) > new Date()) {
    logger.info(`Rate limit bypassed for exempted user: ${req.user.userID || req.user.userId}`);
    return true;
  }
  return false;
};

/**
 * Rate limiting middleware with custom error handling
 * that integrates with the application's error handling system
 */
const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: config.rateLimit?.windowMs || 15 * 60 * 1000, // 15 minutes by default
    max: config.rateLimit?.max || 100, // Limit each IP to 100 requests per windowMs by default
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // Skip rate limiting for admin and superadmin users
    skip: (req) => isAdminExempt(req),
    handler: (req, res, next, options) => {
      const error = new ApiError(
        'Too many requests, please try again later.',
        429,
        {
          resetTime: new Date(Date.now() + options.windowMs),
          limit: options.max,
          remainingRequests: 0
        }
      );
      
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`, {
        path: req.path,
        method: req.method,
        ip: req.ip
      });
      
      next(error);
    }
  };

  // Merge default options with custom options
  const mergedOptions = { ...defaultOptions, ...options };
  
  // Return the configured rate limiter middleware
  return rateLimit(mergedOptions);
};

/**
 * Global API rate limiter for all routes
 */
const globalLimiter = createRateLimiter();

/**
 * More strict rate limiter for authentication endpoints
 */
const authLimiter = createRateLimiter({
  windowMs: config.rateLimit?.auth?.windowMs || 60 * 1000, // 1 minute by default
  max: config.rateLimit?.auth?.max || 5, // Limit each IP to 5 login attempts per minute
  message: 'Too many login attempts, please try again after a minute'
});

/**
 * Middleware function to bypass rate limits for a specific request
 * This can be used before rate limit middleware to dynamically exempt users
 */
const bypassRateLimit = (req, res, next) => {
  // Mark this request to be exempt from rate limiting
  req._rateLimit = {
    skip: true
  };
  next();
};

module.exports = {
  globalLimiter,
  authLimiter,
  createRateLimiter,
  bypassRateLimit,
  isAdminExempt
};