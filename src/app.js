// src/app.js
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/database.js");
const routes = require("./routes/index.js");
const errorMiddleware = require("./middlewares/error.middleware.js");
const { globalLimiter } = require("./middlewares/rateLimit.middleware.js");
const swaggerUi = require("swagger-ui-express");
const swaggerConfig = require("./config/swagger.js");
const passport = require("./config/passport.js");
const session = require("./config/session.js");
const { createLogger } = require("./utils/logger.js");
const config = require("./config/config.js");

// Create module-specific logger
const logger = createLogger('App');

const app = express();

// Trust proxy - required when running behind a reverse proxy like Render
// This enables the rate limiter to use X-Forwarded-For header for client IP
app.set('trust proxy', 1);

// Apply global rate limiter to all requests
app.use(globalLimiter);

// Middleware
app.use(cors(config.cors));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session);
app.use(passport.initialize());
app.use(passport.session());

// Enhanced session debugging middleware
app.use((req, res, next) => {
  // Only log for relevant routes (auth, users, dashboard)
  const relevantRoutes = ['/auth', '/users', '/dashboard'];
  const isRelevantRoute = relevantRoutes.some(route => req.path.startsWith(route));
  
  if (isRelevantRoute) {
    logger.debug("Session debug:", {
      path: req.path,
      method: req.method,
      sessionID: req.sessionID || 'no-session-id',
      authenticated: req.isAuthenticated ? req.isAuthenticated() : 'not-available',
      user: req.user ? {
        id: req.user._id || req.user.sub || 'no-id',
        username: req.user.username || 'no-username',
        email: req.user.email || 'no-email'
      } : 'no-user-in-session',
      headers: {
        cookie: req.headers.cookie ? 'present' : 'absent',
        authorization: req.headers.authorization ? 'present' : 'absent'
      },
      cookies: Object.keys(req.cookies || {})
    });
  }
  
  next();
});

// Database Connection - using improved connect method
connectDB().catch(err => {
  logger.error("Failed to connect to database on startup:", err);
});

// Static files
app.use(express.static("public"));

// Routes
// CHECK src/routes/index.js FOR MIDDLEWARE ERRORS
app.use("/", routes);

// Swagger Documentation with custom options
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerConfig, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: `Inventory API Documentation - ${config.env.toUpperCase()} Environment`,
  })
);

// Error Handling Middleware
app.use(errorMiddleware);

module.exports = app;
