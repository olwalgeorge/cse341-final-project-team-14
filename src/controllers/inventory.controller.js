const sendResponse = require("../utils/response.js");
const asyncHandler = require("express-async-handler");
const logger = require("../utils/logger.js");
const mongoose = require("mongoose");
const { ValidationError, DatabaseError } = require("../utils/errors");
const {
  getAllInventoryService,
  getInventoryByIdService,
  getInventoryByInventoryIDService,
  getInventoryByWarehouseService,
  getInventoryByProductService,
  getLowStockInventoryService,
  getOutOfStockInventoryService,
  createOrUpdateInventoryService,
  adjustInventoryService,
  transferInventoryService,
  deleteInventoryService,
  deleteAllInventoryService,
  getInventoryByStockStatusService,
  searchInventoryService,
} = require("../services/inventory.service");
const { transformInventory } = require("../utils/inventory.utils");

/**
 * @desc    Get all inventory items
 * @route   GET /inventory
 * @access  Private
 */
const getAllInventory = asyncHandler(async (req, res, next) => {
  logger.info("getAllInventory called");
  logger.debug("Query parameters:", req.query);
  
  try {
    const result = await getAllInventoryService(req.query);
    
    if (!result.inventory.length) {
      return sendResponse(res, 200, "No inventory found", {
        inventory: [],
        pagination: result.pagination
      });
    }
    
    const transformedInventory = result.inventory.map(transformInventory);
    sendResponse(
      res,
      200,
      "Inventory retrieved successfully",
      { inventory: transformedInventory, pagination: result.pagination }
    );
  } catch (error) {
    logger.error("Error retrieving inventory:", error);
    next(error);
  }
});

/**
 * @desc    Get inventory by ID
 * @route   GET /inventory/:inventory_Id
 * @access  Private
 */
const getInventoryById = asyncHandler(async (req, res, next) => {
  const id = req.params.inventory_Id;
  logger.info(`getInventoryById called with ID: ${id}`);
  
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ValidationError('id', id, 'Invalid inventory ID format'));
    }
    
    const inventory = await getInventoryByIdService(id);
    
    if (!inventory) {
      return next(new DatabaseError('notFound', 'Inventory', id));
    }
    
    const transformedInventory = transformInventory(inventory);
    sendResponse(
      res,
      200,
      "Inventory retrieved successfully",
      transformedInventory
    );
  } catch (error) {
    logger.error(`Error retrieving inventory with ID: ${id}`, error);
    next(error);
  }
});

/**
 * @desc    Get inventory by inventory ID (IN-XXXXX format)
 * @route   GET /inventory/inventoryID/:inventoryID
 * @access  Private
 */
const getInventoryByInventoryID = asyncHandler(async (req, res, next) => {
  const inventoryID = req.params.inventoryID;
  logger.info(`getInventoryByInventoryID called with inventory ID: ${inventoryID}`);
  
  try {
    // Validate inventory ID format
    if (!inventoryID.match(/^IN-\d{5}$/)) {
      return next(new ValidationError(
        'inventoryID', 
        inventoryID, 
        'Inventory ID must be in the format IN-XXXXX where X is a digit'
      ));
    }
    
    const inventory = await getInventoryByInventoryIDService(inventoryID);
    
    if (!inventory) {
      return next(new DatabaseError('notFound', 'Inventory', null, { inventoryID }));
    }
    
    const transformedInventory = transformInventory(inventory);
    sendResponse(
      res,
      200,
      "Inventory retrieved successfully",
      transformedInventory
    );
  } catch (error) {
    logger.error(`Error retrieving inventory with inventory ID: ${inventoryID}`, error);
    next(error);
  }
});

/**
 * @desc    Get inventory by product
 * @route   GET /inventory/product/:productId
 * @access  Private
 */
