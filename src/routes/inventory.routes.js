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
const { authorize } = require("../middlewares/auth.middleware");
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

// Read operations - Accessible to all authenticated users
// These operations don't modify data, just view inventory information
router.get("/", isAuthenticated, getAllInventory);
router.get(
  "/:inventory_Id", 
  isAuthenticated, 
  validate(inventoryIdValidationRules()),
  getInventoryById
);
router.get(
  "/inventoryID/:inventoryID", 
  isAuthenticated, 
  validate(inventoryIDFormatValidationRules()),
  getInventoryByInventoryID
);
router.get(
  "/warehouse/:warehouseId", 
  isAuthenticated, 
  validate(warehouseIdValidationRules()),
  getInventoryByWarehouse
);
router.get(
  "/product/:productId", 
  isAuthenticated, 
  validate(productIdValidationRules()),
  getInventoryByProduct
);
router.get(
  "/status/:stockStatus", 
  isAuthenticated, 
  validate(stockStatusValidationRules()),
  getInventoryByStockStatus
);
router.get(
  "/low-stock", 
  isAuthenticated, 
  getLowStockInventory
);
router.get(
  "/out-of-stock", 
  isAuthenticated, 
  getOutOfStockInventory
);
router.get(
  "/search", 
  isAuthenticated, 
  validate(searchValidationRules()),
  searchInventory
);

// Create/Update operations - Restricted to management roles
// These operations create or modify inventory data
router.post(
  "/", 
  isAuthenticated,
  authorize(['ADMIN', 'MANAGER']),
  validate(createInventoryValidationRules()),
  createOrUpdateInventory
);

// Adjust inventory quantity - Important operation affecting stock levels
router.put(
  "/adjust", 
  isAuthenticated,
  authorize(['ADMIN', 'MANAGER', 'SUPERVISOR']), 
  validate(adjustInventoryValidationRules()),
  adjustInventory
);

// Transfer inventory between warehouses - Requires management approval
router.put(
  "/transfer", 
  isAuthenticated,
  authorize(['ADMIN', 'MANAGER', 'SUPERVISOR']), 
  validate(transferInventoryValidationRules()),
  transferInventory
);

// Delete operations - Highly restricted to admin only
// These are destructive operations that should be carefully controlled
router.delete(
  "/:inventory_Id", 
  isAuthenticated,
  authorize('ADMIN'), 
  validate(inventoryIdValidationRules()),
  deleteInventory
);

// Delete all inventory - Extremely restricted operation for dev/test only
router.delete("/", isAuthenticated, authorize('ADMIN'), deleteAllInventory);

module.exports = router;
