// src/services/user.service.js
const User = require("../models/user.model.js");
const { createLogger } = require("../utils/logger.js");
const APIFeatures = require("../utils/apiFeatures.js");

// Create module-specific logger
const logger = createLogger('UsersService');

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

/**
 * Get all users with filtering, pagination, and sorting
 */
const getAllUsersService = async (query = {}) => {
  logger.debug("getAllUsersService called with query:", query);
  
  try {
    // Define custom filters mapping
    const customFilters = {
      username: {
        field: 'username',
        transform: (value) => ({ $regex: value, $options: 'i' })
      },
      email: {
        field: 'email',
        transform: (value) => ({ $regex: value, $options: 'i' })
      },
      fullName: {
        field: 'fullName',
        transform: (value) => ({ $regex: value, $options: 'i' })
      },
      role: 'role',
      isVerified: {
        field: 'isVerified',
        transform: (value) => value === 'true'
      }
    };
    
    // Build filter using APIFeatures utility
    const filter = APIFeatures.buildFilter(query, customFilters);
    
    // Get pagination parameters
    const pagination = APIFeatures.getPagination(query);
    
    // Get sort parameters with default sort by username
    const sort = APIFeatures.getSort(query, 'username');

    // Execute query with pagination and sorting
    const users = await User.find(filter)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .select("-password"); // Always exclude password
    
    // Get total count for pagination
    const total = await User.countDocuments(filter);
    
    return {
      users,
      pagination: APIFeatures.paginationResult(total, pagination)
    };
  } catch (error) {
    logger.error("Error in getAllUsersService:", error);
    throw error;
  }
};

/**
 * Get users by role with pagination and sorting
 */
const getUsersByRoleService = async (role, query = {}) => {
  logger.debug(`getUsersByRoleService called with role: ${role}`);
  
  try {
    // Get pagination parameters
    const pagination = APIFeatures.getPagination(query);
    
    // Get sort parameters with default sort by username
    const sort = APIFeatures.getSort(query, 'username');

    // Define filter for role
    const filter = { role: role.toUpperCase() };
    
    // Execute query with pagination and sorting
    const users = await User.find(filter)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .select("-password");
    
    // Get total count for pagination
    const total = await User.countDocuments(filter);
    
    return {
      users,
      pagination: APIFeatures.paginationResult(total, pagination)
    };
  } catch (error) {
    logger.error(`Error in getUsersByRoleService for role ${role}:`, error);
    throw error;
  }
};

/**
 * Search users by term with pagination and sorting
 */
const searchUsersService = async (term, query = {}) => {
  logger.debug(`searchUsersService called with term: ${term}`);
  
  try {
    // Get pagination parameters
    const pagination = APIFeatures.getPagination(query);
    
    // Get sort parameters with default sort by username
    const sort = APIFeatures.getSort(query, 'username');
    
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
    
    // Execute the search query with pagination and sorting
    const users = await User.find(searchQuery)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .select("-password")
      .lean();
    
    // Get total count for pagination
    const total = await User.countDocuments(searchQuery);
    
    return {
      users,
      pagination: APIFeatures.paginationResult(total, pagination)
    };
  } catch (error) {
    logger.error(`Error in searchUsersService for term ${term}:`, error);
    throw error;
  }
};

const getUserByUsernameService = async (username) => {
  return await User.findOne({ username });
};

const getUserByEmailService = async (email) => {
  return await User.findOne({ email });
};

const deleteAllUsersService = async () => {
  return await User.deleteMany({});
};

/**
 * Create a new user - DEPRECATED, use auth.service's registerService instead
 * This is kept for backward compatibility
 */
const createUserService = async (userData) => {
  logger.warn("createUserService in users.service is deprecated. Use auth.service's registerService instead");
  
  // Import the auth service to delegate user creation
  const { registerService } = require("./auth.service");
  
  try {
    // Remove password hashing as auth service handles it
    const { user } = await registerService(userData);
    return user;
  } catch (error) {
    logger.error("Error in createUserService:", error);
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
  createUserService, // Keep for backward compatibility
};
