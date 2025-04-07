// config/session.js
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const { env, db, sessionSecret } = require("./config");

const store = new MongoDBStore({
  uri: db.uri,
  collection: "sessions",
  touchAfter: 24 * 3600, // Only update session every 24 hours unless data changes
});

// Catch errors
store.on("error", function (error) {
  console.error("MongoDB session store error:", error);
});

module.exports = session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: store,
  name: "sessionId", // Custom cookie name
  cookie: {
    httpOnly: true,
    secure: env === "production", // Only send cookie over HTTPS in production
    sameSite: env === "production" ? "none" : "lax", // Required for cross-origin requests
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: "/",
  },
  proxy: env === "production", // Trust the reverse proxy in production
});