const getInventoryByProduct = asyncHandler(async (req, res, next) => {
  const productId = req.params.productId;
  logger.info(`getInventoryByProduct called with product ID: ${productId}`);
  
  try {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return next(new ValidationError('productId', productId, 'Invalid product ID format'));
    }
    
    const result = await getInventoryByProductService(productId, req.query);
    
    if (!result.inventory.length) {
      return sendResponse(res, 200, `No inventory found for product ID: ${productId}`, {
        inventory: [],
        pagination: result.pagination
      });
    }
    
    const transformedInventory = result.inventory.map(transformInventory);
    sendResponse(
      res,
      200,
      `Inventory for product ID "${productId}" retrieved successfully`,
      { inventory: transformedInventory, pagination: result.pagination }
    );
  } catch (error) {
    logger.error(`Error retrieving inventory for product ${productId}:`, error);
    next(error);
  }
});

/**
 * @desc    Get inventory by warehouse
 * @route   GET /inventory/warehouse/:warehouseId
 * @access  Private
 */
const getInventoryByWarehouse = asyncHandler(async (req, res, next) => {
  const warehouseId = req.params.warehouseId;
  logger.info(`getInventoryByWarehouse called with warehouse ID: ${warehouseId}`);
  
  try {
    if (!mongoose.Types.ObjectId.isValid(warehouseId)) {
      return next(new ValidationError('warehouseId', warehouseId, 'Invalid warehouse ID format'));
    }
    
    const result = await getInventoryByWarehouseService(warehouseId, req.query);
    
    if (!result.inventory.length) {
      return sendResponse(res, 200, `No inventory found for warehouse ID: ${warehouseId}`, {
        inventory: [],
        pagination: result.pagination
      });
    }
    
    const transformedInventory = result.inventory.map(transformInventory);
    sendResponse(
      res,
      200,
      `Inventory for warehouse ID "${warehouseId}" retrieved successfully`,
      { inventory: transformedInventory, pagination: result.pagination }
    );
  } catch (error) {
    logger.error(`Error retrieving inventory for warehouse ${warehouseId}:`, error);
    next(error);
  }
});

/**
 * @desc    Get low stock inventory
 * @route   GET /inventory/low-stock
 * @access  Private
 */
const getLowStockInventory = asyncHandler(async (req, res, next) => {
  const threshold = req.query.threshold ? parseInt(req.query.threshold) : 10;
  logger.info(`getLowStockInventory called with threshold: ${threshold}`);
  
  try {
    if (isNaN(threshold) || threshold < 0) {
      return next(new ValidationError('threshold', threshold, 'Threshold must be a non-negative number'));
    }
    
    const result = await getLowStockInventoryService(threshold, req.query);
    
    if (!result.inventory.length) {
      return sendResponse(res, 200, `No low stock inventory found below threshold: ${threshold}`, {
        inventory: [],
        pagination: result.pagination
      });
    }
    
    const transformedInventory = result.inventory.map(transformInventory);
    sendResponse(
      res,
      200,
      `Low stock inventory below threshold ${threshold} retrieved successfully`,
      { inventory: transformedInventory, pagination: result.pagination }
    );
  } catch (error) {
    logger.error(`Error retrieving low stock inventory:`, error);
    next(error);
  }
});

/**
 * @desc    Get out of stock inventory
 * @route   GET /inventory/out-of-stock
 * @access  Private
 */
const getOutOfStockInventory = asyncHandler(async (req, res, next) => {
  logger.info("getOutOfStockInventory called");
  
  try {
    const result = await getOutOfStockInventoryService(req.query);
    
    if (!result.inventory.length) {
      return sendResponse(res, 200, "No out of stock inventory found", {
        inventory: [],
        pagination: result.pagination
      });
    }
    
    const transformedInventory = result.inventory.map(transformInventory);
    sendResponse(
      res,
      200,
      "Out of stock inventory retrieved successfully",
      { inventory: transformedInventory, pagination: result.pagination }
    );
  } catch (error) {
    logger.error("Error retrieving out of stock inventory:", error);
    next(error);
  }
});

