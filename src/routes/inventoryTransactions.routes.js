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

// Create new transaction
router.post(
  "/", 
  isAuthenticated, 
  validate(createTransactionValidationRules()),
  createTransaction
);

// Delete transaction by ID
router.delete(
  "/:transaction_Id", 
  isAuthenticated, 
  validate(transaction_IdValidationRules()),
  deleteTransaction
);

// Delete all transactions
router.delete("/", isAuthenticated, deleteAllTransactions);

module.exports = router;

