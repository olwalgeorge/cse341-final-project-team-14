/**
 * Environment Variable Validator
 * 
 * This utility validates that all required environment variables are present
 * and properly formatted before the server starts.
 */
const { createLogger } = require("../utils/logger");
const logger = createLogger('EnvValidator');

/**
 * Groups of environment variables for different features
 */
const ENV_GROUPS = {
  core: [
    { name: 'MONGO_URI', validator: (val) => val && val.includes('mongodb'), required: true },
    { name: 'NODE_ENV', validator: (val) => ['development', 'test', 'production'].includes(val), required: true },
    { name: 'PORT', validator: (val) => !isNaN(parseInt(val)), required: true },
    { name: 'SESSION_SECRET', validator: (val) => val && val.length >= 8, required: true },
    { name: 'JWT_SECRET', validator: (val) => val && val.length >= 8, required: true },
    { name: 'JWT_EXPIRES_IN', validator: (val) => val && val.length > 0, required: true }
  ],
  production: [
    { name: 'RENDER_EXTERNAL_HOSTNAME', validator: (val) => val && val.startsWith('https://'), required: true }
  ],
  githubOAuth: [
    { name: 'GITHUB_CLIENT_ID', validator: (val) => val && val.length > 0, required: true },
    { name: 'GITHUB_CLIENT_SECRET', validator: (val) => val && val.length > 0, required: true },
    { name: 'GITHUB_CALLBACK_URL', validator: (val) => val && val.includes('/auth/github/callback'), required: true }
  ]
};

/**
 * Validates required environment variables
 * @returns {Object} Result object with success flag and optional error info
 */
function validateEnvironment() {
  const result = {
    success: true,
    errors: [],
    warnings: [],
    features: {
      githubOAuth: false
    }
  };
  
  // Check core variables
  validateGroup(ENV_GROUPS.core, result);
  
  // Check environment-specific variables
  if (process.env.NODE_ENV === 'production') {
    validateGroup(ENV_GROUPS.production, result);
  }
  
  // Check GitHub OAuth - these are optional but must be valid if provided
  const hasAnyGithubVars = ENV_GROUPS.githubOAuth.some(v => !!process.env[v.name]);
  if (hasAnyGithubVars) {
    validateGroup(ENV_GROUPS.githubOAuth, result);
    
    // Mark GitHub OAuth as available only if all variables are valid
    if (!result.errors.some(err => ENV_GROUPS.githubOAuth.some(v => v.name === err.name))) {
      result.features.githubOAuth = true;
    }
  } else {
    // Add a warning that GitHub OAuth won't be available
    result.warnings.push({
      feature: 'GitHub OAuth',
      message: 'GitHub OAuth is not configured and will be disabled'
    });
  }
  
  // Final success determination
  result.success = result.errors.length === 0;
  
  return result;
}

/**
 * Validates a group of environment variables
 * @param {Array} group - Array of variable config objects
 * @param {Object} result - Result object to update
 */
function validateGroup(group, result) {
  for (const varConfig of group) {
    const value = process.env[varConfig.name];
    if (!value || !varConfig.validator(value)) {
      if (varConfig.required) {
        result.errors.push({
          name: varConfig.name,
          value: value ? '[PRESENT BUT INVALID]' : '[MISSING]'
        });
      } else {
        result.warnings.push({
          name: varConfig.name,
          value: value ? '[PRESENT BUT INVALID]' : '[MISSING]'
        });
      }
    }
  }
}

/**
 * Logs environment configuration summary (safe for logging)
 * @param {Object} validationResult - The validation result object
 */
function logEnvironmentSummary(validationResult) {
  const env = process.env.NODE_ENV || 'development';
  
  logger.info('=============== ENVIRONMENT SUMMARY ===============');
  logger.info(`Environment: ${env.toUpperCase()}`);
  logger.info(`Port: ${process.env.PORT}`);
  logger.info(`Database: ${maskSensitiveInfo(process.env.MONGO_URI)}`);
  
  if (env === 'production') {
    logger.info(`External URL: ${process.env.RENDER_EXTERNAL_HOSTNAME}`);
  }
  
  // Features status
  logger.info('------- Features Status -------');
  Object.entries(validationResult.features).forEach(([feature, enabled]) => {
    logger.info(`${feature}: ${enabled ? 'Enabled ✅' : 'Disabled ❌'}`);
  });
  
  // Warnings
  if (validationResult.warnings.length > 0) {
    logger.warn('------- Configuration Warnings -------');
    validationResult.warnings.forEach(warning => {
      if (warning.name) {
        logger.warn(`- ${warning.name}: ${warning.value}`);
      } else {
        logger.warn(`- ${warning.feature}: ${warning.message}`);
      }
    });
  }
  
  logger.info('===============================================');
}

/**
 * Masks sensitive information for logging
 * @param {string} str - String that might contain sensitive information
 * @returns {string} Masked string safe for logging
 */
function maskSensitiveInfo(str) {
  if (!str) return '';
  
  // Mask MongoDB connection string
  if (str.includes('mongodb')) {
    try {
      const url = new URL(str);
      
      // Mask username and password if present
      if (url.username) {
        url.username = url.username.substring(0, 2) + '****';
      }
      
      if (url.password) {
        url.password = '********';
      }
      
      // Return masked URL
      return url.toString();
    } catch (err) {
      // If URL parsing fails, do basic masking
      return str.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
    }
  }
  
  return str;
}

/**
 * Get feature availability status based on validation result
 * @param {Object} validationResult - The validation result object
 * @returns {Object} Feature availability status
 */
function getFeatureStatus(validationResult) {
  return validationResult.features;
}

module.exports = {
  validateEnvironment,
  logEnvironmentSummary,
  getFeatureStatus
};
