// src/config/database.js
const mongoose = require("mongoose");
const { db } = require("../config/config.js");
const logger = require("../utils/logger.js");

const connectDB = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(db.uri);
    logger.info("MongoDB Connected...");
  } catch (err) {
    logger.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
