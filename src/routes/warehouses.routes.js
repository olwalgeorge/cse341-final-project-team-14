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
const {
  warehouseIDValidationRules,
  warehouseMongoIdValidationRules,
  warehouseCreateValidationRules,
  warehouseUpdateValidationRules,
} = require("../validators/warehouse.validator");

// all routes are protected and require authentication
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
router.post(
  "/",
  isAuthenticated,
  validate(warehouseCreateValidationRules()),
  createWarehouse
);
router.put(
  "/:warehouse_Id",
  isAuthenticated,
  validate(warehouseMongoIdValidationRules()),
  validate(warehouseUpdateValidationRules()),
  updateWarehouseById
);
router.delete(
  "/:warehouse_Id",
  isAuthenticated,
  validate(warehouseMongoIdValidationRules()),
  deleteWarehouseById
);
router.delete("/", isAuthenticated, deleteAllWarehouses);

module.exports = router;
