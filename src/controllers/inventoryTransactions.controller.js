const sendResponse = require("../utils/response.js");
const asyncHandler = require("express-async-handler");
const { createLogger } = require("../utils/logger.js");
const mongoose = require("mongoose");
const { ValidationError, DatabaseError } = require("../utils/errors");
const {
  getAllTransactionsService,
  getTransactionByIdService,
  getTransactionsByWarehouseService,
  getTransactionsByProductService,
  getTransactionsByReferenceService,
  getTransactionsByTypeService,
  getTransactionsByDateRangeService,
  createTransactionService,
  deleteTransactionService,
  deleteAllTransactionsService
} = require("../services/inventoryTransactions.service");
const { transformInventoryTransaction } = require("../utils/inventoryTransaction.utils");
const logger = createLogger("InventoryTransactionsController");

/**
 * @desc    Get all inventory transactions
 * @route   GET /inventory-transactions
 * @access  Private
 */
const getAllTransactions = asyncHandler(async (req, res, next) => {
  logger.info("getAllTransactions called");
  logger.debug("Query parameters:", req.query);
  
  try {
    const result = await getAllTransactionsService(req.query);
    
    if (!result.transactions.length) {
      return sendResponse(res, 200, "No inventory transactions found", {
        transactions: [],
        pagination: result.pagination
      });
    }
    
    const transformedTransactions = result.transactions.map(transformInventoryTransaction);
    sendResponse(
      res,
      200,
      "Inventory transactions retrieved successfully",
      { transactions: transformedTransactions, pagination: result.pagination }
    );
  } catch (error) {
    logger.error("Error retrieving inventory transactions:", error);
    next(error);
  }
});

/**
 * @desc    Get inventory transaction by ID
 * @route   GET /inventory-transactions/:transaction_Id
 * @access  Private
 */
const getTransactionById = asyncHandler(async (req, res, next) => {
  const id = req.params.transaction_Id;
  logger.info(`getTransactionById called with ID: ${id}`);
  
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ValidationError('id', id, 'Invalid transaction ID format'));
    }
    
    const transaction = await getTransactionByIdService(id);
    
    if (!transaction) {
      return next(new DatabaseError('notFound', 'Inventory Transaction', id));
    }
    
    const transformedTransaction = transformInventoryTransaction(transaction);
    sendResponse(
      res,
      200,
      "Inventory transaction retrieved successfully",
      transformedTransaction
    );
  } catch (error) {
    logger.error(`Error retrieving inventory transaction with ID: ${id}`, error);
    next(error);
  }
});

/**
 * @desc    Get transactions by warehouse
 * @route   GET /inventory-transactions/warehouse/:warehouseId
 * @access  Private
 */
const getTransactionsByWarehouse = asyncHandler(async (req, res, next) => {
  const warehouseId = req.params.warehouseId;
  logger.info(`getTransactionsByWarehouse called with warehouse ID: ${warehouseId}`);
  logger.debug("Query parameters:", req.query);
  
  try {
    // Validate warehouseId format
    if (!mongoose.Types.ObjectId.isValid(warehouseId)) {
      return next(new ValidationError('warehouseId', warehouseId, 'Invalid warehouse ID format'));
    }
    
    const result = await getTransactionsByWarehouseService(warehouseId, req.query);
    
    if (!result.transactions.length) {
      return sendResponse(res, 200, `No inventory transactions found for warehouse ID: ${warehouseId}`, {
        transactions: [],
        pagination: result.pagination
      });
    }
    
    const transformedTransactions = result.transactions.map(transformInventoryTransaction);
    sendResponse(
      res,
      200,
      `Inventory transactions for warehouse ID "${warehouseId}" retrieved successfully`,
      { transactions: transformedTransactions, pagination: result.pagination }
    );
  } catch (error) {
    logger.error(`Error retrieving inventory transactions for warehouse ${warehouseId}:`, error);
    next(error);
  }
});

/**
 * @desc    Get transactions by product
 * @route   GET /inventory-transactions/product/:productId
 * @access  Private
 */
const getTransactionsByProduct = asyncHandler(async (req, res, next) => {
  const productId = req.params.productId;
  logger.info(`getTransactionsByProduct called with product ID: ${productId}`);
  logger.debug("Query parameters:", req.query);
  
  try {
    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return next(new ValidationError('productId', productId, 'Invalid product ID format'));
    }
    
    const result = await getTransactionsByProductService(productId, req.query);
    
    if (!result.transactions.length) {
      return sendResponse(res, 200, `No inventory transactions found for product ID: ${productId}`, {
        transactions: [],
        pagination: result.pagination
      });
    }
    
    const transformedTransactions = result.transactions.map(transformInventoryTransaction);
    sendResponse(
      res,
      200,
      `Inventory transactions for product ID "${productId}" retrieved successfully`,
      { transactions: transformedTransactions, pagination: result.pagination }
    );
  } catch (error) {
    logger.error(`Error retrieving inventory transactions for product ${productId}:`, error);
    next(error);
  }
});

