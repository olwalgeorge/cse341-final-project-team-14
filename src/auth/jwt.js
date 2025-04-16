/**
 * JWT Authentication Module
 * 
 * Handles JWT token generation, verification, and related functions
 */
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { createLogger } = require('../utils/logger');
const User = require('../models/user.model');
const { isTokenBlacklisted, areAllUserTokensBlacklisted } = require('../utils/auth.utils');

const logger = createLogger('Auth:JWT');

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object (should not contain sensitive data)
 * @returns {String} JWT token
 */
const generateToken = (user) => {
  const payload = {
    sub: user._id,
    userId: user.userID,
    email: user.email,
    role: user.role,
    username: user.username,
    version: user.tokenVersion || 1
  };
  
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
};

/**
 * Verify and decode a JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
async function verifyToken(token) {
  try {
    // First verify the token's signature
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Check if the specific token is blacklisted
    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      logger.warn('Token was found in blacklist during verification');
      return null;
    }
    
    // Check if all tokens for this user are blacklisted
    const allBlacklisted = await areAllUserTokensBlacklisted(decoded.sub);
    if (allBlacklisted) {
      logger.warn(`All tokens for user ${decoded.sub} have been blacklisted`);
      return null;
    }
    
    // Check token version against user's current token version
    const user = await User.findById(decoded.sub).select('tokenVersion');
    
    if (!user) {
      logger.warn(`User not found for token: ${decoded.sub}`);
      return null;
    }
    
    // Verify token version
    if (user.tokenVersion && (!decoded.version || decoded.version < user.tokenVersion)) {
      logger.warn(`Token version mismatch. Token: ${decoded.version}, User: ${user.tokenVersion}`);
      return null;
    }
    
    // Token is valid
    return decoded;
  } catch (error) {
    logger.error('Error verifying token:', error);
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
