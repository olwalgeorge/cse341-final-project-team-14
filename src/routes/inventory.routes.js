const express = require("express");
const router = express.Router();
const {
  getAllInventory,
  getInventoryById,
  getInventoryByInventoryID,
  getInventoryByWarehouse,
  getInventoryByProduct,
  getInventoryByStockStatus,
  getLowStockInventory,
  getOutOfStockInventory,
  searchInventory,
  createOrUpdateInventory,
  adjustInventory,
  transferInventory,
  deleteInventory,
  deleteAllInventory,
} = require("../controllers/inventory.controller");
const isAuthenticated = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validation.middleware");
const {
  inventoryIdValidationRules,
  inventoryIDFormatValidationRules,
  warehouseIdValidationRules,
  productIdValidationRules,
  stockStatusValidationRules,
  searchValidationRules,
  createInventoryValidationRules,
  adjustInventoryValidationRules,
  transferInventoryValidationRules
} = require("../validators/inventory.validator");

// Get all inventory
router.get("/", isAuthenticated, getAllInventory);

// Get inventory by MongoDB ID
router.get(
  "/:inventory_Id", 
  isAuthenticated, 
  validate(inventoryIdValidationRules()),
  getInventoryById
);

// Get inventory by inventory ID (IN-XXXXX format)
router.get(
  "/inventoryID/:inventoryID", 
  isAuthenticated, 
  validate(inventoryIDFormatValidationRules()),
  getInventoryByInventoryID
);

// Get inventory by warehouse
router.get(
  "/warehouse/:warehouseId", 
  isAuthenticated, 
  validate(warehouseIdValidationRules()),
  getInventoryByWarehouse
);

// Get inventory by product
router.get(
  "/product/:productId", 
  isAuthenticated, 
  validate(productIdValidationRules()),
  getInventoryByProduct
);

// Get inventory by stock status
router.get(
  "/status/:stockStatus", 
  isAuthenticated, 
  validate(stockStatusValidationRules()),
  getInventoryByStockStatus
);

// Get low stock inventory
router.get(
  "/low-stock", 
  isAuthenticated, 
  getLowStockInventory
);

// Get out of stock inventory
router.get(
  "/out-of-stock", 
  isAuthenticated, 
  getOutOfStockInventory
);

// Search inventory
router.get(
  "/search", 
  isAuthenticated, 
  validate(searchValidationRules()),
  searchInventory
);

// Create or update inventory
router.post(
  "/", 
  isAuthenticated, 
  validate(createInventoryValidationRules()),
  createOrUpdateInventory
);

// Adjust inventory quantity
router.put(
  "/adjust", 
  isAuthenticated, 
  validate(adjustInventoryValidationRules()),
  adjustInventory
);

// Transfer inventory between warehouses
router.put(
  "/transfer", 
  isAuthenticated, 
  validate(transferInventoryValidationRules()),
  transferInventory
);

// Delete inventory by ID
router.delete(
  "/:inventory_Id", 
  isAuthenticated, 
  validate(inventoryIdValidationRules()),
  deleteInventory
);

// Delete all inventory (dev/test only)
router.delete("/", isAuthenticated, deleteAllInventory);

module.exports = router;
