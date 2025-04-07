// src/middlewares/auth.middleware.js

const logger = require("../utils/logger.js");
const AuthError = require("../utils/errors/AuthError.js");

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
