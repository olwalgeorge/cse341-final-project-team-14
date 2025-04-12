// src/config/passport.js
// eslint-disable-next-line no-unused-vars
const passport = require("passport");
const { Strategy: LocalStrategy } = require("passport-local");
const User = require("../models/user.model.js");
const logger = require("../utils/logger");
const AuthError = require("../utils/errors/AuthError");

const localStrategy = new LocalStrategy(
  {
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true,
  },
  async (req, email, password, done) => {
    try {
      // Validate email format
      if (!email || !email.includes("@")) {
        logger.warn("Login failed: Invalid email format");
        return done(
          AuthError.invalidCredentials("Please enter a valid email address")
        );
      }

      // Make sure to include password in the query
      const user = await User.findOne({ email: email.toLowerCase() }).select(
        "+password"
      );

      if (!user) {
        logger.warn(`Login failed: No account found for email - ${email}`);
        return done(
          AuthError.invalidCredentials("No account found with this email")
        );
      }

      const isMatch = await user.isPasswordMatch(password);
      if (!isMatch) {
        logger.warn(`Login failed: Wrong password for email - ${email}`);
        return done(AuthError.invalidCredentials("Incorrect password"));
      }

      // Log more info about the user being authenticated
      logger.info(`User ${user.username} (ID: ${user._id}, userID: ${user.userID}) logged in successfully`);
      return done(null, user);
    } catch (error) {
      logger.error("Login error:", { error: error.message, email });
      return done(AuthError.loginError());
    }
  }
);

module.exports = localStrategy;