/**
 * @desc    Get transactions by reference
 * @route   GET /inventory-transactions/reference/:referenceType/:referenceId
 * @access  Private
 */
const getTransactionsByReference = asyncHandler(async (req, res, next) => {
  const { referenceType, referenceId } = req.params;
  logger.info(`getTransactionsByReference called with type: ${referenceType}, ID: ${referenceId}`);
  logger.debug("Query parameters:", req.query);
  
  try {
    // Validate reference type
    const validReferenceTypes = ['Order', 'Transfer', 'Adjustment', 'Return', 'Manual'];
    if (!validReferenceTypes.includes(referenceType)) {
      return next(new ValidationError(
        'referenceType',
        referenceType,
        `Reference type must be one of: ${validReferenceTypes.join(', ')}`
      ));
    }
    
    // Validate referenceId format for MongoDB ObjectId references
    if (referenceType !== 'Manual' && !mongoose.Types.ObjectId.isValid(referenceId)) {
      return next(new ValidationError('referenceId', referenceId, 'Invalid reference ID format'));
    }
    
    const result = await getTransactionsByReferenceService(referenceType, referenceId, req.query);
    
    if (!result.transactions.length) {
      return sendResponse(res, 200, `No inventory transactions found for reference type: ${referenceType}, ID: ${referenceId}`, {
        transactions: [],
        pagination: result.pagination
      });
    }
    
    const transformedTransactions = result.transactions.map(transformInventoryTransaction);
    sendResponse(
      res,
      200,
      `Inventory transactions for reference type: ${referenceType}, ID: ${referenceId} retrieved successfully`,
      { transactions: transformedTransactions, pagination: result.pagination }
    );
  } catch (error) {
    logger.error(`Error retrieving inventory transactions for reference type: ${referenceType}, ID: ${referenceId}:`, error);
    next(error);
  }
});

/**
 * @desc    Get transactions by type
 * @route   GET /inventory-transactions/type/:type
 * @access  Private
 */
const getTransactionsByType = asyncHandler(async (req, res, next) => {
  const type = req.params.type;
  logger.info(`getTransactionsByType called with type: ${type}`);
  logger.debug("Query parameters:", req.query);
  
  try {
    // Validate transaction type
    const validTypes = ['Inbound', 'Outbound', 'Adjustment', 'Transfer In', 'Transfer Out', 'Return'];
    if (!validTypes.includes(type)) {
      return next(new ValidationError('type', type, `Transaction type must be one of: ${validTypes.join(', ')}`));
    }
    
    const result = await getTransactionsByTypeService(type, req.query);
    
    if (!result.transactions.length) {
      return sendResponse(res, 200, `No inventory transactions found with type: ${type}`, {
        transactions: [],
        pagination: result.pagination
      });
    }
    
    const transformedTransactions = result.transactions.map(transformInventoryTransaction);
    sendResponse(
      res,
      200,
      `Inventory transactions with type "${type}" retrieved successfully`,
      { transactions: transformedTransactions, pagination: result.pagination }
    );
  } catch (error) {
    logger.error(`Error retrieving inventory transactions with type ${type}:`, error);
    next(error);
  }
});

/**
 * @desc    Get transactions by date range
 * @route   GET /inventory-transactions/date-range
 * @access  Private
 */
const getTransactionsByDateRange = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  logger.info(`getTransactionsByDateRange called with range: ${startDate} to ${endDate}`);
  logger.debug("Query parameters:", req.query);
  
  try {
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!startDate || !dateRegex.test(startDate)) {
      return next(new ValidationError('startDate', startDate, 'Start date must be in YYYY-MM-DD format'));
    }
    if (!endDate || !dateRegex.test(endDate)) {
      return next(new ValidationError('endDate', endDate, 'End date must be in YYYY-MM-DD format'));
    }
    
    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return next(new ValidationError('date', `${startDate} - ${endDate}`, 'Invalid date format'));
    }
    if (start > end) {
      return next(new ValidationError('dateRange', `${startDate} - ${endDate}`, 'Start date must be before or equal to end date'));
    }
    
    const result = await getTransactionsByDateRangeService(start, end, req.query);
    
    if (!result.transactions.length) {
      return sendResponse(res, 200, `No inventory transactions found between ${startDate} and ${endDate}`, {
        transactions: [],
        pagination: result.pagination
      });
    }
    
    const transformedTransactions = result.transactions.map(transformInventoryTransaction);
    sendResponse(
      res,
      200,
      `Inventory transactions from ${startDate} to ${endDate} retrieved successfully`,
      { transactions: transformedTransactions, pagination: result.pagination }
    );
  } catch (error) {
    logger.error(`Error retrieving inventory transactions by date range:`, error);
    next(error);
  }
});

