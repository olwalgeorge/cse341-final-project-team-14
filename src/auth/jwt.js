/**
 * JWT Authentication Module
 * 
 * Handles JWT token generation, verification, and related functions
 */
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { createLogger } = require('../utils/logger');

const logger = createLogger('Auth:JWT');

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object (should not contain sensitive data)
 * @returns {String} JWT token
 */
function generateToken(user) {
  try {
    const payload = {
      sub: user._id,
      userId: user.userID,
      email: user.email,
      role: user.role,
      username: user.username,
      iat: Math.floor(Date.now() / 1000),
    };

    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    logger.debug(`Generated JWT token for user: ${user.username}`);
    return token;
  } catch (error) {
    logger.error('Error generating JWT token:', error);
    throw new Error('Error generating authentication token');
  }
}

/**
 * Verify and decode a JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
async function verifyToken(token) {
  try {
    // Check if the token blacklist function is available
    // Note: We'll check the blacklist in the auth middleware instead
    // to avoid circular dependencies
    
    const decoded = jwt.verify(token, config.jwt.secret);
    return decoded;
  } catch (error) {
    logger.warn(`Token verification failed: ${error.message}`);
    return null;
  }
}

/**
 * Extract token from request headers, query, or cookies
 * @param {Object} req - Express request object
 * @returns {String|null} JWT token or null if not found
 */
function extractTokenFromRequest(req) {
  try {
    // Check Authorization header first (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7); // Remove 'Bearer ' prefix
    }

    // Check for token in query parameters
    if (req.query && req.query.token) {
      return req.query.token;
    }

    // Check for token in cookies
    if (req.cookies && req.cookies.token) {
      return req.cookies.token;
    }

    return null;
  } catch (error) {
    logger.error('Error extracting token from request:', error);
    return null;
  }
}

module.exports = {
  generateToken,
  verifyToken,
  extractTokenFromRequest
};
