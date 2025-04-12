const InventoryTransaction = require("../models/inventoryTransaction.model.js");
const Inventory = require("../models/inventory.model.js");
const { generateTransactionId } = require("../utils/inventoryTransaction.utils.js");
const APIFeatures = require("../utils/apiFeatures.js");
const logger = require("../utils/logger.js");

/**
 * Get all inventory transactions with optional filtering and pagination
 */
const getAllInventoryTransactionsService = async (query = {}) => {
  try {
    // Define custom filters mapping
    const customFilters = {
      transactionType: 'transactionType',
      inventory: 'inventory',
      product: 'product',
      warehouse: 'warehouse',
      // Define dateField for date range filtering
      dateField: 'transactionDate'
    };

    // Build filter using APIFeatures utility
    const filter = APIFeatures.buildFilter(query, customFilters);

    // Get pagination parameters
    const pagination = APIFeatures.getPagination(query);
    
    // Get sort parameters with default sort by transaction date descending
    const sort = APIFeatures.getSort(query, '-transactionDate');

    // Execute query
    const transactions = await InventoryTransaction.find(filter)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate("product", "name productID sku category")
      .populate("warehouse", "name warehouseID")
      .populate("fromWarehouse", "name warehouseID")
      .populate("toWarehouse", "name warehouseID")
      .populate("performedBy", "fullName email username");

    // Get total count for pagination
    const total = await InventoryTransaction.countDocuments(filter);

    return {
      transactions,
      pagination: APIFeatures.paginationResult(total, pagination)
    };
  } catch (error) {
    logger.error("Error in getAllInventoryTransactionsService:", error);
    throw error;
  }
};

/**
 * Get inventory transaction by MongoDB ID
 */
