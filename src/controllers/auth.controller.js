// eslint-disable-next-line no-unused-vars
const passport = require('passport');
const asyncHandler = require("express-async-handler");
const { registerService, authenticateUserService } = require("../services/auth.service.js");
const sendResponse = require("../utils/response");
const { AuthError } = require("../utils/errors");
const { createLogger} = require("../utils/logger");
const logger = createLogger("AuthController");

/**
 * @desc    Register a new user
 * @route   POST /auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res, next) => {
  logger.info("register controller called");
  
  try {
    const { user } = await registerService(req.body);
    
    // Remove password from response
    const userData = { ...user.toObject() };
    delete userData.password;
    
    // Log in the user automatically after registration
    req.login(user, (err) => {
      if (err) {
        logger.error("Error during automatic login after registration:", err);
        return next(AuthError.loginError('Registration successful but could not log in automatically'));
      }
      
      sendResponse(
        res,
        201,
        "User registered successfully",
        { user: userData }
      );
    });
  } catch (error) {
    logger.error("Error in register controller:", error);
    next(error);
  }
});

/**
 * @desc    Login a user
 * @route   POST /auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res, next) => {
  logger.info("login controller called");
  
  try {
    // Authenticate directly using the service
    const user = await authenticateUserService(req.body.email, req.body.password);
    
    // Log in the user with passport session
    req.login(user, (loginErr) => {
      if (loginErr) {
        logger.error('Session login error:', loginErr);
        return next(AuthError.loginError('Could not create login session'));
      }
      
      // Login successful, send response
      return loginSuccess(req, res, next);
    });
  } catch (error) {
    logger.error("Error in login controller:", error);
    next(error);
  }
});

/**
 * @desc    Login success handler
 * @access  Private
 */
const loginSuccess = asyncHandler(async (req, res) => {
  // User is already authenticated at this point
  if (!req.user) {
    throw AuthError.unauthorized("User not authenticated");
  }
  
  // Create a sanitized user object without sensitive data
  const userData = { ...req.user.toObject() };
  delete userData.password;
  delete userData.resetPasswordToken;
  delete userData.resetPasswordExpires;
  
  // Send successful response
  sendResponse(
    res,
    200,
    "Login successful",
    { user: userData }
  );
});

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
  login,
  loginSuccess,
  logout,
};
