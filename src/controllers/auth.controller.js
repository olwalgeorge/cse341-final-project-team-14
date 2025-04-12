const sendResponse = require("../utils/response.js");
const asyncHandler = require("express-async-handler");
const logger = require("../utils/logger.js");
const { AuthError, ApiError } = require("../utils/errors");
const { transformUser } = require("../utils/user.utils.js");
const authService = require("../services/auth.service.js");

/**
 * @desc    Register new user
 * @route   POST /auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res, next) => {
  logger.info("Register endpoint called");
  logger.debug("Request body:", req.body);

  try {
    const user = await authService.registerUser(req.body);
    // Log in the user after registration
    req.login(user, (err) => {
      if (err) {
        logger.error("Error logging in after registration:", err);
        return next(
          ApiError.serverError("Registration successful but login failed")
        );
      }
      // Log the user ID being used
      logger.info(`User ${user.username} (ID: ${user._id}, userID: ${user.userID}) logged in after registration`);
      const transformedUser = transformUser(user);
      sendResponse(res, 201, "Registration successful", {
        user: transformedUser,
      });
    });
  } catch (error) {
    logger.error("Error during registration:", error);
    // Pass raw validation errors to middleware
    next(error);
  }
});

/**
 * @desc    Login user
 * @route   POST /auth/login
 * @access  Public
 */
const loginSuccess = (req, res) => {
  // Log the user ID being returned
  logger.info(`User ${req.user.username} (ID: ${req.user._id}, userID: ${req.user.userID}) login success response`);
  const transformedUser = transformUser(req.user);
  sendResponse(res, 200, "Login successful", { user: transformedUser });
};

/**
 * @desc    Logout user
 * @route   POST /auth/logout
 * @access  Private
 */
const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      logger.error("Error during logout:", err);
      return next(AuthError.loginError());
    }
    logger.info(`User logged out successfully.`);
    sendResponse(res, 200, "Logged out successfully");
  });
};

module.exports = {
  register,
  loginSuccess,
  logout,
};
