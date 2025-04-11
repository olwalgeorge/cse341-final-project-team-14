const express = require("express");
const router = express.Router();
const {
  getAllInventoryTransactions,
  getInventoryTransactionById,
  getInventoryTransactionByTransactionID,
  getInventoryTransactionsByProduct,
  getInventoryTransactionsByWarehouse,
  createInventoryTransaction,
  deleteInventoryTransactionById,
  deleteAllInventoryTransactions
} = require("../controllers/inventoryTransactions.controller.js");
const validate = require("../middlewares/validation.middleware.js");
const isAuthenticated = require("../middlewares/auth.middleware.js");
const {
  transactionID_ValidationRules,
  transactionIDValidationRules,
  productIdValidationRules,
  warehouseIdValidationRules,
  inventoryTransactionCreateValidationRules
} = require("../validators/inventoryTransaction.validator.js");

// All routes require authentication for inventory transactions
router.use(isAuthenticated);

// Main routes
router.get("/", getAllInventoryTransactions);
router.post("/", validate(inventoryTransactionCreateValidationRules()), createInventoryTransaction);
router.delete("/", deleteAllInventoryTransactions);

// Routes with parameters
router.get(
  "/transactionID/:transactionID", 
  validate(transactionIDValidationRules()),
  getInventoryTransactionByTransactionID
);

router.get(
  "/product/:productId",
  validate(productIdValidationRules()),
  getInventoryTransactionsByProduct
);

router.get(
  "/warehouse/:warehouseId",
  validate(warehouseIdValidationRules()),
  getInventoryTransactionsByWarehouse
);

router.get(
  "/:_id",
  validate(transactionID_ValidationRules()),
  getInventoryTransactionById
);

router.delete(
  "/:_id",
  validate(transactionID_ValidationRules()),
  deleteInventoryTransactionById
);

module.exports = router;
