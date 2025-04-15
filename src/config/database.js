// src/config/database.js
const mongoose = require("mongoose");
const { db } = require("../config/config.js");
const { createLogger } = require("../utils/logger.js");
const logger = createLogger("Database");

const connectDB = async () => {
  try {
    // Connect to MongoDB
    const conn = await mongoose.connect(db.uri);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    logger.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
