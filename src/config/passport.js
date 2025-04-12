const passport = require("passport");
const LocalStrategy = require("../auth/local.auth");
const GitHubStrategy = require("../auth/github");
const User = require("../models/user.model");
const logger = require("../utils/logger");

// Strategies
passport.use(LocalStrategy);
passport.use(GitHubStrategy);

passport.serializeUser((user, done) => {
  // Log the user ID being serialized for debugging
  logger.debug(`Serializing user: ${user.id}`);
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      logger.warn(`Failed to deserialize user: User with ID ${id} not found`);
      return done(null, false);
    }
    
    // Log successful deserialization
    logger.debug(`Deserialized user: ${user.username} (${user.id})`);
    done(null, user);
  } catch (error) {
    logger.error(`Error deserializing user with ID ${id}:`, error);
    done(error);
  }
});

module.exports = passport;
