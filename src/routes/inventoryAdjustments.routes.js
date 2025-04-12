const express = require("express");
const router = express.Router();
const {
  getAllInventoryAdjustments,
  getInventoryAdjustmentById,
  getInventoryAdjustmentByAdjustmentID,
  getInventoryAdjustmentsByWarehouse,
  getInventoryAdjustmentsByReason,
  getInventoryAdjustmentsByStatus,
  createInventoryAdjustment,
  updateInventoryAdjustmentById,
  approveInventoryAdjustment,
  completeInventoryAdjustment,
  deleteInventoryAdjustmentById,
  deleteAllInventoryAdjustments
} = require("../controllers/inventoryAdjustments.controller");
const isAuthenticated = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validation.middleware");
const {
  adjustment_IdValidationRules,
  adjustmentIDValidationRules,
  warehouseIdValidationRules,
  reasonValidationRules,
  statusValidationRules,
  createAdjustmentValidationRules,
  updateAdjustmentValidationRules,
  approveAdjustmentValidationRules,
  completeAdjustmentValidationRules
} = require("../validators/inventoryAdjustment.validator");

// All routes require authentication for inventory adjustments
router.use(isAuthenticated);

// Main routes
router.get("/", getAllInventoryAdjustments);
router.post("/", validate(createAdjustmentValidationRules()), createInventoryAdjustment);
router.delete("/", deleteAllInventoryAdjustments);

// Routes with parameters
router.get(
  "/adjustmentID/:adjustmentID", 
  validate(adjustmentIDValidationRules()),
  getInventoryAdjustmentByAdjustmentID
);

router.get(
  "/warehouse/:warehouseId",
  validate(warehouseIdValidationRules()),
  getInventoryAdjustmentsByWarehouse
);

router.get(
  "/reason/:reason",
  validate(reasonValidationRules()),
  getInventoryAdjustmentsByReason
);

router.get(
  "/status/:status",
  validate(statusValidationRules()),
  getInventoryAdjustmentsByStatus
);

router.get(
  "/:adjustment_Id",
  validate(adjustment_IdValidationRules()),
  getInventoryAdjustmentById
);

router.put(
  "/:adjustment_Id",
  validate(adjustment_IdValidationRules()),
  validate(updateAdjustmentValidationRules()),
  updateInventoryAdjustmentById
);

router.put(
  "/:adjustment_Id/approve",
  validate(adjustment_IdValidationRules()),
  validate(approveAdjustmentValidationRules()),
  approveInventoryAdjustment
);

router.put(
  "/:adjustment_Id/complete",
  validate(adjustment_IdValidationRules()),
  validate(completeAdjustmentValidationRules()),
  completeInventoryAdjustment
);

router.delete(
  "/:adjustment_Id",
  validate(adjustment_IdValidationRules()),
  deleteInventoryAdjustmentById
);

module.exports = router;
