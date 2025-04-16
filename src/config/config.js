// src/config/config.js

require("dotenv").config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
});

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI environment variable is required");
}

// Base configuration shared across all environments
const baseConfig = {
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
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  },
  auth: {
    useTokenBlacklist: process.env.USE_TOKEN_BLACKLIST === 'true' || false,
  }
};

// Environment-specific configurations
const environments = {
  development: {
    env: 'development',
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:8080'],
      credentials: true,
    },
    swagger: {
      server: 'http://localhost:3000'
    }
  },
  test: {
    env: 'test',
    cors: {
      origin: ['http://localhost:3001', 'http://localhost:8080'],
      credentials: true,
    },
    swagger: {
      server: 'http://localhost:3001'
    }
  },
  production: {
    env: 'production',
    // Format hostname to ensure it has https:// prefix
    appUrl: formatHostname(process.env.RENDER_EXTERNAL_HOSTNAME) || 'https://cse341-final-project-team-14.onrender.com',
    cors: {
      origin: function(origin, callback) {
        const allowedOrigins = [
          formatHostname(process.env.RENDER_EXTERNAL_HOSTNAME) || 'https://cse341-final-project-team-14.onrender.com'
        ];
        // Allow requests with no origin (like mobile apps, curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
          return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
    },
    swagger: {
      server: formatHostname(process.env.RENDER_EXTERNAL_HOSTNAME) || 'https://cse341-final-project-team-14.onrender.com'
    }
  },
};

// Helper function to ensure hostname has https:// prefix
function formatHostname(hostname) {
  if (!hostname) return null;
  return hostname.startsWith('http') ? hostname : `https://${hostname}`;
}

// Determine current environment
const currentEnv = process.env.NODE_ENV || 'development';

// Merge base config with environment-specific config
const config = {
  ...baseConfig,
  ...environments[currentEnv]
};

module.exports = config;
