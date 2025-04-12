// src/services/user.service.js
const User = require("../models/user.model.js");
const logger = require("../utils/logger.js");

const getUserByIdService = async (id) => {
  logger.debug(`getUserByIdService called with ID: ${id}`);
  try {
    return await User.findById(id);
  } catch (error) {
    logger.error(`Error in getUserByIdService for ID ${id}:`, error);
    throw error;
  }
};

const getUserByUserIdService = async (userId) => {
  logger.debug(`getUserByUserIdService called with userID: ${userId}`);
  try {
    return await User.findOne({ userID: userId });
  } catch (error) {
    logger.error(`Error in getUserByUserIdService for userID ${userId}:`, error);
    throw error;
  }
};

const updateUserService = async (id, updates) => {
  logger.debug(`updateUserProfileService called with ID: ${id}`);
  try {
    return await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
  } catch (error) {
    logger.error(`Error in updateUserProfileService for ID ${id}:`, error);
    throw error;
  }
};

const deleteUserByIdService = async (id) => {
  return await User.findByIdAndDelete(id);
};

const getAllUsersService = async () => {
  return await User.find();
};

const getUserByUsernameService = async (username) => {
  return await User.findOne({ username });
};

const getUserByEmailService = async (email) => {
  return await User.findOne({ email });
};

const getUsersByRoleService = async (role) => {
  return await User.find({ role });
};

const deleteAllUsersService = async () => {
  return await User.deleteMany({});
};

/**
 * Search users by term (searches username, email, fullName)
 * @param {string} term - The search term
 * @returns {Promise<Array>} - Array of matching users
 */
const searchUsersService = async (term) => {
  logger.debug(`searchUsersService called with term: ${term}`);
  
  try {
    // Create a case-insensitive regex for the search term
    const regex = new RegExp(term, "i");
    
    // Create a query that searches in username, email, and fullName
    const searchQuery = {
      $or: [
        { username: regex },
        { email: regex },
        { fullName: regex },
        { userID: regex }
      ]
    };
    
    // Execute the search query
    const users = await User.find(searchQuery).lean();
    
    logger.debug(`Found ${users.length} users matching "${term}"`);
    
    return users;
  } catch (error) {
    logger.error(`Error in searchUsersService for term ${term}:`, error);
    throw error;
  }
};

module.exports = {
  getUserByIdService,
  getUserByUserIdService,
  deleteUserByIdService,
  getAllUsersService,
  getUserByUsernameService,
  getUserByEmailService,
  getUsersByRoleService,
  deleteAllUsersService,
  updateUserService,
  searchUsersService,
};
