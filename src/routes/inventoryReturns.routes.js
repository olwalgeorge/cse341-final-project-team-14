const express = require("express");
const router = express.Router();
const {
   getAllReturns,
    getReturnById,
    getReturnByReturnID,
    getReturnsBySupplier,
    getReturnsByWarehouse,
    getReturnsByDateRange,
    getReturnsByStatus,
    createReturn,
    updateReturn,
    approveReturn,
    completeReturn,
    deleteReturn,
    deleteAllReturns,
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
router.get("/", getAllReturns);
router.post("/", validate(createReturnValidationRules()), createReturn);
router.delete("/", deleteAllReturns);

// Routes with parameters
router.get(
  "/returnID/:returnID", 
  validate(returnIDValidationRules()),
  getReturnByReturnID
);

router.get(
  "/supplier/:supplierId",
  validate(warehouseIdValidationRules()),
  getReturnsBySupplier
);

router.get(
  "/warehouse/:warehouseId",
  validate(warehouseIdValidationRules()),
  getReturnsByWarehouse
);

router.get(
  "/date-range/:fromDate/:toDate",
  validate(sourceValidationRules()),
  getReturnsByDateRange
);

router.get(
  "/status/:status",
  validate(statusValidationRules()),
  getReturnsByStatus
);

router.get(
  "/:return_Id",
  validate(return_IdValidationRules()),
  getReturnById
);

router.put(
  "/:return_Id",
  validate(return_IdValidationRules()),
  validate(updateReturnValidationRules()),
  updateReturn
);

router.put(
  "/:return_Id/approve",
  validate(return_IdValidationRules()),
  validate(approveReturnValidationRules()),
  approveReturn
);

router.put(
  "/:return_Id/complete",
  validate(return_IdValidationRules()),
  validate(processReturnValidationRules()),
  completeReturn
);

router.delete(
  "/:return_Id",
  validate(return_IdValidationRules()),
  deleteReturn
);

module.exports = router;

