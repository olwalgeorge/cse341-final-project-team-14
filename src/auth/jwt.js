/**
 * JWT Authentication Module
 * 
 * Handles JWT token generation, verification, and related functions
 */
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { createLogger } = require('../utils/logger');
const { AuthError } = require('../utils/errors');
const User = require('../models/user.model');
const Token = require('../models/token.model');

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
 * @throws {AuthError} If token verification fails for operational reasons
 */
async function verifyToken(token) {
  try {
    // First verify the token's signature
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Check if the specific token is blacklisted using the Token model
    const isBlacklisted = await Token.isTokenBlacklisted(token);
    if (isBlacklisted) {
      logger.warn('Token was found in blacklist during verification');
      throw AuthError.unauthorized('Token has been revoked. Please log in again.');
    }
    
    // Check if all tokens for this user are blacklisted
    const allBlacklisted = await Token.areAllUserTokensBlacklisted(decoded.sub);
    if (allBlacklisted) {
      logger.warn(`All tokens for user ${decoded.sub} have been blacklisted`);
      throw AuthError.unauthorized('All your sessions have been revoked for security reasons. Please log in again.');
    }
    
    // Check token version against user's current token version
    const user = await User.findById(decoded.sub).select('tokenVersion');
    
    if (!user) {
      logger.warn(`User not found for token: ${decoded.sub}`);
      throw AuthError.unauthorized('User account not found. Please contact support if this issue persists.');
    }
    
    // Verify token version
    if (user.tokenVersion && (!decoded.version || decoded.version < user.tokenVersion)) {
      logger.warn(`Token version mismatch. Token: ${decoded.version}, User: ${user.tokenVersion}`);
      throw AuthError.unauthorized('Your session has expired due to security changes. Please log in again.');
    }
    
    // Token is valid
    return decoded;
  } catch (error) {
    if (error instanceof AuthError) {
      // Pass through our own errors
      throw error; 
    } else if (error.name === 'JsonWebTokenError') {
      logger.warn('Invalid JWT format:', error.message);
      throw AuthError.unauthorized('Invalid authentication token');
    } else if (error.name === 'TokenExpiredError') {
      logger.warn('JWT expired');
      throw AuthError.unauthorized('Your session has expired. Please log in again.');
    } else {
      logger.error('Error verifying token:', error);
      throw AuthError.unauthorized('Authentication failed');
    }
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
