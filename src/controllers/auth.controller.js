// eslint-disable-next-line no-unused-vars
const passport = require('passport');
const asyncHandler = require("express-async-handler");
const { 
  registerService, 
  authenticateUserService, 
  forgotPasswordService, 
  resetPasswordService,
  getUserByEmailService, // Add this service function
  verifyUserTokenService // Add this service function
} = require("../services/auth.service.js");
const sendResponse = require("../utils/response");
const { AuthError } = require("../utils/errors");
const { createLogger } = require("../utils/logger");
const { generateToken, extractTokenFromRequest } = require('../auth/jwt');
const { blacklistToken } = require('../utils/auth.utils');
const { sanitizeUserData } = require('../utils/user.utils'); // Add utility for data transformation
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
const logout = async (req, res, next) => {
  try {
    // Extract token if present (for JWT invalidation)
    const token = extractTokenFromRequest(req);
    let jwtInvalidated = false;
    
    // Blacklist the JWT token if present
    if (token) {
      // Get the client IP address for auditing
      const ipAddress = req.ip || req.connection.remoteAddress;
      
      // Add token to blacklist with user ID and IP address
      jwtInvalidated = await blacklistToken(token, 'logout', ipAddress);
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

/**
 * @desc    Handle forgot password request
 * @route   POST /auth/forgot-password
 * @access  Public
 */
// eslint-disable-next-line no-unused-vars
const forgotPassword = asyncHandler(async (req, res, next) => {
  logger.info("forgotPassword controller called");
  
  try {
    const { email } = req.body;
    await forgotPasswordService(email);
    
    // For security reasons, always return success even if email doesn't exist
    sendResponse(
      res,
      200,
      "If a user with that email exists, a password reset link has been sent"
    );
  } catch (error) {
    logger.error("Error in forgotPassword controller:", error);
    
    // Still return success for security reasons
    sendResponse(
      res,
      200,
      "If a user with that email exists, a password reset link has been sent"
    );
  }
});

/**
 * @desc    Reset password with token
 * @route   POST /auth/reset-password
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res, next) => {
  logger.info("resetPassword controller called");
  
  try {
    const { token, password } = req.body;
    const result = await resetPasswordService(token, password);
    
    if (result.success) {
      // Log additional information for debugging
      logger.debug(`Password reset successful. User can now login with new password. User ID: ${result.userId}, Email: ${result.email}`);
      
      sendResponse(res, 200, "Password has been reset successfully. Please login with your new password.");
    } else {
      return next(AuthError.invalidToken("Password reset token is invalid or has expired"));
    }
  } catch (error) {
    logger.error("Error in resetPassword controller:", error);
    next(error);
  }
});

/**
 * @desc    Verify token validity
 * @route   GET /auth/verify
 * @access  Public
 */
const verifyTokenValidity = asyncHandler(async (req, res, next) => {
  try {
    // Extract token from request
    const token = extractTokenFromRequest(req);
    if (!token) {
      return sendResponse(res, 401, "No token provided");
    }
    
    // Use service to verify token and get user
    const result = await verifyUserTokenService(token);
    
    if (result.success) {
      sendResponse(res, 200, "Token is valid", { user: result.user });
    } else {
      sendResponse(res, 401, result.message || "Token is invalid");
    }
  } catch (error) {
    logger.error("Error verifying token:", error);
    next(error);
  }
});

/**
 * @desc    Debug endpoint to check user status (DEV ONLY)
 * @route   GET /auth/debug/:email
 * @access  Private/Admin
 */
const debugUserStatus = asyncHandler(async (req, res, next) => {
  // This endpoint should only be available in development
  if (process.env.NODE_ENV === 'production') {
    return next(new Error('Debug endpoints not available in production'));
  }
  
  try {
    const email = req.params.email;
    // Use service instead of direct DB access
    const user = await getUserByEmailService(email);
    
    if (!user) {
      return sendResponse(res, 404, "User not found");
    }
    
    // Return basic user info and account status with sanitized data
    const userData = sanitizeUserData(user, ['tokenVersion', 'failedLoginAttempts', 'lockedUntil']);
    
    // Add password hash preview separately with security measures
    userData.passwordHash = user.password ? (user.password.substring(0, 10) + '...') : 'not set';
    userData.isLocked = user.lockedUntil && user.lockedUntil > new Date();
    
    sendResponse(res, 200, "User status retrieved", userData);
  } catch (error) {
    logger.error("Error in debugUserStatus controller:", error);
    next(error);
  }
});

module.exports = {
  register,
  login,
  getToken,
  loginSuccess,
  logout,
  forgotPassword,
  resetPassword,
  verifyTokenValidity,
  debugUserStatus
};
