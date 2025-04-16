const express = require("express");
const router = express.Router();
const {
  getAllWarehouses,
  getWarehouseById,
  getWarehouseByWarehouseID,
  getWarehouseByName,
  createWarehouse,
  updateWarehouseById,
  deleteWarehouseById,
  deleteAllWarehouses,
} = require("../controllers/warehouses.controller");
const validate = require("../middlewares/validation.middleware");
const isAuthenticated = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/auth.middleware");
const {
  warehouseIDValidationRules,
  warehouseMongoIdValidationRules,
  warehouseCreateValidationRules,
  warehouseUpdateValidationRules,
} = require("../validators/warehouse.validator");

// Read operations - accessible to all authenticated users
router.get("/", isAuthenticated, getAllWarehouses);
router.get(
  "/warehouseID/:warehouseID",
  isAuthenticated,
  validate(warehouseIDValidationRules()),
  getWarehouseByWarehouseID
);
router.get("/name/:name", isAuthenticated, getWarehouseByName);
router.get(
  "/:warehouse_Id",
  isAuthenticated,
  validate(warehouseMongoIdValidationRules()),
  getWarehouseById
);

// Create/Update operations - restricted to management
router.post(
  "/",
  isAuthenticated,
  authorize(['ADMIN', 'MANAGER']),
  validate(warehouseCreateValidationRules()),
  createWarehouse
);
router.put(
  "/:warehouse_Id",
  isAuthenticated,
  authorize(['ADMIN', 'MANAGER']),
  validate(warehouseMongoIdValidationRules()),
  validate(warehouseUpdateValidationRules()),
  updateWarehouseById
);

// Delete operations - highly restricted to admin role
router.delete(
  "/:warehouse_Id",
  isAuthenticated,
  authorize('ADMIN'),
  validate(warehouseMongoIdValidationRules()),
  deleteWarehouseById
);
router.delete("/", isAuthenticated, authorize('ADMIN'), deleteAllWarehouses);

module.exports = router;
