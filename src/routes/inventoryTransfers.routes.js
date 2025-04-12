const express = require("express");
const router = express.Router();
const {
  getAllInventoryTransfers,
  getInventoryTransferById,
  getInventoryTransferByTransferID,
  getInventoryTransfersByFromWarehouse,
  getInventoryTransfersByToWarehouse,
  getInventoryTransfersByStatus,
  createInventoryTransfer,
  updateInventoryTransferById,
  approveInventoryTransfer,
  shipInventoryTransfer,
  receiveInventoryTransfer,
  deleteInventoryTransferById,
  deleteAllInventoryTransfers
} = require("../controllers/inventoryTransfers.controller");
const isAuthenticated = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validation.middleware");
const {
  transfer_IdValidationRules,
  transferIDValidationRules,
  warehouseIdValidationRules,
  statusValidationRules,
  createTransferValidationRules,
  updateTransferValidationRules,
  approveTransferValidationRules,
  shipTransferValidationRules,
  receiveTransferValidationRules
} = require("../validators/inventoryTransfer.validator");

// All routes require authentication for inventory transfers
router.use(isAuthenticated);

// Main routes
router.get("/", getAllInventoryTransfers);
router.post("/", validate(createTransferValidationRules()), createInventoryTransfer);
router.delete("/", deleteAllInventoryTransfers);

// Routes with parameters
router.get(
  "/transferID/:transferID", 
  validate(transferIDValidationRules()),
  getInventoryTransferByTransferID
);

router.get(
  "/from-warehouse/:warehouseId",
  validate(warehouseIdValidationRules()),
  getInventoryTransfersByFromWarehouse
);

router.get(
  "/to-warehouse/:warehouseId",
  validate(warehouseIdValidationRules()),
  getInventoryTransfersByToWarehouse
);

router.get(
  "/status/:status",
  validate(statusValidationRules()),
  getInventoryTransfersByStatus
);

router.get(
  "/:transfer_Id",
  validate(transfer_IdValidationRules()),
  getInventoryTransferById
);

router.put(
  "/:transfer_Id",
  validate(transfer_IdValidationRules()),
  validate(updateTransferValidationRules()),
  updateInventoryTransferById
);

router.put(
  "/:transfer_Id/approve",
  validate(transfer_IdValidationRules()),
  validate(approveTransferValidationRules()),
  approveInventoryTransfer
);

router.put(
  "/:transfer_Id/ship",
  validate(transfer_IdValidationRules()),
  validate(shipTransferValidationRules()),
  shipInventoryTransfer
);

router.put(
  "/:transfer_Id/receive",
  validate(transfer_IdValidationRules()),
  validate(receiveTransferValidationRules()),
  receiveInventoryTransfer
);

router.delete(
  "/:transfer_Id",
  validate(transfer_IdValidationRules()),
  deleteInventoryTransferById
);

module.exports = router;
