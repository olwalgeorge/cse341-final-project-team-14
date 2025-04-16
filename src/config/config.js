// src/config/config.js

require("dotenv").config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
});

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI environment variable is required");
}

module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT || 3000,
  sessionSecret: process.env.SESSION_SECRET,
  db: {
    uri: process.env.MONGO_URI,
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackUrl: process.env.GITHUB_CALLBACK_URL,
  },
  // Rate limiting configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000), // 15 minutes by default
    max: parseInt(process.env.RATE_LIMIT_MAX || 100),                       // 100 requests per windowMs by default
    auth: {
      windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || 60 * 1000), // 1 minute for auth endpoints
      max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || 5),                    // 5 requests per minute for auth endpoints
    }
  },
};
