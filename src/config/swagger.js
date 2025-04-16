// src/config/swagger.js
const config = require("./config");
const authRoutes = require("../docs/auth.docs");
const userRoutes = require("../docs/user.docs");
const productRoutes = require("../docs/product.docs");
const supplierRoutes = require("../docs/supplier.docs");
const orderRoutes = require("../docs/order.docs");
const customerRoutes = require("../docs/customer.docs");
const purchaseRoutes = require("../docs/purchase.docs");
const inventoryRoutes = require("../docs/inventory.docs");
const warehouseRoutes = require("../docs/warehouse.docs");
const inventoryTransactionRoutes = require("../docs/inventoryTransaction.docs");
const inventoryTransferRoutes = require("../docs/inventoryTransfer.docs");
const inventoryReturnRoutes = require("../docs/inventoryReturn.docs");
const inventoryAdjustmentRoutes = require("../docs/inventoryAdjustment.docs");
const components = require("../docs/components");

const swaggerConfig = {
  openapi: "3.0.0",
  info: {
    title: "Inventory Management API",
    version: "1.0.0",
    description:
      "CSE 341 Final project - Team 14 - API documentation for the Inventory Management project",
    contact: {
      name: "API Support",
      email: "support@smartfarm.com",
    },
  },
  servers: [
    {
      url: config.swagger.server,
      description: `${config.env.charAt(0).toUpperCase() + config.env.slice(1)} server`,
    },
  ],
  tags: [
    { name: "Authentication", description: "Authentication endpoints" },
    { name: "Users", description: "User management endpoints" },
    { name: "Products", description: "Product management endpoints" },
    { name: "Suppliers", description: "Supplier management endpoints" },
    { name: "Orders", description: "Order management endpoints" },
    { name: "Customers", description: "Customer management endpoints" },
    { name: "Purchases", description: "Purchase management endpoints" },
    { name: "Inventory", description: "Inventory management endpoints" },
    { name: "Warehouses", description: "Warehouse management endpoints" },
    { name: "Inventory Transactions", description: "Inventory transaction endpoints" },
    { name: "Inventory Transfers", description: "Inventory transfer endpoints" },
    { name: "Inventory Returns", description: "Inventory return endpoints" },
    { name: "Inventory Adjustments", description: "Inventory adjustment endpoints" },
  ],
  components: components,
  paths: {
    ...authRoutes,
    ...userRoutes,
    ...productRoutes,
    ...supplierRoutes,
    ...orderRoutes,
    ...customerRoutes,
    ...purchaseRoutes,
    ...inventoryRoutes,
    ...warehouseRoutes,
    ...inventoryTransactionRoutes,
    ...inventoryTransferRoutes,
    ...inventoryReturnRoutes,
    ...inventoryAdjustmentRoutes,
  },
};

module.exports = swaggerConfig;
