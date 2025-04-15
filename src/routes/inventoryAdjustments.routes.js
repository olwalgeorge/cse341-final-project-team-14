const express = require("express");
const router = express.Router();
const {
  getAllAdjustments,
  getAdjustmentById,
  getAdjustmentByAdjustmentID,
  getAdjustmentsByWarehouse,
  getAdjustmentsByReason,
  getAdjustmentsByStatus,
  getAdjustmentsByDateRange,
  getAdjustmentsByProduct,
  createAdjustment,
  updateAdjustment,
  approveAdjustment,
  completeAdjustment,
  deleteAdjustment,
  deleteAllAdjustments,
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
router.get("/", getAllAdjustments);
router.post("/", validate(createAdjustmentValidationRules()), createAdjustment);
router.delete("/", deleteAllAdjustments);

// Routes with parameters
router.get(
  "/adjustmentID/:adjustmentID", 
  validate(adjustmentIDValidationRules()),
  getAdjustmentByAdjustmentID
);

router.get(
  "/warehouse/:warehouseId",
  validate(warehouseIdValidationRules()),
  getAdjustmentsByWarehouse
);

router.get("/date-range", getAdjustmentsByDateRange);
router.get("/product/:productId", validate(warehouseIdValidationRules()), getAdjustmentsByProduct);

router.get(
  "/reason/:reason",
  validate(reasonValidationRules()),
  getAdjustmentsByReason
);

router.get(
  "/status/:status",
  validate(statusValidationRules()),
  getAdjustmentsByStatus
);

router.get(
  "/:adjustment_Id",
  validate(adjustment_IdValidationRules()),
  getAdjustmentById
);

router.put(
  "/:adjustment_Id",
  validate(adjustment_IdValidationRules()),
  validate(updateAdjustmentValidationRules()),
  updateAdjustment
);

router.put(
  "/:adjustment_Id/approve",
  validate(adjustment_IdValidationRules()),
  validate(approveAdjustmentValidationRules()),
  approveAdjustment
);

router.put(
  "/:adjustment_Id/complete",
  validate(adjustment_IdValidationRules()),
  validate(completeAdjustmentValidationRules()),
  completeAdjustment
);

router.delete(
  "/:adjustment_Id",
  validate(adjustment_IdValidationRules()),
  deleteAdjustment
);

module.exports = router;