/**
 * @desc    Create a new inventory transaction
 * @route   POST /inventory-transactions
 * @access  Private
 */
const createTransaction = asyncHandler(async (req, res, next) => {
  logger.info("createTransaction called");
  logger.debug("Transaction data:", req.body);
  
  try {
    const transactionData = { ...req.body };
    
    // Validate required fields
    if (!transactionData.warehouse) {
      return next(new ValidationError('warehouse', null, 'Warehouse is required'));
    }
    
    if (!transactionData.product) {
      return next(new ValidationError('product', null, 'Product is required'));
    }
    
    if (!transactionData.type) {
      return next(new ValidationError('type', null, 'Transaction type is required'));
    }
    
    // Validate transaction type
    const validTypes = ['Inbound', 'Outbound', 'Adjustment', 'Transfer In', 'Transfer Out', 'Return'];
    if (!validTypes.includes(transactionData.type)) {
      return next(new ValidationError('type', transactionData.type, `Transaction type must be one of: ${validTypes.join(', ')}`));
    }
    
    // Validate quantity is provided and is a number
    if (transactionData.quantity === undefined) {
      return next(new ValidationError('quantity', null, 'Quantity is required'));
    }
    
    if (isNaN(Number(transactionData.quantity))) {
      return next(new ValidationError('quantity', transactionData.quantity, 'Quantity must be a number'));
    }
    
    // Set creator if not provided
    if (!transactionData.createdBy && req.user) {
      transactionData.createdBy = req.user._id;
    }
    
    const transaction = await createTransactionService(transactionData);
    const transformedTransaction = transformInventoryTransaction(transaction);
    
    sendResponse(res, 201, "Inventory transaction created successfully", transformedTransaction);
  } catch (error) {
    logger.error("Error creating inventory transaction:", error);
    
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const firstErrorKey = Object.keys(error.errors)[0];
      const firstError = error.errors[firstErrorKey];
      
      return next(new ValidationError(
        firstErrorKey,
        firstError.value,
        firstError.message
      ));
    }
    
    // Handle reference errors
    if (error.message && error.message.includes('not found')) {
      return next(new DatabaseError('notFound', error.message.split(' not found')[0], null));
    }
    
    next(error);
  }
});

/**
 * @desc    Delete inventory transaction by ID
 * @route   DELETE /inventory-transactions/:transaction_Id
 * @access  Private
 */
const deleteTransaction = asyncHandler(async (req, res, next) => {
  const id = req.params.transaction_Id;
  logger.info(`deleteTransaction called with ID: ${id}`);
  
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ValidationError('id', id, 'Invalid transaction ID format'));
    }
    
    // Check if transaction exists
    const existingTransaction = await getTransactionByIdService(id);
    if (!existingTransaction) {
      return next(new DatabaseError('notFound', 'Inventory Transaction', id));
    }
    
    // Prevent deletion of transactions older than a certain time (e.g., 24 hours)
    const transactionDate = new Date(existingTransaction.createdAt);
    const now = new Date();
    const hoursDifference = (now - transactionDate) / (1000 * 60 * 60);
    
    if (hoursDifference > 24) {
      return next(new ValidationError(
        'createdAt',
        transactionDate.toISOString(),
        'Transactions older than 24 hours cannot be deleted for audit purposes'
      ));
    }
    
    const result = await deleteTransactionService(id);
    
    sendResponse(res, 200, "Inventory transaction deleted successfully");
  } catch (error) {
    logger.error(`Error deleting inventory transaction with ID: ${id}`, error);
    next(error);
  }
});

/**
 * @desc    Delete all inventory transactions
 * @route   DELETE /inventory-transactions
 * @access  Private
 */
const deleteAllTransactions = asyncHandler(async (req, res, next) => {
  logger.info("deleteAllTransactions called");
  
  try {
    // Only allow deletion in development/test environments for safety
    const env = process.env.NODE_ENV || 'development';
    if (env === 'production') {
      return next(new ValidationError(
        'environment',
        env,
        'Mass deletion of inventory transactions is not allowed in production environment'
      ));
    }
    
    const result = await deleteAllTransactionsService();
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
};