/**
 * @desc    Create or update inventory
 * @route   POST /inventory
 * @access  Private
 */
const createOrUpdateInventory = asyncHandler(async (req, res, next) => {
  logger.info("createOrUpdateInventory called");
  logger.debug("Inventory data:", req.body);
  
  try {
    // Validate required fields
    if (!req.body.product) {
      return next(new ValidationError('product', null, 'Product ID is required'));
    }
    
    if (!mongoose.Types.ObjectId.isValid(req.body.product)) {
      return next(new ValidationError('product', req.body.product, 'Invalid product ID format'));
    }
    
    if (!req.body.warehouse) {
      return next(new ValidationError('warehouse', null, 'Warehouse ID is required'));
    }
    
    if (!mongoose.Types.ObjectId.isValid(req.body.warehouse)) {
      return next(new ValidationError('warehouse', req.body.warehouse, 'Invalid warehouse ID format'));
    }
    
    if (req.body.quantity === undefined) {
      return next(new ValidationError('quantity', null, 'Quantity is required'));
    }
    
    if (isNaN(Number(req.body.quantity)) || Number(req.body.quantity) < 0) {
      return next(new ValidationError('quantity', req.body.quantity, 'Quantity must be a non-negative number'));
    }
    
    // Set creator/updater if available
    const inventoryData = { ...req.body };
    if (req.user) {
      inventoryData.lastUpdatedBy = req.user._id;
    }
    
    const inventory = await createOrUpdateInventoryService(inventoryData);
    const transformedInventory = transformInventory(inventory);
    
    sendResponse(res, 200, "Inventory created or updated successfully", transformedInventory);
  } catch (error) {
    logger.error("Error creating or updating inventory:", error);
    
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
      const entity = error.message.split(' not found')[0];
      return next(new DatabaseError('notFound', entity, null));
    }
    
    next(error);
  }
});

/**
 * @desc    Adjust inventory quantity
 * @route   PUT /inventory/adjust
 * @access  Private
 */
const adjustInventory = asyncHandler(async (req, res, next) => {
  logger.info("adjustInventory called");
  logger.debug("Adjustment data:", req.body);
  
  try {
    // Validate required fields
    if (!req.body.product) {
      return next(new ValidationError('product', null, 'Product ID is required'));
    }
    
    if (!mongoose.Types.ObjectId.isValid(req.body.product)) {
      return next(new ValidationError('product', req.body.product, 'Invalid product ID format'));
    }
    
    if (!req.body.warehouse) {
      return next(new ValidationError('warehouse', null, 'Warehouse ID is required'));
    }
    
    if (!mongoose.Types.ObjectId.isValid(req.body.warehouse)) {
      return next(new ValidationError('warehouse', req.body.warehouse, 'Invalid warehouse ID format'));
    }
    
    if (req.body.adjustmentQuantity === undefined) {
      return next(new ValidationError('adjustmentQuantity', null, 'Adjustment quantity is required'));
    }
    
    if (isNaN(Number(req.body.adjustmentQuantity))) {
      return next(new ValidationError('adjustmentQuantity', req.body.adjustmentQuantity, 'Adjustment quantity must be a number'));
    }
    
    if (!req.body.reason) {
      return next(new ValidationError('reason', null, 'Adjustment reason is required'));
    }
    
    // Set adjuster if available
    const adjustmentData = { ...req.body };
    if (req.user) {
      adjustmentData.adjustedBy = req.user._id;
    }
    
    const inventory = await adjustInventoryService(adjustmentData);
    
    if (!inventory) {
      return next(new DatabaseError(
        'notFound', 
        'Inventory', 
        null, 
        { 
          product: req.body.product, 
          warehouse: req.body.warehouse 
        }
      ));
    }
    
    // Check if adjustment would result in negative inventory
    const currentQuantity = inventory.quantity - parseInt(req.body.adjustmentQuantity);
    if (currentQuantity < 0) {
      return next(new ValidationError(
        'adjustmentQuantity', 
        req.body.adjustmentQuantity, 
        `Adjustment would result in negative inventory (${inventory.quantity} + ${req.body.adjustmentQuantity} = ${currentQuantity})`
      ));
    }
    
    const transformedInventory = transformInventory(inventory);
    
    sendResponse(res, 200, "Inventory adjusted successfully", transformedInventory);
  } catch (error) {
    logger.error("Error adjusting inventory:", error);
    next(error);
  }
});

