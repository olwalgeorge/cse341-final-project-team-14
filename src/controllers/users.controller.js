const sendResponse = require("../utils/response.js");
const asyncHandler = require("express-async-handler");
const logger = require("../utils/logger.js");
const createHttpError = require("http-errors");
const userService = require("../services/users.service"); // Import the user service
const { transformUser, transformUserData } = require("../utils/user.utils.js");

/**
 * @desc    Get current user profile
 * @route   GET /users/profile
 * @access  Private
 */
const getUserProfile = asyncHandler(async (req, res, next) => {
    logger.info(`getUserProfile called for user ID: ${req.user?._id}`);
    try {
        const user = await userService.getUserByIdService(req.user._id); // Use service
        if (!user) {
            return next(createHttpError(404, "User not found"));
        }
        const transformedUser = transformUser(user);
        sendResponse(res, 200, "User profile retrieved successfully", transformedUser);
    } catch (error) {
        logger.error(
            `Error retrieving user profile for ID: ${req.user?._id}`,
            error
        );
        next(createHttpError(500, "Failed to retrieve user profile", { message: error.message }));
    }
});

/**
 * @desc    Update user profile
 * @route   PUT /users/profile
 * @access  Private
 */
const updateUserProfile = asyncHandler(async (req, res, next) => {
    logger.info(`updateUserProfile called for user ID: ${req.user?._id}`);
    logger.debug("Request body:", req.body);

    try {
        const updates = transformUserData(req.body);

        const transformedUser = await updateUser(req.user._id, updates, next);
        sendResponse(res, 200, "User profile updated successfully", transformedUser);
    } catch (error) {
        logger.error(`Error updating user profile for ID: ${req.user?._id}`, error);
        next(error);
    }
});

// @desc    Logout user
// @route   GET /users/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res, next) => {
    logger.info(`logoutUser called for user ID: ${req.user?._id}`);
    logger.debug("Request body:", req.body);
    req.logout((err) => {
        if (err) {
            logger.error("Error during logout:", err);
            return next(createHttpError(500, "Internal server error during logout", { message: err.message }));
        }
        sendResponse(res, 200, "User logged out successfully");
    });
});

/**
 * @desc    Get user by ID
 * @route   GET /users/:userID
 * @access  Private
 */
const getUserById = asyncHandler(async (req, res, next) => {
    logger.info(`getUserById called with ID: ${req.params.userID}`);
    logger.debug("Request body:", req.params.userID);
    try {
        const user = await userService.getUserByUserIdService(req.params.userID); // Use service
        if (user) {
            const transformedUser = transformUser(user);
            sendResponse(res, 200, "User retrieved successfully", transformedUser);
        } else {
            return next(createHttpError(404, "User not found"));
        }
    } catch (error) {
        logger.error(`Error retrieving user with ID: ${req.params.userID}`, error);
        next(createHttpError(500, "Failed to retrieve user", { message: error.message }));
    }
});

// @desc    Delete user by ID
// @route   DELETE /users/:_id
// @access  Private
const deleteUserById = asyncHandler(async (req, res, next) => {
    logger.info(`deleteUserById called with ID: ${req.params._id}`);
    try {
        const user = await userService.deleteUserByIdService(req.params._id); // Use service
        if (user) {
            sendResponse(res, 200, "User deleted successfully");
        } else {
            return next(createHttpError(404, "User not found"));
        }
    } catch (error) {
        logger.error(`Error deleting user with ID: ${req.params._id}`, error);
        if (error.name === "CastError" && error.kind === "ObjectId") {
            return next(createHttpError(400, "Invalid user ID format"));
        }
        next(createHttpError(500, "Failed to delete user", { message: error.message }));
    }
});

// @desc    Get all users
// @route   GET /users
// @access  Private
const getAllUsers = asyncHandler(async (req, res, next) => {
    logger.info("getAllUsers called");
    try {
        const users = await userService.getAllUsersService(); // Use service
        sendResponse(res, 200, "Users retrieved successfully", users);
    } catch (error) {
        logger.error("Error retrieving all users:", error);
        next(createHttpError(500, "Failed to retrieve users", { message: error.message }));
    }
});

