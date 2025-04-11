const express = require("express");
const router = express.Router();
const {
  getAllInventory,
  getInventoryById,
  getInventoryByInventoryID,
  getInventoryByWarehouse,
  getInventoryByProduct,
  getInventoryByStockStatus,
  createInventory,
  updateInventoryById,
  deleteInventoryById,
  deleteAllInventory,
} = require("../controllers/inventory.controller.js");
const validate = require("../middlewares/validation.middleware.js");
const isAuthenticated = require("../middlewares/auth.middleware.js");
const {
  inventoryIDValidationRules,
  inventory_IdValidationRules,
  inventoryCreateValidationRules,
  inventoryUpdateValidationRules,
  warehouseIdValidationRules,
  productIdValidationRules,
  stockStatusValidationRules,
} = require("../validators/inventory.validator.js");

// Public routes (for read operations)
router.get("/", getAllInventory);
router.get(
  "/inventoryID/:inventoryID",
  validate(inventoryIDValidationRules()),
  getInventoryByInventoryID
);
router.get(
  "/warehouse/:warehouseId",
  validate(warehouseIdValidationRules()),
  getInventoryByWarehouse
);
router.get(
  "/product/:productId",
  validate(productIdValidationRules()),
  getInventoryByProduct
);
router.get(
  "/status/:status",
  validate(stockStatusValidationRules()),
  getInventoryByStockStatus
);
router.get(
  "/:inventory_Id",
  validate(inventory_IdValidationRules()),
  getInventoryById
);

// Protected routes (for write operations)
router.post(
  "/",
  isAuthenticated,
  validate(inventoryCreateValidationRules()),
  createInventory
);
router.put(
  "/:inventory_Id",
  isAuthenticated,
  validate(inventory_IdValidationRules()),
  validate(inventoryUpdateValidationRules()),
  updateInventoryById
);
router.delete(
  "/:inventory_Id",
  isAuthenticated,
  validate(inventory_IdValidationRules()),
  deleteInventoryById
);
router.delete("/", isAuthenticated, deleteAllInventory);

module.exports = router;