/**
 * @desc    Transfer inventory between warehouses
 * @route   PUT /inventory/transfer
 * @access  Private
 */
const transferInventory = asyncHandler(async (req, res, next) => {
  logger.info("transferInventory called");
  logger.debug("Transfer data:", req.body);
  
  try {
    // Validate required fields
    if (!req.body.product) {
      return next(new ValidationError('product', null, 'Product ID is required'));
    }
    
    if (!mongoose.Types.ObjectId.isValid(req.body.product)) {
      return next(new ValidationError('product', req.body.product, 'Invalid product ID format'));
    }
    
    if (!req.body.sourceWarehouse) {
      return next(new ValidationError('sourceWarehouse', null, 'Source warehouse ID is required'));
    }
    
    if (!mongoose.Types.ObjectId.isValid(req.body.sourceWarehouse)) {
      return next(new ValidationError('sourceWarehouse', req.body.sourceWarehouse, 'Invalid source warehouse ID format'));
    }
    
    if (!req.body.destinationWarehouse) {
      return next(new ValidationError('destinationWarehouse', null, 'Destination warehouse ID is required'));
    }
    
    if (!mongoose.Types.ObjectId.isValid(req.body.destinationWarehouse)) {
      return next(new ValidationError('destinationWarehouse', req.body.destinationWarehouse, 'Invalid destination warehouse ID format'));
    }
    
    if (req.body.sourceWarehouse === req.body.destinationWarehouse) {
      return next(new ValidationError(
        'warehouses', 
        `${req.body.sourceWarehouse} -> ${req.body.destinationWarehouse}`, 
        'Source and destination warehouses must be different'
      ));
    }
    
    if (req.body.quantity === undefined) {
      return next(new ValidationError('quantity', null, 'Quantity is required'));
    }
    
    if (isNaN(Number(req.body.quantity)) || Number(req.body.quantity) <= 0) {
      return next(new ValidationError('quantity', req.body.quantity, 'Quantity must be a positive number'));
    }
    
    // Set transferrer if available
    const transferData = { ...req.body };
    if (req.user) {
      transferData.transferredBy = req.user._id;
    }
    
    const result = await transferInventoryService(transferData);
    
    if (!result) {
      return next(new DatabaseError(
        'notFound', 
        'Inventory', 
        null, 
        { 
          product: req.body.product, 
          warehouse: req.body.sourceWarehouse,
          message: 'Product not found in source warehouse'
        }
      ));
    }
    
    // Check if source has enough quantity
    if (result.sourceInventory.quantity < req.body.quantity) {
      return next(new ValidationError(
        'quantity',
        req.body.quantity,
        `Insufficient quantity in source warehouse. Available: ${result.sourceInventory.quantity}, Requested: ${req.body.quantity}`
      ));
    }
    
    sendResponse(res, 200, "Inventory transferred successfully", {
      sourceInventory: transformInventory(result.sourceInventory),
      destinationInventory: transformInventory(result.destinationInventory)
    });
  } catch (error) {
    logger.error("Error transferring inventory:", error);
    next(error);
  }
});

/**
 * @desc    Delete inventory item
 * @route   DELETE /inventory/:inventory_Id
 * @access  Private
 */
