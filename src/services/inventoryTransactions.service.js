const InventoryTransaction = require("../models/inventoryTransaction.model.js");
const Inventory = require("../models/inventory.model.js");
const { generateTransactionId } = require("../utils/inventoryTransaction.utils.js");
const logger = require("../utils/logger.js");

/**
 * Get all inventory transactions with optional filtering and pagination
 */
const getAllInventoryTransactionsService = async (query = {}) => {
  try {
    // Create filter object
    const filter = {};

    // Apply transaction type filter
    if (query.transactionType) {
      filter.transactionType = query.transactionType;
    }

    // Apply inventory filter
    if (query.inventory) {
      filter.inventory = query.inventory;
    }

    // Apply product filter
    if (query.product) {
      filter.product = query.product;
    }

    // Apply warehouse filter
    if (query.warehouse) {
      filter.warehouse = query.warehouse;
    }

    // Apply date range filter
    if (query.fromDate || query.toDate) {
      filter.transactionDate = {};
      if (query.fromDate) filter.transactionDate.$gte = new Date(query.fromDate);
      if (query.toDate) filter.transactionDate.$lte = new Date(query.toDate);
    }

    // Pagination
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    // Sort options
    const sort = {};
    if (query.sort) {
      const sortFields = query.sort.split(",");
      sortFields.forEach((field) => {
        if (field.startsWith("-")) {
          sort[field.substring(1)] = -1;
        } else {
          sort[field] = 1;
        }
      });
    } else {
      sort.transactionDate = -1; // Default sort by newest transaction
    }

    // Execute query
    const transactions = await InventoryTransaction.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("product", "name productID sku category")
      .populate("warehouse", "name warehouseID")
      .populate("fromWarehouse", "name warehouseID")
      .populate("toWarehouse", "name warehouseID")
      .populate("performedBy", "fullName email username");

    // Get total count for pagination
    const total = await InventoryTransaction.countDocuments(filter);

    return {
      transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
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
const getInventoryTransactionsByProductService = async (productId) => {
  try {
    return await InventoryTransaction.find({ product: productId })
      .sort({ transactionDate: -1 })
      .populate("product", "name productID sku category")
      .populate("warehouse", "name warehouseID")
      .populate("fromWarehouse", "name warehouseID")
      .populate("toWarehouse", "name warehouseID")
      .populate("performedBy", "fullName email username");
  } catch (error) {
    logger.error(`Error in getInventoryTransactionsByProductService for product ${productId}:`, error);
    throw error;
  }
};

/**
 * Get inventory transactions by warehouse
 */
const getInventoryTransactionsByWarehouseService = async (warehouseId) => {
  try {
    return await InventoryTransaction.find({ 
      $or: [
        { warehouse: warehouseId },
        { fromWarehouse: warehouseId },
        { toWarehouse: warehouseId }
      ]
    })
      .sort({ transactionDate: -1 })
      .populate("product", "name productID sku category")
      .populate("warehouse", "name warehouseID")
      .populate("fromWarehouse", "name warehouseID")
      .populate("toWarehouse", "name warehouseID")
      .populate("performedBy", "fullName email username");
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
