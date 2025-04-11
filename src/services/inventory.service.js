const Inventory = require("../models/inventory.model.js");
const logger = require("../utils/logger.js");

/**
 * Get all inventory items with optional filtering and pagination
 * @param {Object} query - Query parameters for filtering and pagination
 * @returns {Promise<Object>} - Inventory items and pagination info
 */
const getAllInventoryService = async (query = {}) => {
  try {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filter options
    const filter = {};
    if (query.warehouse) {
      filter.warehouse = query.warehouse;
    }
    if (query.product) {
      filter.product = query.product;
    }
    if (query.stockStatus) {
      filter.stockStatus = query.stockStatus;
    }
    if (query.minQuantity) {
      filter.quantity = { ...filter.quantity, $gte: parseInt(query.minQuantity) };
    }
    if (query.maxQuantity) {
      filter.quantity = { ...filter.quantity, $lte: parseInt(query.maxQuantity) };
    }

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
      sort.createdAt = -1; // Default sort by newest
    }

    // Execute query
    const inventory = await Inventory.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("product", "name productID sku category")
      .populate("warehouse", "name warehouseID");

    // Get total count for pagination
    const total = await Inventory.countDocuments(filter);

    return {
      inventory,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error("Error in getAllInventoryService:", error);
    throw error;
  }
};

/**
 * Get inventory item by MongoDB ID
 * @param {string} id - Inventory MongoDB ID
 * @returns {Promise<Object>} - Inventory document
 */
const getInventoryByIdService = async (id) => {
  try {
    const inventory = await Inventory.findById(id)
      .populate("product", "name productID sku category")
      .populate("warehouse", "name warehouseID");
    return inventory;
  } catch (error) {
    logger.error(`Error in getInventoryByIdService for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get inventory item by inventory ID (IN-XXXXX format)
 * @param {string} inventoryID - Inventory ID in IN-XXXXX format
 * @returns {Promise<Object>} - Inventory document
 */
const getInventoryByInventoryIDService = async (inventoryID) => {
  try {
    const inventory = await Inventory.findOne({ inventoryID })
      .populate("product", "name productID sku category")
      .populate("warehouse", "name warehouseID");
    return inventory;
  } catch (error) {
    logger.error(`Error in getInventoryByInventoryIDService for inventoryID ${inventoryID}:`, error);
    throw error;
  }
};

/**
 * Get inventory items by warehouse
 * @param {string} warehouseId - Warehouse MongoDB ID
 * @returns {Promise<Array>} - Array of inventory documents
 */
const getInventoryByWarehouseService = async (warehouseId) => {
  try {
    const inventory = await Inventory.find({ warehouse: warehouseId })
      .populate("product", "name productID sku category")
      .populate("warehouse", "name warehouseID");
    return inventory;
  } catch (error) {
    logger.error(`Error in getInventoryByWarehouseService for warehouse ${warehouseId}:`, error);
    throw error;
  }
};

/**
 * Get inventory items by product
 * @param {string} productId - Product MongoDB ID
 * @returns {Promise<Array>} - Array of inventory documents
 */
const getInventoryByProductService = async (productId) => {
  try {
    const inventory = await Inventory.find({ product: productId })
      .populate("product", "name productID sku category")
      .populate("warehouse", "name warehouseID");
    return inventory;
  } catch (error) {
    logger.error(`Error in getInventoryByProductService for product ${productId}:`, error);
    throw error;
  }
};

/**
 * Get inventory items by stock status
 * @param {string} status - Stock status (In Stock, Low Stock, etc.)
 * @returns {Promise<Array>} - Array of inventory documents
 */
const getInventoryByStockStatusService = async (status) => {
  try {
    const inventory = await Inventory.find({ stockStatus: status })
      .populate("product", "name productID sku category")
      .populate("warehouse", "name warehouseID");
    return inventory;
  } catch (error) {
    logger.error(`Error in getInventoryByStockStatusService for status ${status}:`, error);
    throw error;
  }
};

/**
 * Create a new inventory item
 * @param {Object} inventoryData - Data for creating a new inventory item
 * @returns {Promise<Object>} - Created inventory document
 */
const createInventoryService = async (inventoryData) => {
  try {
    const inventory = new Inventory(inventoryData);
    await inventory.save();
    return inventory;
  } catch (error) {
    logger.error("Error in createInventoryService:", error);
    throw error;
  }
};

/**
 * Update an inventory item by ID
 * @param {string} id - Inventory MongoDB ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} - Updated inventory document
 */
const updateInventoryService = async (id, updateData) => {
  try {
    const inventory = await Inventory.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    )
      .populate("product", "name productID sku category")
      .populate("warehouse", "name warehouseID");
      
    return inventory;
  } catch (error) {
    logger.error(`Error in updateInventoryService for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete an inventory item by ID
 * @param {string} id - Inventory MongoDB ID
 * @returns {Promise<Object>} - Deletion result
 */
const deleteInventoryService = async (id) => {
  try {
    const result = await Inventory.deleteOne({ _id: id });
    return result;
  } catch (error) {
    logger.error(`Error in deleteInventoryService for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete all inventory items
 * @returns {Promise<Object>} - Deletion result with count
 */
const deleteAllInventoryService = async () => {
  try {
    const result = await Inventory.deleteMany({});
    return result;
  } catch (error) {
    logger.error("Error in deleteAllInventoryService:", error);
    throw error;
  }
};

module.exports = {
  getAllInventoryService,
  getInventoryByIdService,
  getInventoryByInventoryIDService,
  getInventoryByWarehouseService,
  getInventoryByProductService,
  getInventoryByStockStatusService,
  createInventoryService,
  updateInventoryService,
  deleteInventoryService,
  deleteAllInventoryService,
};
