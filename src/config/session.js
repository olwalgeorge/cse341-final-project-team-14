// config/session.js
// Import required modules
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { createLogger } = require('../utils/logger');
const logger = createLogger('session');

// Use environment variables
const sessionSecret = process.env.SESSION_SECRET || 'default_session_secret';
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory';

const sessionOptions = {
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  },
  store: MongoStore.create({
    mongoUrl: mongoUri,
    ttl: 24 * 60 * 60, // 24 hours
    autoRemove: 'native',
    touchAfter: 10 * 60, // 10 minutes
    crypto: {
      secret: sessionSecret
    },
    // Fix serialization issue
    serialize: (session) => {
      // Create a plain object with only needed properties
      const serializedSession = {
        _id: session._id,
        expires: session.expires,
        session: session.session
      };
      
      // Remove any circular references or non-serializable content
      if (serializedSession.session && serializedSession.session.passport) {
        // Store only the user ID if passport data exists
        if (serializedSession.session.passport.user) {
          const userId = serializedSession.session.passport.user;
          serializedSession.session.passport = { user: userId.toString() };
        }
      }
      
      return JSON.stringify(serializedSession);
    },
    // Custom deserializer to safely parse session data
    unserialize: (sessionString) => {
      try {
        return JSON.parse(sessionString);
      } catch (err) {
        logger.error('Failed to deserialize session:', err);
        return {};
      }
    }
  })
};

// Log some information about the session configuration
logger.info('Session configuration initialized', {
  secure: sessionOptions.cookie.secure,
  sameSite: sessionOptions.cookie.sameSite,
  maxAge: sessionOptions.cookie.maxAge / (60 * 1000) + ' minutes'
});

module.exports = session(sessionOptions);
