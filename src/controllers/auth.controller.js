// eslint-disable-next-line no-unused-vars
const passport = require('passport');
const asyncHandler = require("express-async-handler");
const { registerService, authenticateUserService } = require("../services/auth.service.js");
const sendResponse = require("../utils/response");
const { AuthError } = require("../utils/errors");
const { createLogger } = require("../utils/logger");
const { generateToken, extractTokenFromRequest } = require('../auth/jwt');
const { blacklistToken } = require('../utils/auth.utils');
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
 * @desc    Login a user and generate JWT
 * @route   POST /auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res, next) => {
  logger.info("login controller called");
  
  try {
    // Authenticate directly using the service
    const user = await authenticateUserService(req.body.email, req.body.password);
    
    // Generate a token after successful validation
    const token = generateToken(user);

    // Return both token and user data
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          _id: user._id,
          userID: user.userID,
          username: user.username,
          email: user.email,
          role: user.role,
          fullName: user.fullName
        }
      }
    });
  } catch (error) {
    logger.error("Error in login controller:", error);
    next(error);
  }
});

/**
 * @desc    Get JWT token for already authenticated user (via passport)
 * @route   GET /auth/token
 * @access  Private
 */
const getToken = asyncHandler(async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
        error: 'User must be logged in'
      });
    }

    const token = generateToken(req.user);
    
    return res.status(200).json({
      success: true,
      message: 'Token generated successfully',
      data: { token }
    });
  } catch (error) {
    logger.error('Token generation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate token',
      error: error.message
    });
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
  try {
    // Extract token if present (for JWT invalidation)
    const token = extractTokenFromRequest(req);
    let jwtInvalidated = false;
    
    // Blacklist the JWT token if present
    if (token) {
      jwtInvalidated = blacklistToken(token);
      logger.info('JWT token blacklisted during logout');
    }
    
    // Handle session logout if using session-based auth
    req.logout((err) => {
      if (err) {
        logger.error("Error during session logout:", err);
        return next(AuthError.loginError());
      }
      
      // Destroy the session completely
      req.session.destroy((sessionErr) => {
        if (sessionErr) {
          logger.error("Error destroying session:", sessionErr);
        }
        
        // Clear session cookie
        res.clearCookie('sessionId');
        
        logger.info(`User logged out successfully: session destroyed and JWT ${jwtInvalidated ? 'invalidated' : 'not present'}`);
        sendResponse(res, 200, "Logged out successfully");
      });
    });
  } catch (error) {
    logger.error("Error during logout:", error);
    next(error instanceof AuthError ? error : AuthError.loginError());
  }
};

module.exports = {
  register,
  login,
  getToken,
  loginSuccess,
  logout,
};
