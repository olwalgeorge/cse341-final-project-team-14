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
    // Define custom filters mapping based on our model structure
    const customFilters = {
      transactionType: {
        field: 'transactionType',
        transform: (value) => {
          // Ensure the transaction type matches model's enum values
          const transactionTypes = [
            "Adjustment", "Purchase", "Sale", "Return", 
            "Transfer In", "Transfer Out", "Damaged", "Expired", "Initial"
          ];
          return transactionTypes.includes(value) ? value : null;
        }
      },
      inventory: 'inventory',
      product: 'product',
      warehouse: 'warehouse',
      fromWarehouse: 'fromWarehouse',
      toWarehouse: 'toWarehouse',
      reference: 'reference.documentId',
      documentType: {
        field: 'reference.documentType',
        transform: (value) => {
          // Ensure document type matches model's allowed values
          const documentTypes = ["Purchase", "Order", "Adjustment", "Transfer", "Return"];
          return documentTypes.includes(value) ? value : null;
        }
      },
      documentCode: 'reference.documentCode',
      fromDate: {
        field: 'transactionDate',
        transform: (value) => ({ $gte: new Date(value) })
      },
      toDate: {
        field: 'transactionDate',
        transform: (value) => ({ $lte: new Date(value) })
      },
      minChange: {
        field: 'quantityChange',
        transform: (value) => ({ $gte: parseInt(value) })
      },
      maxChange: {
        field: 'quantityChange',
        transform: (value) => ({ $lte: parseInt(value) })
      },
      performedBy: 'performedBy'
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
    
    // Create the product filter
    const filter = { product: productId };
    
    // Apply any additional filters based on the model's structure
    const additionalFilters = APIFeatures.buildFilter(query, {
      transactionType: {
        field: 'transactionType',
        transform: (value) => {
          const transactionTypes = [
            "Adjustment", "Purchase", "Sale", "Return", 
            "Transfer In", "Transfer Out", "Damaged", "Expired", "Initial"
          ];
          return transactionTypes.includes(value) ? value : null;
        }
      },
      warehouse: 'warehouse',
      fromDate: {
        field: 'transactionDate',
        transform: (value) => ({ $gte: new Date(value) })
      },
      toDate: {
        field: 'transactionDate',
        transform: (value) => ({ $lte: new Date(value) })
      }
    });
    
    // Combine filters
    const combinedFilter = { ...filter, ...additionalFilters };
    
    // Execute query with pagination and sorting
    const transactions = await InventoryTransaction.find(combinedFilter)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate("product", "name productID sku category")
      .populate("warehouse", "name warehouseID")
      .populate("fromWarehouse", "name warehouseID")
      .populate("toWarehouse", "name warehouseID")
      .populate("performedBy", "fullName email username");
    
    // Get total count for pagination
    const total = await InventoryTransaction.countDocuments(combinedFilter);

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
    
    // Create the warehouse filter (matching any of the warehouse fields)
    const filter = { 
      $or: [
        { warehouse: warehouseId },
        { fromWarehouse: warehouseId },
        { toWarehouse: warehouseId }
      ]
    };
    
    // Apply any additional filters from query
    const additionalFilters = APIFeatures.buildFilter(query, {
      transactionType: 'transactionType',
      product: 'product',
      fromDate: {
        field: 'transactionDate',
        transform: (value) => ({ $gte: new Date(value) })
      },
      toDate: {
        field: 'transactionDate',
        transform: (value) => ({ $lte: new Date(value) })
      }
    });
    
    // Combine filters using $and to maintain the $or structure
    const combinedFilter = Object.keys(additionalFilters).length > 0
      ? { $and: [filter, additionalFilters] }
      : filter;
    
    // Execute query with pagination and sorting
    const transactions = await InventoryTransaction.find(combinedFilter)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate("product", "name productID sku category")
      .populate("warehouse", "name warehouseID")
      .populate("fromWarehouse", "name warehouseID")
      .populate("toWarehouse", "name warehouseID")
      .populate("performedBy", "fullName email username");
    
    // Get total count for pagination
    const total = await InventoryTransaction.countDocuments(combinedFilter);

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
 * Get inventory transactions by transaction type - leveraging model's transaction type enum
 */
const getInventoryTransactionsByTypeService = async (transactionType, query = {}) => {
  try {
    // Verify transaction type against the model's allowed values
    const transactionTypes = [
      "Adjustment", "Purchase", "Sale", "Return", 
      "Transfer In", "Transfer Out", "Damaged", "Expired", "Initial"
    ];
    
    if (!transactionTypes.includes(transactionType)) {
      throw new Error(`Invalid transaction type: ${transactionType}`);
    }
    
    // Use our pagination and sorting utilities
    const pagination = APIFeatures.getPagination(query);
    const sort = APIFeatures.getSort(query, '-transactionDate');
    
    // Create the transaction type filter
    const filter = { transactionType: transactionType };
    
    // Apply any additional filters from query
    const additionalFilters = APIFeatures.buildFilter(query, {
      product: 'product',
      warehouse: 'warehouse',
      fromWarehouse: 'fromWarehouse',
      toWarehouse: 'toWarehouse',
      fromDate: {
        field: 'transactionDate',
        transform: (value) => ({ $gte: new Date(value) })
      },
      toDate: {
        field: 'transactionDate',
        transform: (value) => ({ $lte: new Date(value) })
      }
    });
    
    // Combine filters
    const combinedFilter = { ...filter, ...additionalFilters };
    
    // Execute query with pagination and sorting
    const transactions = await InventoryTransaction.find(combinedFilter)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate("product", "name productID sku category")
      .populate("warehouse", "name warehouseID")
      .populate("fromWarehouse", "name warehouseID")
      .populate("toWarehouse", "name warehouseID")
      .populate("performedBy", "fullName email username");
    
    // Get total count for pagination
    const total = await InventoryTransaction.countDocuments(combinedFilter);

    return {
      transactions,
      pagination: APIFeatures.paginationResult(total, pagination)
    };
  } catch (error) {
    logger.error(`Error in getInventoryTransactionsByTypeService for type ${transactionType}:`, error);
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
  getInventoryTransactionsByTypeService,
  createInventoryTransactionService,
  deleteInventoryTransactionService,
  deleteAllInventoryTransactionsService
};
