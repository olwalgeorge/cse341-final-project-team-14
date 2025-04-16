/**
 * Token Model
 * 
 * Handles storage and management of blacklisted/revoked JWT tokens
 */
const mongoose = require('mongoose');
const { fixDuplicateIndexes } = require('../utils/user.utils');
const { createLogger } = require('../utils/logger');

// Create module-specific logger
const logger = createLogger('TokenModel');

// Define the token schema
const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true,
    enum: ['refresh', 'reset', 'verification', 'access', 'blacklisted'],
  },
  expiresAt: {
    type: Date,
    required: true,
    // Keep this field-level index
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Fields for blacklisted tokens
  blacklistedAt: {
    type: Date,
    default: null
  },
  blacklistReason: {
    type: String,
    enum: [null, 'LOGOUT', 'PASSWORD_CHANGE', 'SECURITY_CONCERN', 'USER_REQUEST', 'ADMIN_ACTION', 'OTHER'],
    default: null
  },
  blacklistAll: {
    type: Boolean,
    default: false
  }
});

// Add an index for quick lookup by token type
tokenSchema.index({ type: 1 });

// Add compound index for efficient querying by user and type
tokenSchema.index({ userId: 1, type: 1 });

// Index for blacklisted tokens
tokenSchema.index({ userId: 1, blacklistAll: 1 });

// Before creating the model, fix any duplicate indexes
const result = fixDuplicateIndexes(tokenSchema);

// Log the results
if (result.modified) {
  logger.debug('Fixed duplicate indexes in Token schema:', result.removedIndices);
}

// Define static methods for the Token schema
tokenSchema.statics.findByToken = function(token) {
  return this.findOne({ token });
};

tokenSchema.statics.findValidByUserId = function(userId, type) {
  const query = { 
    userId, 
    expiresAt: { $gt: new Date() }
  };
  
  if (type) {
    query.type = type;
  }
  
  return this.find(query);
};

// New methods for token blacklisting functionality
tokenSchema.statics.isTokenBlacklisted = async function(token) {
  const blacklistedToken = await this.findOne({ 
    token, 
    type: 'blacklisted',
    expiresAt: { $gt: new Date() } 
  });
  return !!blacklistedToken;
};

tokenSchema.statics.areAllUserTokensBlacklisted = async function(userId) {
  const blacklistAll = await this.findOne({ 
    userId, 
    blacklistAll: true,
    type: 'blacklisted',
    expiresAt: { $gt: new Date() } 
  });
  return !!blacklistAll;
};

tokenSchema.statics.blacklistToken = async function(token, userId, expiresAt, reason = 'LOGOUT') {
  try {
    await this.create({
      token,
      userId,
      type: 'blacklisted',
      expiresAt,
      blacklistedAt: new Date(),
      blacklistReason: reason
    });
    logger.info(`Token blacklisted for user ${userId}`);
    return true;
  } catch (error) {
    logger.error('Error blacklisting token:', error);
    return false;
  }
};

tokenSchema.statics.blacklistAllUserTokens = async function(userId, expiryDate = null) {
  try {
    // If no expiry date provided, default to 14 days
    const expiry = expiryDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    
    await this.create({
      userId,
      token: `allTokens-${userId}-${Date.now()}`, // Generate a unique token identifier
      type: 'blacklisted',
      expiresAt: expiry,
      blacklistedAt: new Date(),
      blacklistAll: true,
      blacklistReason: 'SECURITY_CONCERN'
    });
    
    logger.info(`All tokens blacklisted for user ${userId}`);
    return true;
  } catch (error) {
    logger.error('Error blacklisting all user tokens:', error);
    return false;
  }
};

// Create and export the model
const Token = mongoose.model('Token', tokenSchema);
module.exports = Token;
