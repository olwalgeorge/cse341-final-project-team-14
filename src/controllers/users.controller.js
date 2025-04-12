const sendResponse = require("../utils/response.js");
const asyncHandler = require("express-async-handler");
const logger = require("../utils/logger.js");
const { ApiError, DatabaseError } = require("../utils/errors");
const {
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
} = require("../services/users.service");
const { transformUser, transformUserData } = require("../utils/user.utils.js");

/**
 * @desc    Get current user profile
 * @route   GET /users/profile
 * @access  Private
 */
const getUserProfile = asyncHandler(async (req, res, next) => {
  // Verify we have the req.user object with a valid ID
  if (!req.user || !req.user._id) {
    logger.error("getUserProfile called but no user in session");
    return next(DatabaseError.notFound("User session"));
  }

  logger.info(`getUserProfile called for user ${req.user.username} (ID: ${req.user._id}, userID: ${req.user.userID})`);
  
  try {
    // Use the Mongoose ObjectId from the authenticated user
    const user = await getUserByIdService(req.user._id);
    if (!user) {
      logger.warn(`User found in session but not in database: ${req.user._id}`);
      return next(DatabaseError.notFound("User"));
    }
    
    const transformedUser = transformUser(user);
    sendResponse(
      res, 
      200,
      "User profile retrieved successfully",
      transformedUser
    );
  } catch (error) {
    logger.error(`Error retrieving user profile for ID: ${req.user._id}`, error);
    next(error);
  }
});

/**
 * @desc    Update user profile
 * @route   PUT /users/profile
 * @access  Private
 */
const updateUserProfile = asyncHandler(async (req, res, next) => {
  // Verify we have the req.user object with a valid ID
  if (!req.user || !req.user._id) {
    logger.error("updateUserProfile called but no user in session");
    return next(DatabaseError.notFound("User session"));
  }

  logger.info(`updateUserProfile called for user ${req.user.username} (ID: ${req.user._id}, userID: ${req.user.userID})`);
  logger.debug("Request body:", req.body);

  try {
    const updates = transformUserData(req.body);
    
    // Make sure we're using the Mongoose ObjectId from the authenticated user
    const user = await updateUserService(req.user._id, updates);
    if (!user) {
      logger.warn(`User found in session but not in database: ${req.user._id}`);
      return next(DatabaseError.notFound("User"));
    }
    
    const transformedUser = transformUser(user);
    sendResponse(
      res,
      200,
      "User profile updated successfully",
      transformedUser
    );
  } catch (error) {
    logger.error(`Error updating user profile for ID: ${req.user._id}`, error);
    next(error);
  }
});

/**
 * @desc    Logout user
 * @route   GET /users/logout
 * @access  Private
 */
const logoutUser = asyncHandler(async (req, res, next) => {
  logger.info(`logoutUser called for user ID: ${req.user?.user_Id}`);
  logger.debug("Request body:", req.body);
  req.logout((err) => {
    if (err) {
      logger.error("Error during logout:", err);
      return next(
        ApiError.internal("Internal server error during logout", {
          message: err.message,
        })
      );
    }
    sendResponse(res, 200, "User logged out successfully");
  });
});

/**
 * @desc    Get user by ID
 * @route   GET /users/userID/:userID
 * @access  Private
 */
const getUserById = asyncHandler(async (req, res, next) => {
  logger.info(`getUserById called with ID: ${req.params.userID}`);
  logger.debug("Request body:", req.params.userID);
  try {
    const user = await getUserByUserIdService(req.params.userID);
    if (!user) {
      return next(DatabaseError.notFound("User"));
    }
    const transformedUser = transformUser(user);
    sendResponse(res, 200, "User retrieved successfully", transformedUser);
  } catch (error) {
    logger.error(`Error retrieving user with ID: ${req.params.userID}`, error);
    next(error);
  }
});

/**
 * @desc    Delete user by ID
 * @route   DELETE /users/:user_Id
 * @access  Private
 */
const deleteUserById = asyncHandler(async (req, res, next) => {
  logger.info(`deleteUserById called with ID: ${req.params.user_Id}`);
  try {
    const user = await deleteUserByIdService(req.params.user_Id);
    if (user) {
      sendResponse(res, 200, "User deleted successfully");
    } else {
      return next(DatabaseError.notFound("User"));
    }
  } catch (error) {
    logger.error(`Error deleting user with ID: ${req.params.user_Id}`, error);
    next(error);
  }
});

/**
 * @desc    Get all users
 * @route   GET /users
 * @access  Private
 */
