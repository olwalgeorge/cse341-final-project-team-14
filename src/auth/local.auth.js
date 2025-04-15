// src/config/passport.js
const { Strategy: LocalStrategy } = require("passport-local");
const { authenticateUserService } = require("../services/auth.service");
const { createLogger } = require("../utils/logger");

// Create module-specific logger
const logger = createLogger('LocalAuth');

/**
 * Local strategy for username/password authentication
 * Uses the centralized authenticateUserService for consistent error handling
 */
const localStrategy = new LocalStrategy(
  {
    usernameField: "email",
    passwordField: "password",
  },
  async (email, password, done) => {
    try {
      logger.debug(`Attempting authentication for email: ${email}`);
      // Use the authenticateUserService to handle all authentication logic
      const user = await authenticateUserService(email, password);
      logger.info(`Local authentication successful for user: ${user.username}`);
      return done(null, user);
    } catch (error) {
      // Service handles all error types, just pass them through
      logger.error(`Local authentication failed: ${error.message}`);
      return done(error);
    }
  }
);

module.exports = localStrategy;
