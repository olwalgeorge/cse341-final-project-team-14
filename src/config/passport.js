const passport = require("passport");
const User = require("../models/user.model");
const { createLogger } = require("../utils/logger");
const { validateEnvironment, getFeatureStatus } = require("../validators/envValidator");

const logger = createLogger('Passport');

// Initialize passport with user serialization/deserialization
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Check which authentication strategies are available
const validationResult = validateEnvironment();
const features = getFeatureStatus(validationResult);

// Conditionally initialize GitHub strategy
if (features.githubOAuth) {
  try {
    const githubStrategy = require("../auth/github");
    passport.use(githubStrategy);
    logger.info('GitHub authentication strategy initialized successfully');
  } catch (error) {
    logger.warn(`GitHub authentication strategy could not be initialized: ${error.message}`);
    logger.debug(error.stack);
  }
} else {
  logger.warn('GitHub authentication is disabled due to missing or invalid configuration');
}


module.exports = passport;
