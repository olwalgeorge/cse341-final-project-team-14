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

// Apply global rate limiter to all requests
app.use(globalLimiter);

// Middleware
app.use(cors(config.cors));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session);
app.use(passport.initialize());
app.use(passport.session());

// Add this before routes to debug session issues
app.use((req, res, next) => {
  logger.debug("Session:", {
    id: req.sessionID,
    authenticated: req.isAuthenticated(),
    user: req.user?._id,
  });
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
