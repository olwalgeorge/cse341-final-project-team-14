// src/middlewares/auth.middleware.js

const {createLogger} = require('../utils/logger');
// Fix: Import AuthError from the unified errors.js file instead of a separate file
const { AuthError } = require('../utils/errors');
const logger = createLogger("auth.middleware.js");

const isAuthenticated = (req, res, next) => {
  logger.debug("Auth check:", {
    sessionID: req.sessionID,
    isAuthenticated: req.isAuthenticated(),
    user: req.user?._id,
    cookies: req.cookies,
    session: req.session,
  });

  if (!req.session) {
    logger.error("No session found");
    return next(new AuthError("No session found", "SESSION_ERROR", 500));
  }

  if (req.isAuthenticated()) {
    logger.info(`User ${req.user?.username || req.user?._id} is authenticated`);
    return next();
  }

  logger.warn("Authentication failed - no session");
  next(new AuthError("Authentication required", "AUTH_REQUIRED", 401));
};

module.exports = isAuthenticated;