const deleteInventory = asyncHandler(async (req, res, next) => {
  const id = req.params.inventory_Id;
  logger.info(`deleteInventory called with ID: ${id}`);
  
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ValidationError('id', id, 'Invalid inventory ID format'));
    }
    
    // Check if inventory exists
    const inventory = await getInventoryByIdService(id);
    if (!inventory) {
      return next(new DatabaseError('notFound', 'Inventory', id));
    }
    
    const result = await deleteInventoryService(id);
    
    if (result.deletedCount === 0) {
      return next(new DatabaseError('notFound', 'Inventory', id));
    }
    
    sendResponse(res, 200, "Inventory deleted successfully");
  } catch (error) {
    logger.error(`Error deleting inventory with ID: ${id}`, error);
    next(error);
  }
});

/**
 * @desc    Delete all inventory
 * @route   DELETE /inventory
 * @access  Private
 */
const deleteAllInventory = asyncHandler(async (req, res, next) => {
  logger.info("deleteAllInventory called");
  
  try {
    // Only allow in development/test environments for safety
    const env = process.env.NODE_ENV || 'development';
    if (env === 'production') {
      return next(new ValidationError(
        'environment',
        env,
        'Mass deletion of inventory is not allowed in production environment'
      ));
    }
    
    const result = await deleteAllInventoryService();
    sendResponse(
      res,
      200,
      `${result.deletedCount} inventory items deleted successfully`
    );
  } catch (error) {
    logger.error("Error deleting all inventory:", error);
    next(error);
  }
});

/**
 * @desc    Get inventory by stock status
 * @route   GET /inventory/status/:stockStatus
 * @access  Private
 */
const getInventoryByStockStatus = asyncHandler(async (req, res, next) => {
  const stockStatus = req.params.stockStatus;
  logger.info(`getInventoryByStockStatus called with status: ${stockStatus}`);
  
  try {
    // Validate status
    const validStatuses = ['In Stock', 'Low Stock', 'Out of Stock'];
    if (!validStatuses.includes(stockStatus)) {
      return next(new ValidationError('stockStatus', stockStatus, `Stock status must be one of: ${validStatuses.join(', ')}`));
    }
    
    const result = await getInventoryByStockStatusService(stockStatus, req.query);
    
    if (!result.inventory.length) {
      return sendResponse(res, 200, `No inventory found with stock status: ${stockStatus}`, {
        inventory: [],
        pagination: result.pagination
      });
    }
    
    const transformedInventory = result.inventory.map(transformInventory);
    sendResponse(
      res,
      200,
      `Inventory with stock status "${stockStatus}" retrieved successfully`,
      { inventory: transformedInventory, pagination: result.pagination }
    );
  } catch (error) {
    logger.error(`Error retrieving inventory with stock status ${stockStatus}:`, error);
    next(error);
  }
});

/**
 * @desc    Search inventory
 * @route   GET /inventory/search
 * @access  Private
 */
const searchInventory = asyncHandler(async (req, res, next) => {
  const searchTerm = req.query.term;
  logger.info(`searchInventory called with term: ${searchTerm}`);
  
  try {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return next(new ValidationError('term', searchTerm, 'Search term is required'));
    }
    
    const result = await searchInventoryService(searchTerm, req.query);
    
    if (!result.inventory.length) {
      return sendResponse(res, 200, `No inventory found matching search term: ${searchTerm}`, {
        inventory: [],
        pagination: result.pagination
      });
    }
    
    const transformedInventory = result.inventory.map(transformInventory);
    sendResponse(
      res,
      200,
      `Inventory matching search term "${searchTerm}" retrieved successfully`,
      { inventory: transformedInventory, pagination: result.pagination }
    );
  } catch (error) {
    logger.error(`Error searching inventory with term: ${searchTerm}`, error);
    next(error);
  }
});

module.exports = {
  getAllInventory,
  getInventoryById,
  getInventoryByInventoryID,
  getInventoryByProduct,
  getInventoryByWarehouse,
  getInventoryByStockStatus,
  getLowStockInventory,
  getOutOfStockInventory,
  searchInventory,
  createOrUpdateInventory,
  adjustInventory,
  transferInventory,
  deleteInventory,
  deleteAllInventory,
};
