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
const isAuthenticated = require("../middlewares/auth.middleware");
const isAuthorized = require("../middlewares/authorization.middleware");
const { ROLES } = require("../config/roles.config");
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
router.get("/", isAuthenticated, getAllTransactions);

// Get transaction by MongoDB ID
router.get(
  "/:transaction_Id", 
  isAuthenticated, 
  validate(transaction_IdValidationRules()),
  getTransactionById
);

// Get transaction by transaction ID (IT-XXXXX format)
router.get(
  "/transactionID/:transactionID", 
  isAuthenticated, 
  validate(transactionIDValidationRules()),
  getTransactionsByReference
);

// Get transactions by product
router.get(
  "/product/:productId", 
  isAuthenticated, 
  validate(productIdValidationRules()),
  getTransactionsByProduct
);

// Get transactions by warehouse
router.get(
  "/warehouse/:warehouseId", 
  isAuthenticated, 
  validate(warehouseIdValidationRules()),
  getTransactionsByWarehouse
);

// Get transactions by transaction type
router.get(
  "/type/:transactionType", 
  isAuthenticated, 
  validate(transactionTypeValidationRules()),
  getTransactionsByType
);

// Get transactions by date range
router.get(
  "/dateRange/:startDate/:endDate", 
  isAuthenticated, 
  validate(dateRangeValidationRules()),
  getTransactionsByDateRange
);

// Get transactions by reference
router.get(
  "/reference/:referenceType/:referenceId",
  isAuthenticated,
  validate(referenceValidationRules()),
  getTransactionsByReference
);

// Create new transaction - requires MANAGER or ADMIN role
router.post(
  "/", 
  isAuthenticated,
  isAuthorized([ROLES.ADMIN, ROLES.MANAGER]),
  validate(createTransactionValidationRules()),
  createTransaction
);

// Delete transaction by ID - requires MANAGER or ADMIN role
router.delete(
  "/:transaction_Id", 
  isAuthenticated,
  isAuthorized([ROLES.ADMIN, ROLES.MANAGER]), 
  validate(transaction_IdValidationRules()),
  deleteTransaction
);

// Delete all transactions - restricted to ADMIN role only
router.delete(
  "/", 
  isAuthenticated, 
  isAuthorized([ROLES.ADMIN]),
  deleteAllTransactions
);

module.exports = router;

