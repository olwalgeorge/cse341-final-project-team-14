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
};
