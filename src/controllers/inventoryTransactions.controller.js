const sendResponse = require("../utils/response.js");
const asyncHandler = require("express-async-handler");
const logger = require("../utils/logger.js");
const { DatabaseError } = require("../utils/errors");
const {
  getAllInventoryTransactionsService,
  getInventoryTransactionByIdService,
  getInventoryTransactionByTransactionIDService,
  getInventoryTransactionsByProductService,
  getInventoryTransactionsByWarehouseService,
  getInventoryTransactionsByTypeService,
  createInventoryTransactionService,
  deleteInventoryTransactionService,
  deleteAllInventoryTransactionsService
} = require("../services/inventoryTransactions.service");
const { transformInventoryTransaction, generateTransactionId } = require("../utils/inventoryTransaction.utils");

/**
 * @desc    Get all inventory transactions
 * @route   GET /inventory-transactions
 * @access  Private
 */
const getAllInventoryTransactions = asyncHandler(async (req, res, next) => {
  logger.info("getAllInventoryTransactions called");
  logger.debug("Query parameters:", req.query);
  
  try {
    const result = await getAllInventoryTransactionsService(req.query);
    const transformedTransactions = result.transactions.map(transformInventoryTransaction);
    
    sendResponse(
      res,
      200,
      "Inventory transactions retrieved successfully",
      {
        transactions: transformedTransactions,
        pagination: result.pagination
      }
    );
  } catch (error) {
    logger.error("Error retrieving all inventory transactions:", error);
    next(error);
  }
});

/**
 * @desc    Get inventory transaction by ID
 * @route   GET /inventory-transactions/:_id
 * @access  Private
 */
const getInventoryTransactionById = asyncHandler(async (req, res, next) => {
  logger.info(`getInventoryTransactionById called with ID: ${req.params._id}`);
  try {
    const transaction = await getInventoryTransactionByIdService(req.params._id);
    if (transaction) {
      const transformedTransaction = transformInventoryTransaction(transaction);
      sendResponse(
        res,
        200,
        "Inventory transaction retrieved successfully",
        transformedTransaction
      );
    } else {
      return next(DatabaseError.notFound("Inventory transaction"));
    }
  } catch (error) {
    logger.error(`Error retrieving inventory transaction with ID: ${req.params._id}`, error);
    next(error);
  }
});

/**
 * @desc    Get inventory transaction by transaction ID (IT-XXXXX format)
 * @route   GET /inventory-transactions/transactionID/:transactionID
 * @access  Private
 */
const getInventoryTransactionByTransactionID = asyncHandler(async (req, res, next) => {
  logger.info(`getInventoryTransactionByTransactionID called with transaction ID: ${req.params.transactionID}`);
  try {
    const transaction = await getInventoryTransactionByTransactionIDService(req.params.transactionID);
    if (transaction) {
      const transformedTransaction = transformInventoryTransaction(transaction);
      sendResponse(
        res,
        200,
        "Inventory transaction retrieved successfully",
        transformedTransaction
      );
    } else {
      return next(DatabaseError.notFound("Inventory transaction"));
    }
  } catch (error) {
    logger.error(`Error retrieving inventory transaction with transaction ID: ${req.params.transactionID}`, error);
    next(error);
  }
});

/**
 * @desc    Get inventory transactions by product
 * @route   GET /inventory-transactions/product/:productId
 * @access  Private
 */
const getInventoryTransactionsByProduct = asyncHandler(async (req, res, next) => {
  logger.info(`getInventoryTransactionsByProduct called with product ID: ${req.params.productId}`);
  logger.debug("Query parameters:", req.query);
  
  try {
    const result = await getInventoryTransactionsByProductService(req.params.productId, req.query);
    
    if (!result.transactions.length) {
      return sendResponse(res, 200, "No inventory transactions found for this product", {
        transactions: [],
        pagination: result.pagination
      });
    }
    
    const transformedTransactions = result.transactions.map(transformInventoryTransaction);
    sendResponse(
      res,
      200,
      "Inventory transactions retrieved successfully",
      {
        transactions: transformedTransactions,
        pagination: result.pagination
      }
    );
  } catch (error) {
    logger.error(`Error retrieving inventory transactions for product: ${req.params.productId}`, error);
    next(error);
  }
});

/**
 * @desc    Get inventory transactions by warehouse
 * @route   GET /inventory-transactions/warehouse/:warehouseId
 * @access  Private
 */
