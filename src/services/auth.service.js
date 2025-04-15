const bcrypt = require("bcryptjs");
const User = require("../models/user.model.js");
const { createLogger } = require("../utils/logger.js");
const logger = createLogger("AuthService");
const { ValidationError, DatabaseError, AuthError } = require("../utils/errors.js");
const { generateUserId } = require("../utils/user.utils.js");

/**
 * Create a new user internally for auth service
 * @param {Object} userData - User data to create
 * @returns {Promise<Object>} Created user object
 */
const _createUser = async (userData) => {
  logger.debug("Auth service creating user with data:", userData);
  
  try {
    // Generate userID
    userData.userID = await generateUserId();
    logger.debug(`Generated userID: ${userData.userID}`);
    
    // Create new user
    const user = new User(userData);
    
    // Save to database
    return await user.save();
  } catch (error) {
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const firstErrorKey = Object.keys(error.errors)[0];
      const firstError = error.errors[firstErrorKey];
      
      throw new ValidationError(
        firstErrorKey,
        firstError.value,
        firstError.message
      );
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      
      throw new DatabaseError(
        'duplicate',
        'User',
        `A user with this ${field} already exists: ${value}`,
        'DUPLICATE'
      );
    }
    
    throw error;
  }
};

/**
 * Validate user registration data before database operations
 * @param {Object} userData - User data to validate
 * @returns {Array|null} Array of validation errors or null if valid
 */
const _validateRegistrationData = (userData) => {
  const validationErrors = [];
  
  // Check for required fields
  if (!userData.email) validationErrors.push({ field: 'email', message: 'Email is required' });
  if (!userData.password) validationErrors.push({ field: 'password', message: 'Password is required' });
  if (!userData.username) validationErrors.push({ field: 'username', message: 'Username is required' });
  if (!userData.fullName) validationErrors.push({ field: 'fullName', message: 'Full name is required' });
  
  // Email format validation
  if (userData.email && !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userData.email)) {
    validationErrors.push({ field: 'email', value: userData.email, message: 'Invalid email format' });
  }
  
  // Password strength validation
  if (userData.password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,50}$/.test(userData.password)) {
    validationErrors.push({ 
      field: 'password', 
      message: 'Password must contain at least one lowercase letter, one uppercase letter, one number, one special character, and be 8-50 characters long' 
    });
  }
  
  // Username format validation
  if (userData.username) {
    if (/^\d/.test(userData.username)) {
      validationErrors.push({ field: 'username', value: userData.username, message: 'Username cannot start with a number' });
    } else if (!/^[a-zA-Z0-9_]+$/.test(userData.username)) {
      validationErrors.push({ field: 'username', value: userData.username, message: 'Username can only contain letters, numbers, and underscores' });
    } else if (userData.username.length < 3 || userData.username.length > 20) {
      validationErrors.push({ field: 'username', value: userData.username, message: 'Username must be between 3 and 20 characters' });
    }
  }
  
  // Full name validation
  if (userData.fullName && (userData.fullName.length < 2 || userData.fullName.length > 100)) {
    validationErrors.push({ field: 'fullName', value: userData.fullName, message: 'Full name must be between 2 and 100 characters' });
  }
  
  return validationErrors.length > 0 ? validationErrors : null;
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Object} - User object without token
 */
const registerService = async (userData) => {
  logger.debug("registerService called with data:", userData);
  
  try {
    // Perform pre-database validation checks
    const validationErrors = _validateRegistrationData(userData);
    if (validationErrors) {
      logger.debug(`Validation errors found during registration: ${JSON.stringify(validationErrors)}`);
      throw ValidationError.withErrors(validationErrors);
    }
    
    // Check if user already exists
    const { email, username } = userData;
    const normalizedEmail = email.toLowerCase();
    
    // First check if either email or username exists - using one query for efficiency
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username }],
    });

    if (existingUser) {
      if (existingUser.email.toLowerCase() === normalizedEmail) {
        throw new ValidationError('email', normalizedEmail, 'Email already exists');
      } else {
        throw new ValidationError('username', username, 'Username already exists');
      }
    }
    
    // Hash password before creating user
    const salt = await bcrypt.genSalt(10);
    userData.password = await bcrypt.hash(userData.password, salt);
    
    // Use internal function to create the user
    userData.email = normalizedEmail;
    const user = await _createUser(userData);
    
    logger.info(`User registered successfully: ${username}`);
    return { user };
  } catch (error) {
    // If it's already a custom error, pass it through
    if (error instanceof ValidationError || error instanceof DatabaseError) {
      throw error;
    }
    
    logger.error("Error in registerService:", error);
    throw error;
  }
};

/**
 * Authenticate a user with email/password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - Authenticated user
 * @throws {AuthError} - If authentication fails
 */
const authenticateUserService = async (email, password) => {
  logger.debug(`authenticateUserService called for email: ${email}`);
  
  try {
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Check if user exists
    if (!user) {
      throw AuthError.invalidCredentials('Invalid email or password');
    }

    // Check if user account is active
    if (user.isActive === false) {
      throw AuthError.unauthorized('Your account is inactive');
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw AuthError.unauthorized(
        `Your account is locked until ${user.lockedUntil.toLocaleString()}`
      );
    }

    // Verify password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      // Increment failed login attempts
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

      // Lock account after 5 failed attempts
      if (user.failedLoginAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
        logger.warn(`Account locked for email: ${email}`);
      }

      await user.save();
      throw AuthError.invalidCredentials('Invalid email or password');
    }

    // Reset failed login attempts and update last login
    user.failedLoginAttempts = 0;
    user.lastLogin = new Date();
    await user.save();

    logger.info(`User authenticated successfully: ${email}`);
    return user;
  } catch (error) {
    // If it's already a custom error, pass it through
    if (error instanceof AuthError) {
      throw error;
    }
    
    // Otherwise, create a generic authentication error
    logger.error(`Authentication error for ${email}:`, error);
    throw AuthError.loginError('Authentication failed');
  }
};

module.exports = {
  registerService,
  authenticateUserService,
};
