// src/config/swagger.js
const config = require("./config");
const authRoutes = require('../docs/auth.docs');
const userRoutes = require('../docs/user.docs');
const productRoutes = require('../docs/product.docs');
const supplierRoutes = require('../docs/supplier.docs');
const orderRoutes = require('../docs/order.docs');
const customerRoutes = require('../docs/customer.docs');
const purchaseRoutes = require('../docs/purchase.docs');
const components = require('../docs/components');

const swaggerConfig = {
  openapi: '3.0.0',
  info: {
    title: 'Inventory Management API',
    version: '1.0.0',
    description: 'CSE 341 Final project - Team 14 - API documentation for the Inventory Management project',
    contact: {
      name: 'API Support',
      email: 'support@smartfarm.com'
    }
  },
  servers: [
    {
      url: config.env === 'production' 
        ? 'https://cse341-final-project-team-14.onrender.com'
        : 'http://localhost:3000',
      description: config.env === 'production' ? 'Production server' : 'Development server'
    }
  ],
  tags: [
    { name: 'Authentication', description: 'Authentication endpoints' },
    { name: 'Users', description: 'User management endpoints' },
    { name: 'Products', description: 'Product management endpoints' },
    { name: 'Suppliers', description: 'Supplier management endpoints' },
    { name: 'Orders', description: 'Order management endpoints' },
    { name: 'Customers', description: 'Customer management endpoints' },
    { name: 'Purchases', description: 'Purchase management endpoints' }
  ],
  components: components,
  paths: {
    ...authRoutes,
    ...userRoutes,
    ...productRoutes,
    ...supplierRoutes,
    ...orderRoutes,
    ...customerRoutes,
    ...purchaseRoutes
  }
};

module.exports = swaggerConfig;
