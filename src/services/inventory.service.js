const Inventory = require("../models/inventory.model");
const APIFeatures = require("../utils/apiFeatures");
const logger = require("../utils/logger");

/**
 * Get all inventory items with filtering, pagination and sorting
 */
const getAllInventoryService = async (query = {}) => {
  logger.debug("getAllInventoryService called with query:", query);
  
  try {
    // Define custom filters mapping
    const customFilters = {
      product: 'product',
      warehouse: 'warehouse',
      stockStatus: 'stockStatus',
      minQuantity: {
        field: 'quantity',
        transform: (value) => ({ $gte: parseInt(value) })
      },
      maxQuantity: {
        field: 'quantity',
        transform: (value) => ({ $lte: parseInt(value) })
      },
      locationAisle: {
        field: 'location.aisle',
        transform: (value) => ({ $regex: value, $options: 'i' })
      },
      locationRack: {
        field: 'location.rack',
        transform: (value) => ({ $regex: value, $options: 'i' })
      },
      locationBin: {
        field: 'location.bin',
        transform: (value) => ({ $regex: value, $options: 'i' })
      },
      fromDate: {
        field: 'lastStockCheck',
        transform: (value) => ({ $gte: new Date(value) })
      },
      toDate: {
        field: 'lastStockCheck',
        transform: (value) => ({ $lte: new Date(value) })
      }
    };
    
    // Build filter using APIFeatures utility
    const filter = APIFeatures.buildFilter(query, customFilters);
    
    // Get pagination parameters
    const pagination = APIFeatures.getPagination(query);
    
    // Get sort parameters with default sort by inventoryID
    const sort = APIFeatures.getSort(query, 'inventoryID');

    // Execute query with pagination and sorting
    const inventoryItems = await Inventory.find(filter)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate("product", "name description sellingPrice category sku productID")
      .populate("warehouse", "name warehouseID status");
    
    // Get total count for pagination
    const total = await Inventory.countDocuments(filter);
    
    return {
      inventoryItems,
      pagination: APIFeatures.paginationResult(total, pagination)
    };
  } catch (error) {
    logger.error("Error in getAllInventoryService:", error);
    throw error;
  }
};

/**
 * Get inventory item by MongoDB ID
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
 */
const getInventoryByWarehouseService = async (warehouseId, query = {}) => {
  logger.debug(`getInventoryByWarehouseService called with warehouse ID: ${warehouseId}`);
  
  try {
    // Get pagination parameters
    const pagination = APIFeatures.getPagination(query);
    
    // Get sort parameters with default sort by inventoryID
    const sort = APIFeatures.getSort(query, 'inventoryID');

    // Create the warehouse filter
    const filter = { warehouse: warehouseId };
    
    // Apply any additional filters from query if needed
    const additionalFilters = APIFeatures.buildFilter(query, {
      product: 'product',
      stockStatus: 'stockStatus',
      minQuantity: {
        field: 'quantity',
        transform: (value) => ({ $gte: parseInt(value) })
      },
      maxQuantity: {
        field: 'quantity',
        transform: (value) => ({ $lte: parseInt(value) })
      }
    });
    
    // Combine filters
    const combinedFilter = { ...filter, ...additionalFilters };

    // Execute query with pagination and sorting
    const inventoryItems = await Inventory.find(combinedFilter)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate("product", "name description sellingPrice category sku productID")
      .populate("warehouse", "name warehouseID status");
    
    // Get total count for pagination
    const total = await Inventory.countDocuments(combinedFilter);
    
    return {
      inventoryItems,
      pagination: APIFeatures.paginationResult(total, pagination)
    };
  } catch (error) {
    logger.error(`Error in getInventoryByWarehouseService: ${error.message}`);
    throw error;
  }
};

/**
 * Get inventory items by product
 */
const getInventoryByProductService = async (productId, query = {}) => {
  logger.debug(`getInventoryByProductService called with product ID: ${productId}`);
  
  try {
    // Get pagination parameters
    const pagination = APIFeatures.getPagination(query);
    
    // Get sort parameters with default sort by inventoryID
    const sort = APIFeatures.getSort(query, 'inventoryID');

    // Create the product filter
    const filter = { product: productId };
    
    // Apply any additional filters from query if needed
    const additionalFilters = APIFeatures.buildFilter(query, {
      warehouse: 'warehouse',
      stockStatus: 'stockStatus',
      minQuantity: {
        field: 'quantity',
        transform: (value) => ({ $gte: parseInt(value) })
      },
      maxQuantity: {
        field: 'quantity',
        transform: (value) => ({ $lte: parseInt(value) })
      }
    });
    
    // Combine filters
    const combinedFilter = { ...filter, ...additionalFilters };

    // Execute query with pagination and sorting
    const inventoryItems = await Inventory.find(combinedFilter)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate("product", "name description sellingPrice category sku productID")
      .populate("warehouse", "name warehouseID status");
    
    // Get total count for pagination
    const total = await Inventory.countDocuments(combinedFilter);
    
    return {
      inventoryItems,
      pagination: APIFeatures.paginationResult(total, pagination)
    };
  } catch (error) {
    logger.error(`Error in getInventoryByProductService: ${error.message}`);
    throw error;
  }
};

/**
 * Get inventory items by stock status
 */
const getInventoryByStockStatusService = async (stockStatus, query = {}) => {
  logger.debug(`getInventoryByStockStatusService called with status: ${stockStatus}`);
  
  try {
    // Get pagination parameters
    const pagination = APIFeatures.getPagination(query);
    
    // Get sort parameters with default sort by inventoryID
    const sort = APIFeatures.getSort(query, 'inventoryID');

    // Create the stock status filter
    const filter = { stockStatus: stockStatus };
    
    // Apply any additional filters from query if needed
    const additionalFilters = APIFeatures.buildFilter(query, {
      product: 'product',
      warehouse: 'warehouse',
      minQuantity: {
        field: 'quantity',
        transform: (value) => ({ $gte: parseInt(value) })
      },
      maxQuantity: {
        field: 'quantity',
        transform: (value) => ({ $lte: parseInt(value) })
      }
    });
    
    // Combine filters
    const combinedFilter = { ...filter, ...additionalFilters };

    // Execute query with pagination and sorting
    const inventoryItems = await Inventory.find(combinedFilter)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate("product", "name description sellingPrice category sku productID")
      .populate("warehouse", "name warehouseID status");
    
    // Get total count for pagination
    const total = await Inventory.countDocuments(combinedFilter);
    
    return {
      inventoryItems,
      pagination: APIFeatures.paginationResult(total, pagination)
    };
  } catch (error) {
    logger.error(`Error in getInventoryByStockStatusService: ${error.message}`);
    throw error;
  }
};

/**
 * Create a new inventory item
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
