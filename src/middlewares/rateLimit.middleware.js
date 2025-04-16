const rateLimit = require('express-rate-limit');
const { createLogger } = require('../utils/logger');
const { ApiError } = require('../utils/errors');
const config = require('../config/config');

const logger = createLogger('RateLimitMiddleware');

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

module.exports = {
  globalLimiter,
  authLimiter,
  createRateLimiter
};