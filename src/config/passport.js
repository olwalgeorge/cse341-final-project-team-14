const passport = require('passport');
const LocalStrategy = require('../auth/local.auth');
const GitHubStrategy = require('../auth/github');
const User = require('../models/user.model');
const logger = require('../utils/logger');

// Strategies
passport.use(LocalStrategy);
passport.use(GitHubStrategy);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    logger.error('Error deserializing user:', error);
    done(error);
  }
});

module.exports = passport;
