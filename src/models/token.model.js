/**
 * Token Model
 * 
 * Handles storage and management of blacklisted/revoked JWT tokens
 */
const mongoose = require('mongoose');
const { createLogger } = require('../utils/logger');

const logger = createLogger('TokenModel');

/**
 * Token Schema - Used for blacklisting JWT tokens
 */
const tokenSchema = new mongoose.Schema({
  // The full JWT token (for exact match checking)
  token: {
    type: String,
    sparse: true,
    index: true
  },
  
  // User ID this token belongs to
  userId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    index: true
  },
  
  // Flag to blacklist all tokens for this user
  blacklistAll: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // When the token expires (for automatic cleanup)
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  
  // When the token was blacklisted
  blacklistedAt: {
    type: Date,
    default: Date.now
  },
  
  // Reason for blacklisting (logout, password_changed, security_concern)
  reason: {
    type: String,
    enum: ['logout', 'password_change', 'security_measure', 'account_deletion', 'admin_action', 'other'],
    default: 'logout'
  },
  
  // IP address that initiated the blacklisting (for audit)
  ipAddress: {
    type: String,
    default: null
  }
});

// Create TTL index for automatic cleanup of expired tokens
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

// Static method to manually clean up expired tokens
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
