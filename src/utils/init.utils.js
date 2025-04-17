const User = require('../models/user.model');
const { createLogger } = require('./logger');
const { generateUserId } = require('./user.utils');
const bcrypt = require('bcryptjs');

const logger = createLogger('InitUtils');

/**
 * Initialize system with a superadmin account if one doesn't exist
 * @param {Object} config - Configuration object with superadmin credentials
 * @returns {Promise<boolean>} - Success indicator
 */
async function initializeSuperAdmin(config = {}) {
  try {
    // Check if any SUPERADMIN exists
    const existingSuperAdmin = await User.findOne({ role: 'SUPERADMIN' });
    
    if (existingSuperAdmin) {
      logger.info('SUPERADMIN account already exists. Skipping initialization.');
      return true;
    }
    
    // Default superadmin details if not provided in config
    const email = config.email || process.env.SUPERADMIN_EMAIL || 'superadmin@example.com';
    const password = config.password || process.env.SUPERADMIN_PASSWORD || 'SuperAdmin123!';
    const username = config.username || process.env.SUPERADMIN_USERNAME || 'superadmin';
    const fullName = config.fullName || process.env.SUPERADMIN_NAME || 'Super Administrator';
    
    // Generate a user ID
    const userID = await generateUserId();
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create the superadmin user
    const superadmin = new User({
      email,
      password: hashedPassword,
      username,
      fullName,
      userID,
      role: 'SUPERADMIN',
      isVerified: true, // Auto-verify the superadmin
      isActive: true
    });
    
    await superadmin.save();
    
    logger.info(`SUPERADMIN account created successfully: ${username} (${email})`);
    logger.warn('Make sure to change the default superadmin password after first login!');
    
    return true;
  } catch (error) {
    logger.error('Failed to initialize SUPERADMIN account:', error);
    return false;
  }
}

module.exports = {
  initializeSuperAdmin
};