const getAllUsers = asyncHandler(async (req, res, next) => {
  logger.info("getAllUsers called");
  try {
    const users = await getAllUsersService();
    sendResponse(res, 200, "Users retrieved successfully", users);
  } catch (error) {
    logger.error("Error retrieving all users:", error);
    next(error);
  }
});

/**
 * @desc    Get user by username
 * @route   GET /users/username/:username
 * @access  Private
 */
const getUserByUsername = asyncHandler(async (req, res, next) => {
  logger.info(`getUserByUsername called with username: ${req.params.username}`);
  try {
    const user = await getUserByUsernameService(req.params.username);
    if (user) {
      const transformedUser = transformUser(user);
      sendResponse(res, 200, "User retrieved successfully", transformedUser);
    } else {
      return next(DatabaseError.notFound("User"));
    }
  } catch (error) {
    logger.error(
      `Error retrieving user with username: ${req.params.username}`,
      error
    );
    next(error);
  }
});

/**
 * @desc    Get user by email
 * @route   GET /users/email/:email
 * @access  Private
 */
const getUserByEmail = asyncHandler(async (req, res, next) => {
  logger.info(`getUserByEmail called with email: ${req.params.email}`);
  try {
    const user = await getUserByEmailService(req.params.email);
    if (user) {
      const transformedUser = transformUser(user);
      sendResponse(res, 200, "User retrieved successfully", transformedUser);
    } else {
      return next(DatabaseError.notFound("User"));
    }
  } catch (error) {
    logger.error(
      `Error retrieving user with email: ${req.params.email}`,
      error
    );
    next(error);
  }
});

/**
 * @desc    Get users by role
 * @route   GET /users/role/:role
 * @access  Private
 */
const getUsersByRole = asyncHandler(async (req, res, next) => {
  logger.info(`getUsersByRole called with role: ${req.params.role}`);
  try {
    const users = await getUsersByRoleService(req.params.role);
    if (users && users.length > 0) {
      sendResponse(res, 200, "Users retrieved successfully", users);
    } else {
      return next(DatabaseError.notFound("Users"));
    }
  } catch (error) {
    logger.error(`Error retrieving users with role: ${req.params.role}`, error);
    next(error);
  }
});

/**
 * @desc    Delete all users
 * @route   DELETE /users
 * @access  Private
 */
const deleteAllUsers = asyncHandler(async (req, res, next) => {
  logger.warn("deleteAllUsers called - USE WITH CAUTION!");
  try {
    const result = await deleteAllUsersService();
    sendResponse(res, 200, "All users deleted successfully", {
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    logger.error("Error deleting all users:", error);
    next(error);
  }
});

/**
 * @desc    Update user by ID
 * @route   PUT /users/:user_Id
 * @access  Private
 */
const updateUserById = asyncHandler(async (req, res, next) => {
  logger.info(`updateUserById called with ID: ${req.params.user_Id}`);
  logger.debug("Update data:", req.body);
  try {
    const updates = transformUserData(req.body);
    const user = await updateUserService(req.params.user_Id, updates);
    if (user) {
      const transformedUser = transformUser(user);
      sendResponse(
        res,
        200,
        "User updated successfully",
        transformedUser
      );
    } else {
      return next(DatabaseError.notFound("User"));
    }
  } catch (error) {
    logger.error(`Error updating user with ID: ${req.params.user_Id}`, error);
    next(error);
  }
});

/**
 * @desc    Search users by text
 * @route   GET /users/search
 * @access  Private
 */
const searchUsers = asyncHandler(async (req, res, next) => {
  const term = req.query.term;
  logger.info(`searchUsers called with term: ${term}`);
  
  try {
    const users = await searchUsersService(term);
    
    if (!users || !Array.isArray(users)) {
      logger.error("Search returned invalid result");
      return next(DatabaseError.dataError("Search result is not in expected format"));
    }
    
    if (users.length === 0) {
      logger.info(`No users found for search term: ${term}`);
      return sendResponse(res, 200, "No users found matching your search", []);
    }
    
    // Transform each user to protect sensitive data
    const transformedUsers = users.map(transformUser);
    
    sendResponse(
      res,
      200,
      `Found ${transformedUsers.length} users matching "${term}"`,
      transformedUsers
    );
  } catch (error) {
    logger.error(`Error searching users for term: ${term}`, error);
    next(error);
  }
});

module.exports = {
  getUserProfile,
  logoutUser,
  updateUserProfile,
  getUserById,
  deleteUserById,
  getAllUsers,
  getUserByUsername,
  getUserByEmail,
  getUsersByRole,
  deleteAllUsers,
  updateUserById,
  searchUsers,
};

