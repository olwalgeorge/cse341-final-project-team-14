const express = require("express");
const router = express.Router();
const {
  getAllInventoryTransactions,
  getInventoryTransactionById,
  getInventoryTransactionByTransactionID,
  getInventoryTransactionsByProduct,
  getInventoryTransactionsByWarehouse,
  getInventoryTransactionsByType,
  createInventoryTransaction,
  deleteInventoryTransactionById,
  deleteAllInventoryTransactions
} = require("../controllers/inventoryTransactions.controller");
const isAuthenticated = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validation.middleware");
const {
  transaction_IdValidationRules,
  transactionIDValidationRules,
  productIdValidationRules,
  warehouseIdValidationRules,
  transactionTypeValidationRules,
  createTransactionValidationRules
} = require("../validators/inventoryTransaction.validator");

// Get all inventory transactions
router.get("/", isAuthenticated, getAllInventoryTransactions);

// Get transaction by MongoDB ID
router.get(
  "/:transaction_Id", 
  isAuthenticated, 
  validate(transaction_IdValidationRules()),
  getInventoryTransactionById
);

// Get transaction by transaction ID (IT-XXXXX format)
router.get(
  "/transactionID/:transactionID", 
  isAuthenticated, 
  validate(transactionIDValidationRules()),
  getInventoryTransactionByTransactionID
);

// Get transactions by product
router.get(
  "/product/:productId", 
  isAuthenticated, 
  validate(productIdValidationRules()),
  getInventoryTransactionsByProduct
);

// Get transactions by warehouse
router.get(
  "/warehouse/:warehouseId", 
  isAuthenticated, 
  validate(warehouseIdValidationRules()),
  getInventoryTransactionsByWarehouse
);

// Get transactions by transaction type
router.get(
  "/type/:transactionType", 
  isAuthenticated, 
  validate(transactionTypeValidationRules()),
  getInventoryTransactionsByType
);

// Create new transaction
router.post(
  "/", 
  isAuthenticated, 
  validate(createTransactionValidationRules()),
  createInventoryTransaction
);

// Delete transaction by ID
router.delete(
  "/:transaction_Id", 
  isAuthenticated, 
  validate(transaction_IdValidationRules()),
  deleteInventoryTransactionById
);

// Delete all transactions
router.delete("/", isAuthenticated, deleteAllInventoryTransactions);

module.exports = router;