// @desc    Get user by username
// @route   GET /users/username/:username
// @access  Private
const getUserByUsername = asyncHandler(async (req, res, next) => {
    logger.info(`getUserByUsername called with username: ${req.params.username}`);
    try {
        const user = await userService.getUserByUsernameService(req.params.username); // Use service
        if (user) {
            const transformedUser = transformUser(user);
            sendResponse(res, 200, "User retrieved successfully", transformedUser);
        } else {
            return next(createHttpError(404, "User not found"));
        }
    } catch (error) {
        logger.error(
            `Error retrieving user with username: ${req.params.username}`,
            error
        );
        next(createHttpError(500, "Failed to retrieve user", { message: error.message }));
    }
});

// @desc    Get user by email
// @route   GET /users/email/:email
// @access  Private
const getUserByEmail = asyncHandler(async (req, res, next) => {
    logger.info(`getUserByEmail called with email: ${req.params.email}`);
    try {
        const user = await userService.getUserByEmailService(req.params.email); // Use service
        if (user) {
            const transformedUser = transformUser(user);
            sendResponse(res, 200, "User retrieved successfully", transformedUser);
        } else {
            return next(createHttpError(404, "User not found"));
        }
    } catch (error) {
        logger.error(
            `Error retrieving user with email: ${req.params.email}`,
            error
        );
        next(createHttpError(500, "Failed to retrieve user", { message: error.message }));
    }
});

// @desc    Get users by role
// @route   GET /users/role/:role
// @access  Private
const getUsersByRole = asyncHandler(async (req, res, next) => {
    logger.info(`getUsersByRole called with role: ${req.params.role}`);
    try {
        const users = await userService.getUsersByRoleService(req.params.role); // Use service
        if (users && users.length > 0) {
            sendResponse(res, 200, "Users retrieved successfully", users);
        } else {
            return next(createHttpError(404, "Users not found"));
        }
    } catch (error) {
        logger.error(`Error retrieving users with role: ${req.params.role}`, error);
        next(createHttpError(500, "Failed to retrieve users", { message: error.message }));
    }
});

// @desc    Delete all users
// @route   DELETE /users
// @access  Private
const deleteAllUsers = asyncHandler(async (req, res, next) => {
    logger.warn("deleteAllUsers called - USE WITH CAUTION!");
    try {
        const result = await userService.deleteAllUsersService(); // Use service
        sendResponse(res, 200, "All users deleted successfully", {
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        logger.error("Error deleting all users:", error);
        next(createHttpError(500, "Failed to delete all users", { message: error.message }));
    }
});

const updateUser = async (userId, updates, next) => {
    try {
        const user = await userService.updateUserByIdService(userId, updates);

        if (!user) {
            return next(createHttpError(404, "User not found"));
        }

        const transformedUser = transformUser(user);
        return transformedUser;
    } catch (error) {
        logger.error(`Error updating user with ID: ${userId}`, error);
        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map((val) => val.message);
            return next(createHttpError(400, "Validation error", { message: errors.join(". ") }));
        }
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            const value = error.keyValue[field];
            return next(createHttpError(409, `Duplicate ${field}`, { message: `${field} '${value}' already exists` }));
        }
        if (error.name === "CastError" && error.kind === "ObjectId") {
            return next(createHttpError(400, "Invalid user ID format"));
        }
        return next(createHttpError(500, "Failed to update user", { message: error.message }));
    }
};

// @desc    Update user by ID
// @route   PUT /users/:_id
// @access  Private
const updateUserById = asyncHandler(async (req, res, next) => {
    logger.info(`updateUserById called with ID: ${req.params._id}`);
    try {
        const updates = transformUserData(req.body);

        const transformedUser = await updateUser(req.params._id, updates, next);
        sendResponse(res, 200, "User updated successfully", transformedUser);
    } catch (error) {
        logger.error(`Error updating user with ID: ${req.params._id}`, error);
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
};