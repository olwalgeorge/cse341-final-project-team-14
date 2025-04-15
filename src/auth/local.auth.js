// src/config/passport.js
const { Strategy: LocalStrategy } = require("passport-local");
const { authenticateUserService } = require("../services/auth.service");


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
      // Use the authenticateUserService to handle all authentication logic
      const user = await authenticateUserService(email, password);
      return done(null, user);
    } catch (error) {
      // Service handles all error types, just pass them through
      return done(error);
    }
  }
);

module.exports = localStrategy;
