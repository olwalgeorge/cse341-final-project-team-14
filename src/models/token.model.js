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
    enum: ['refresh', 'reset', 'verification', 'access'],
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
  }
});

// Add an index for quick lookup by token type
tokenSchema.index({ type: 1 });

// Add compound index for efficient querying by user and type
tokenSchema.index({ userId: 1, type: 1 });

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

// Create and export the model
const Token = mongoose.model('Token', tokenSchema);
module.exports = Token;
