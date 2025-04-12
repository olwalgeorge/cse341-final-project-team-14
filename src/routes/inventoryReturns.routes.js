const express = require("express");
const router = express.Router();
const {
  getAllInventoryReturns,
  getInventoryReturnById,
  getInventoryReturnByReturnID,
  getInventoryReturnsByWarehouse,
  getInventoryReturnsBySource,
  getInventoryReturnsByStatus,
  createInventoryReturn,
  updateInventoryReturnById,
  approveInventoryReturn,
  processInventoryReturn,
  deleteInventoryReturnById,
  deleteAllInventoryReturns
} = require("../controllers/inventoryReturns.controller");
const isAuthenticated = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validation.middleware");
const {
  return_IdValidationRules,
  returnIDValidationRules,
  warehouseIdValidationRules,
  sourceValidationRules,
  statusValidationRules,
  createReturnValidationRules,
  updateReturnValidationRules,
  approveReturnValidationRules,
  processReturnValidationRules
} = require("../validators/inventoryReturn.validator");

// All routes require authentication for inventory returns
router.use(isAuthenticated);

// Main routes
router.get("/", getAllInventoryReturns);
router.post("/", validate(createReturnValidationRules()), createInventoryReturn);
router.delete("/", deleteAllInventoryReturns);

// Routes with parameters
router.get(
  "/returnID/:returnID", 
  validate(returnIDValidationRules()),
  getInventoryReturnByReturnID
);

router.get(
  "/warehouse/:warehouseId",
  validate(warehouseIdValidationRules()),
  getInventoryReturnsByWarehouse
);

router.get(
  "/source/:sourceType/:sourceId?",
  validate(sourceValidationRules()),
  getInventoryReturnsBySource
);

router.get(
  "/status/:status",
  validate(statusValidationRules()),
  getInventoryReturnsByStatus
);

router.get(
  "/:return_Id",
  validate(return_IdValidationRules()),
  getInventoryReturnById
);

router.put(
  "/:return_Id",
  validate(return_IdValidationRules()),
  validate(updateReturnValidationRules()),
  updateInventoryReturnById
);

router.put(
  "/:return_Id/approve",
  validate(return_IdValidationRules()),
  validate(approveReturnValidationRules()),
  approveInventoryReturn
);

router.put(
  "/:return_Id/process",
  validate(return_IdValidationRules()),
  validate(processReturnValidationRules()),
  processInventoryReturn
);

router.delete(
  "/:return_Id",
  validate(return_IdValidationRules()),
  deleteInventoryReturnById
);

module.exports = router;
