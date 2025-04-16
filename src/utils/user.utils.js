// src/utils/user.utils.js


const Counter = require("../models/counter.model");
const { createLogger } = require("./logger");

// Create module-specific logger
const logger = createLogger('UserUtils');


/**
 * Transform user data for API response (removes sensitive data)
 * @param {Object} user - User document from database
 * @returns {Object} - Transformed user object without sensitive data
 */
const transformUser = (user) => {
  if (!user) return null;

  // Create a safe user object without password and other sensitive data
  return {
    user_id: user._id,
    userID: user.userID,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    role: user.role,
    status: user.status,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

/**
 * Transforms user data for updates, filtering valid fields.
 * @param {Object} data - The data object to transform.
 * @returns {Object} - The transformed data object.
 */
const transformUserData = (data) => {
  const transformedData = {};
  if (data.username) transformedData.username = data.username;
  if (data.email) transformedData.email = data.email;
  if (data.fullName) transformedData.fullName = data.fullName;
  if (data.profilePicture) transformedData.profilePicture = data.profilePicture;
  if (data.bio) transformedData.bio = data.bio;
  if (data.website) transformedData.website = data.website;
  if (data.location) transformedData.location = data.location;
  if (data.phoneNumber) transformedData.phoneNumber = data.phoneNumber;
  if (data.preferences) transformedData.preferences = data.preferences;
  if (data.role) transformedData.role = data.role;
  return transformedData;
};

/**
 * Checks schema definitions for potential duplicate indexes
 * @param {Object} schema - Mongoose schema to check
 * @returns {Array} - List of potentially duplicated indexes with details
 */
const checkDuplicateIndexes = (schema) => {
  const indexMap = new Map();
  const potentialDuplicates = [];
  
  // Check field-level indexes
  Object.keys(schema.paths).forEach(path => {
    const pathConfig = schema.paths[path];
    if (pathConfig.options && pathConfig.options.index === true) {
      const indexKey = `${path}:1`;
      const source = indexMap.has(indexKey) ? 
        [...indexMap.get(indexKey).sources, 'field-level'] :
        ['field-level'];
      
      indexMap.set(indexKey, {
        count: (indexMap.get(indexKey)?.count || 0) + 1,
        path,
        sources: source
      });
    }
  });
  
  // Check schema-level indexes
  if (schema._indexes && schema._indexes.length > 0) {
    schema._indexes.forEach(([indexSpec], idx) => {
      Object.entries(indexSpec).forEach(([key, value]) => {
        const indexKey = `${key}:${value}`;
        const source = indexMap.has(indexKey) ? 
          [...indexMap.get(indexKey).sources, `schema-level[${idx}]`] :
          [`schema-level[${idx}]`];
        
        indexMap.set(indexKey, {
          count: (indexMap.get(indexKey)?.count || 0) + 1,
          path: key,
          sources: source
        });
      });
    });
  }
  
  // Find duplicates
  for (const [key, details] of indexMap.entries()) {
    if (details.count > 1) {
      potentialDuplicates.push({
        index: key,
        path: details.path,
        count: details.count,
        sources: details.sources
      });
    }
  }
  
  return potentialDuplicates;
};

/**
 * Fixes duplicate indexes in a Mongoose schema
 * @param {Object} schema - Mongoose schema to fix
 * @returns {Object} - Object containing removed duplicates and modified schema
 */
const fixDuplicateIndexes = (schema) => {
  const duplicates = checkDuplicateIndexes(schema);
  const removedIndices = [];
  
  // If no duplicates, return early
  if (duplicates.length === 0) {
    return { 
      modified: false, 
      removedIndices: [],
      schema 
    };
  }
  
  // Process each duplicate
  duplicates.forEach(duplicate => {
    // Extract path and determine if it's field-level
    const { path, sources } = duplicate;
    const hasFieldLevel = sources.includes('field-level');
    
    // If it has field-level index, remove from schema-level definitions
    if (hasFieldLevel && schema._indexes) {
      const initialLength = schema._indexes.length;
      
      // Filter out the duplicate index from schema._indexes
      schema._indexes = schema._indexes.filter(([indexSpec]) => {
        return indexSpec[path] === undefined;
      });
      
      if (initialLength !== schema._indexes.length) {
        removedIndices.push({
          path,
          type: 'schema-level',
          keptAt: 'field-level'
        });
      }
    } 
    // Otherwise, assume we keep the first schema-level index
    else if (schema._indexes && schema._indexes.length > 0) {
      // Find all schema-level indexes for this path
      const indices = sources
        .filter(s => s.startsWith('schema-level'))
        .map(s => {
          const match = s.match(/schema-level\[(\d+)\]/);
          return match ? parseInt(match[1]) : -1;
        })
        .filter(idx => idx !== -1)
        .sort((a, b) => a - b);
      
      // Keep the first one, remove others (if any)
      if (indices.length > 1) {
        // Get the indices to remove (skip the first one)
        const toRemove = indices.slice(1);
        
        // Create a set for quick lookup
        const removeSet = new Set(toRemove);
        
        // Filter the schema indexes
        const initialLength = schema._indexes.length;
        schema._indexes = schema._indexes.filter((_, idx) => !removeSet.has(idx));
        
        if (initialLength !== schema._indexes.length) {
          removedIndices.push({
            path,
            type: 'duplicate-schema-level',
            keptAt: `schema-level[${indices[0]}]`,
            removed: toRemove.map(i => `schema-level[${i}]`)
          });
        }
      }
    }
  });
  
  return {
    modified: removedIndices.length > 0,
    removedIndices,
    schema
  };
};

/**
 * Sanitize user data by selecting specific fields or excluding sensitive fields
 * @param {Object} user - User object (can be mongoose document or plain object)
 * @param {Array} fields - Fields to include (if provided) or all except sensitive by default
 * @param {boolean} isInclusion - If true, include fields; if false, exclude fields
 * @returns {Object} Sanitized user data
 */
const sanitizeUserData = (user, fields = [], isInclusion = true) => {
  // Convert mongoose document to plain object if needed
  const userData = user.toObject ? user.toObject() : { ...user };
  
  if (fields.length === 0 && isInclusion === false) {
    // Default exclusion fields if no fields specified and exclusion mode
    fields = ['password', 'resetPasswordToken', 'resetPasswordExpires', '__v'];
  }
  
  const result = {};
  
  if (isInclusion) {
    // Include only specified fields
    fields.forEach(field => {
      if (userData[field] !== undefined) {
        result[field] = userData[field];
      }
    });
  } else {
    // Include all except specified fields
    Object.keys(userData).forEach(key => {
      if (!fields.includes(key)) {
        result[key] = userData[key];
      }
    });
  }
  
  return result;
};

/**
 * Generate a unique user ID in the format USR-XXXXX
 * @returns {Promise<string>} - Generated user ID
 */
const generateUserId = async () => {
  logger.debug("Generating userID");
  
  try {
    // Use the Counter.getNextId method
    const userID = await Counter.getNextId('userID', { 
      prefix: 'USR-', 
      padLength: 5
    });
    
    logger.debug(`Generated userID: ${userID}`);
    return userID;
  } catch (error) {
    logger.error("Error generating userID:", error);
    throw error;
  }
};

module.exports = {
  transformUser,
  generateUserId,
  transformUserData,
  sanitizeUserData,
  checkDuplicateIndexes,
  fixDuplicateIndexes,
};