const getInventoryTransactionByIdService = async (id) => {
  try {
    return await InventoryTransaction.findById(id)
      .populate("product", "name productID sku category")
      .populate("warehouse", "name warehouseID")
      .populate("fromWarehouse", "name warehouseID")
      .populate("toWarehouse", "name warehouseID")
      .populate("performedBy", "fullName email username");
  } catch (error) {
    logger.error(`Error in getInventoryTransactionByIdService for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get inventory transaction by transaction ID (IT-XXXXX format)
 */
const getInventoryTransactionByTransactionIDService = async (transactionID) => {
  try {
    return await InventoryTransaction.findOne({ transactionID })
      .populate("product", "name productID sku category")
      .populate("warehouse", "name warehouseID")
      .populate("fromWarehouse", "name warehouseID")
      .populate("toWarehouse", "name warehouseID")
      .populate("performedBy", "fullName email username");
  } catch (error) {
    logger.error(`Error in getInventoryTransactionByTransactionIDService for transactionID ${transactionID}:`, error);
    throw error;
  }
};

/**
 * Get inventory transactions by product
 */
const getInventoryTransactionsByProductService = async (productId, query = {}) => {
  try {
    // Use our pagination and sorting utilities
    const pagination = APIFeatures.getPagination(query);
    const sort = APIFeatures.getSort(query, '-transactionDate');
    
    const transactions = await InventoryTransaction.find({ product: productId })
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate("product", "name productID sku category")
      .populate("warehouse", "name warehouseID")
      .populate("fromWarehouse", "name warehouseID")
      .populate("toWarehouse", "name warehouseID")
      .populate("performedBy", "fullName email username");
    
    // Get total count for pagination
    const total = await InventoryTransaction.countDocuments({ product: productId });

    return {
      transactions,
      pagination: APIFeatures.paginationResult(total, pagination)
    };
  } catch (error) {
    logger.error(`Error in getInventoryTransactionsByProductService for product ${productId}:`, error);
    throw error;
  }
};

/**
 * Get inventory transactions by warehouse
 */
const getInventoryTransactionsByWarehouseService = async (warehouseId, query = {}) => {
  try {
    // Use our pagination and sorting utilities
    const pagination = APIFeatures.getPagination(query);
    const sort = APIFeatures.getSort(query, '-transactionDate');
    
    const filter = { 
      $or: [
        { warehouse: warehouseId },
        { fromWarehouse: warehouseId },
        { toWarehouse: warehouseId }
      ]
    };
    
    const transactions = await InventoryTransaction.find(filter)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate("product", "name productID sku category")
      .populate("warehouse", "name warehouseID")
      .populate("fromWarehouse", "name warehouseID")
      .populate("toWarehouse", "name warehouseID")
      .populate("performedBy", "fullName email username");
    
    // Get total count for pagination
    const total = await InventoryTransaction.countDocuments(filter);

    return {
      transactions,
      pagination: APIFeatures.paginationResult(total, pagination)
    };
  } catch (error) {
    logger.error(`Error in getInventoryTransactionsByWarehouseService for warehouse ${warehouseId}:`, error);
    throw error;
  }
};

/**
 * Create a new inventory transaction
 */
const createInventoryTransactionService = async (transactionData, userId) => {
  try {
    // Generate transaction ID if not provided
    if (!transactionData.transactionID) {
      transactionData.transactionID = await generateTransactionId();
    }
    
    // Add the user who performed the transaction
    transactionData.performedBy = userId;
    
    // If inventory reference is provided, get current quantity
    if (transactionData.inventory && !transactionData.quantityBefore) {
      const inventory = await Inventory.findById(transactionData.inventory);
      if (inventory) {
        transactionData.quantityBefore = inventory.quantity;
        
        // Auto-populate product and warehouse if not provided
        if (!transactionData.product) {
          transactionData.product = inventory.product;
        }
        if (!transactionData.warehouse) {
          transactionData.warehouse = inventory.warehouse;
        }
      }
    }
    
    // Calculate quantityAfter if not provided
    if (transactionData.quantityBefore !== undefined && 
        transactionData.quantityChange !== undefined && 
        transactionData.quantityAfter === undefined) {
      transactionData.quantityAfter = transactionData.quantityBefore + transactionData.quantityChange;
    }
    
    // Create and save the transaction
    const transaction = new InventoryTransaction(transactionData);
    const savedTransaction = await transaction.save();
    
    // Update the inventory quantity if this is not just a record-keeping transaction
    if (transactionData.inventory) {
      await Inventory.findByIdAndUpdate(
        transactionData.inventory,
        { 
          quantity: transactionData.quantityAfter,
          lastStockCheck: new Date()
        }
      );
    }
    
    // Return the populated transaction
    return await InventoryTransaction.findById(savedTransaction._id)
      .populate("product", "name productID sku category")
      .populate("warehouse", "name warehouseID")
      .populate("fromWarehouse", "name warehouseID")
      .populate("toWarehouse", "name warehouseID")
      .populate("performedBy", "fullName email username");
  } catch (error) {
    logger.error("Error in createInventoryTransactionService:", error);
    throw error;
  }
};

/**
 * Delete a transaction by ID
 */
const deleteInventoryTransactionService = async (id) => {
  try {
    return await InventoryTransaction.deleteOne({ _id: id });
  } catch (error) {
    logger.error(`Error in deleteInventoryTransactionService for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete all transactions
 */
const deleteAllInventoryTransactionsService = async () => {
  try {
    return await InventoryTransaction.deleteMany({});
  } catch (error) {
    logger.error("Error in deleteAllInventoryTransactionsService:", error);
    throw error;
  }
};

module.exports = {
  getAllInventoryTransactionsService,
  getInventoryTransactionByIdService,
  getInventoryTransactionByTransactionIDService,
  getInventoryTransactionsByProductService,
  getInventoryTransactionsByWarehouseService,
  createInventoryTransactionService,
  deleteInventoryTransactionService,
  deleteAllInventoryTransactionsService
};
