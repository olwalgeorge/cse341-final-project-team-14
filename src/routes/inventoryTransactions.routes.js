const express = require("express");
const router = express.Router();
const {
  getAllTransactions,
  getTransactionById,
  getTransactionsByWarehouse,
  getTransactionsByProduct,
  getTransactionsByReference,
  getTransactionsByType,
  getTransactionsByDateRange,
  createTransaction,
  deleteTransaction,
  deleteAllTransactions
} = require("../controllers/inventoryTransactions.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const { ROLE_HIERARCHY } = require("../utils/auth.utils");
const validate = require("../middlewares/validation.middleware");
const {
  transaction_IdValidationRules,
  transactionIDValidationRules,
  productIdValidationRules,
  warehouseIdValidationRules,
  transactionTypeValidationRules,
  dateRangeValidationRules,
  createTransactionValidationRules,
  referenceValidationRules  
} = require("../validators/inventoryTransaction.validator");

// Get all inventory transactions
router.get("/", authenticate, getAllTransactions);

// Get transaction by MongoDB ID
router.get(
  "/:transaction_Id", 
  authenticate, 
  validate(transaction_IdValidationRules()),
  getTransactionById
);

// Get transaction by transaction ID (IT-XXXXX format)
router.get(
  "/transactionID/:transactionID", 
  authenticate, 
  validate(transactionIDValidationRules()),
  getTransactionsByReference
);

// Get transactions by product
router.get(
  "/product/:productId", 
  authenticate, 
  validate(productIdValidationRules()),
  getTransactionsByProduct
);

// Get transactions by warehouse
router.get(
  "/warehouse/:warehouseId", 
  authenticate, 
  validate(warehouseIdValidationRules()),
  getTransactionsByWarehouse
);

// Get transactions by transaction type
router.get(
  "/type/:transactionType", 
  authenticate, 
  validate(transactionTypeValidationRules()),
  getTransactionsByType
);

// Get transactions by date range
router.get(
  "/dateRange/:startDate/:endDate", 
  authenticate, 
  validate(dateRangeValidationRules()),
  getTransactionsByDateRange
);

// Get transactions by reference
router.get(
  "/reference/:referenceType/:referenceId",
  authenticate,
  validate(referenceValidationRules()),
  getTransactionsByReference
);

// Create new transaction - requires MANAGER or ADMIN role
router.post(
  "/", 
  authenticate,
  authorize([ROLE_HIERARCHY.ADMIN, ROLE_HIERARCHY.MANAGER]),
  validate(createTransactionValidationRules()),
  createTransaction
);

// Delete transaction by ID - requires MANAGER or ADMIN role
router.delete(
  "/:transaction_Id", 
  authenticate,
  authorize([ROLE_HIERARCHY.ADMIN, ROLE_HIERARCHY.MANAGER]), 
  validate(transaction_IdValidationRules()),
  deleteTransaction
);

// Delete all transactions - restricted to ADMIN role only
router.delete(
  "/", 
  authenticate, 
  authorize([ROLE_HIERARCHY.ADMIN]),
  deleteAllTransactions
);

module.exports = router;

