require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
const mongoose = require('mongoose');
const { createLogger } = require('../utils/logger');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const { generateUserId } = require('../utils/user.utils');

const logger = createLogger('ResetSuperadmin');

async function resetSuperadmin() {
  try {
    // Connect to the database
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    logger.info('Connected to database');

    // Remove existing superadmin accounts
    const result = await User.deleteMany({ role: 'SUPERADMIN' });
    logger.info(`Removed ${result.deletedCount} existing superadmin accounts`);
    
    // Default values or from environment
    const email = process.env.SUPERADMIN_EMAIL || 'superadmin@example.com';
    const password = process.env.SUPERADMIN_PASSWORD || 'SuperAdmin123!';
    const username = process.env.SUPERADMIN_USERNAME || 'superadmin';
    const fullName = process.env.SUPERADMIN_NAME || 'Super Administrator';
    
    // Generate user ID
    const userID = await generateUserId();
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new superadmin account
    const superadmin = new User({
      email,
      password: hashedPassword,
      username,
      fullName,
      userID,
      role: 'SUPERADMIN',
      isVerified: true,
      isActive: true
    });
    
    await superadmin.save();
    
    logger.info(`SUPERADMIN account created successfully:`);
    logger.info(`Email: ${email}`);
    logger.info(`Username: ${username}`);
    logger.info(`Full Name: ${fullName}`);
    logger.warn('IMPORTANT: Change this password after first login!');
    
    mongoose.connection.close();
  } catch (error) {
    logger.error('Failed to reset superadmin:', error);
    process.exit(1);
  }
}

resetSuperadmin();
