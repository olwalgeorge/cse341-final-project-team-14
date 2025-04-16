/**
 * Token Model
 * 
 * Handles storage and management of blacklisted/revoked JWT tokens
 */
const mongoose = require('mongoose');
const { createLogger } = require('../utils/logger');

const logger = createLogger('TokenModel');

const tokenSchema = new mongoose.Schema({
  // The actual token value
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Associated user ID for auditing and management
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    index: true
  },
  
  // Token expiration date (used for automatic cleanup)
  expiresAt: {
    type: Date,
    required: true
  },
  
  // Why the token was blacklisted
  reason: {
    type: String,
    enum: ['logout', 'password_changed', 'revoked_by_admin', 'security_concern'],
    default: 'logout'
  },
  
  // IP address that initiated the revocation
  ipAddress: {
    type: String,
    required: false
  },
  
  // When the token was added to the blacklist
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  }
});

// Create TTL index for automatic removal of expired tokens
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to check if a token is blacklisted
tokenSchema.statics.isBlacklisted = async function(token) {
  if (!token) return false;
  
  try {
    const blacklistedToken = await this.findOne({ token });
    return !!blacklistedToken;
  } catch (error) {
    logger.error('Error checking blacklisted token:', error);
    return false; // Default to not blacklisted on error (fail open for functionality)
  }
};

// Static method to blacklist a token
tokenSchema.statics.blacklist = async function(token, userId, expiresAt, reason = 'logout', ipAddress = null) {
  try {
    if (!token) return false;
    
    const tokenDoc = new this({
      token,
      userId,
      expiresAt,
      reason,
      ipAddress
    });
    
    await tokenDoc.save();
    logger.debug(`Token blacklisted for user ${userId}`);
    return true;
  } catch (error) {
    // Check for duplicate key error (token already blacklisted)
    if (error.code === 11000) {
      logger.debug('Token already blacklisted');
      return true;
    }
    
    logger.error('Error blacklisting token:', error);
    return false;
  }
};

// Clean up any tokens that have expired but weren't automatically removed
tokenSchema.statics.cleanupExpired = async function() {
  try {
    const result = await this.deleteMany({ expiresAt: { $lt: new Date() } });
    logger.debug(`Removed ${result.deletedCount} expired tokens`);
    return result.deletedCount;
  } catch (error) {
    logger.error('Error cleaning up expired tokens:', error);
    return 0;
  }
};

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;