const getInventoryTransactionsByWarehouse = asyncHandler(async (req, res, next) => {
  logger.info(`getInventoryTransactionsByWarehouse called with warehouse ID: ${req.params.warehouseId}`);
  logger.debug("Query parameters:", req.query);
  
  try {
    const result = await getInventoryTransactionsByWarehouseService(req.params.warehouseId, req.query);
    
    if (!result.transactions.length) {
      return sendResponse(res, 200, "No inventory transactions found for this warehouse", {
        transactions: [],
        pagination: result.pagination
      });
    }
    
    const transformedTransactions = result.transactions.map(transformInventoryTransaction);
    sendResponse(
      res,
      200,
      "Inventory transactions retrieved successfully",
      {
        transactions: transformedTransactions,
        pagination: result.pagination
      }
    );
  } catch (error) {
    logger.error(`Error retrieving inventory transactions for warehouse: ${req.params.warehouseId}`, error);
    next(error);
  }
});

/**
 * @desc    Get inventory transactions by transaction type
 * @route   GET /inventory-transactions/type/:transactionType
 * @access  Private
 */
const getInventoryTransactionsByType = asyncHandler(async (req, res, next) => {
  logger.info(`getInventoryTransactionsByType called with type: ${req.params.transactionType}`);
  logger.debug("Query parameters:", req.query);
  
  try {
    const result = await getInventoryTransactionsByTypeService(req.params.transactionType, req.query);
    
    if (!result.transactions.length) {
      return sendResponse(res, 200, `No inventory transactions found with type: ${req.params.transactionType}`, {
        transactions: [],
        pagination: result.pagination
      });
    }
    
    const transformedTransactions = result.transactions.map(transformInventoryTransaction);
    sendResponse(
      res,
      200,
      "Inventory transactions retrieved successfully",
      {
        transactions: transformedTransactions,
        pagination: result.pagination
      }
    );
  } catch (error) {
    logger.error(`Error retrieving inventory transactions for type: ${req.params.transactionType}`, error);
    next(error);
  }
});

/**
 * @desc    Create a new inventory transaction
 * @route   POST /inventory-transactions
 * @access  Private
 */
const createInventoryTransaction = asyncHandler(async (req, res, next) => {
  logger.info("createInventoryTransaction called");
  logger.debug("Request body:", req.body);
  try {
    // Generate transactionID if not provided
    if (!req.body.transactionID) {
      const transactionID = await generateTransactionId();
      logger.debug(`Generated transactionID: ${transactionID}`);
      req.body.transactionID = transactionID;
    }
    
    const transaction = await createInventoryTransactionService(req.body, req.user._id);
    const transformedTransaction = transformInventoryTransaction(transaction);
    sendResponse(
      res,
      201,
      "Inventory transaction created successfully",
      transformedTransaction
    );
  } catch (error) {
    logger.error("Error creating inventory transaction:", error);
    next(error);
  }
});

/**
 * @desc    Delete inventory transaction by ID
 * @route   DELETE /inventory-transactions/:_id
 * @access  Private
 */
const deleteInventoryTransactionById = asyncHandler(async (req, res, next) => {
  logger.info(`deleteInventoryTransactionById called with ID: ${req.params._id}`);
  try {
    const result = await deleteInventoryTransactionService(req.params._id);
    if (result.deletedCount > 0) {
      sendResponse(res, 200, "Inventory transaction deleted successfully");
    } else {
      return next(DatabaseError.notFound("Inventory transaction"));
    }
  } catch (error) {
    logger.error(`Error deleting inventory transaction with ID: ${req.params._id}`, error);
    next(error);
  }
});

/**
 * @desc    Delete all inventory transactions
 * @route   DELETE /inventory-transactions
 * @access  Private
 */
const deleteAllInventoryTransactions = asyncHandler(async (req, res, next) => {
  logger.info("deleteAllInventoryTransactions called");
  try {
    const result = await deleteAllInventoryTransactionsService();
    sendResponse(
      res,
      200,
      `${result.deletedCount} inventory transactions deleted successfully`
    );
  } catch (error) {
    logger.error("Error deleting all inventory transactions:", error);
    next(error);
  }
});

module.exports = {
  getAllInventoryTransactions,
  getInventoryTransactionById,
  getInventoryTransactionByTransactionID,
  getInventoryTransactionsByProduct,
  getInventoryTransactionsByWarehouse,
  getInventoryTransactionsByType,
  createInventoryTransaction,
  deleteInventoryTransactionById,
  deleteAllInventoryTransactions
};
