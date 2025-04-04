// src/config/swagger.js
const config = require("./config");
const authRoutes = require('../docs/auth.docs');
const userRoutes = require('../docs/user.docs');
const components = require('../docs/components');

const swaggerConfig = {
  openapi: '3.0.0',
  info: {
    title: 'Smart Farm API',
    version: '1.0.0',
    description: 'API documentation for the Smart Farm project',
    contact: {
      name: 'API Support',
      email: 'support@smartfarm.com'
    }
  },
  servers: [
    {
      url: config.env === 'production' 
        ? 'https://cse341-w03-project-02.onrender.com'
        : 'http://localhost:3000',
      description: config.env === 'production' ? 'Production server' : 'Development server'
    }
  ],
  tags: [
    { name: 'Authentication', description: 'Authentication endpoints' },
    { name: 'Users', description: 'User management endpoints' },
    { name: 'Sensors', description: 'Sensor management endpoints' }
  ],
  components: components,
  paths: {
    ...authRoutes,
    ...userRoutes,
    
  }
};

module.exports = swaggerConfig;
