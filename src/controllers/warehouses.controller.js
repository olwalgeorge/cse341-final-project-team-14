const sendResponse = require("../utils/response.js");
const asyncHandler = require("express-async-handler");
const { createLogger } = require("../utils/logger.js");
const { ValidationError, DatabaseError } = require("../utils/errors.js");
const {
  getAllWarehousesService,
  getWarehouseByIdService,
  getWarehouseByNameService,
  getWarehouseByWarehouseIDService,
  createWarehouseService,
  updateWarehouseService,
  deleteWarehouseService,
  deleteAllWarehousesService,
} = require("../services/warehouses.service.js");
const { transformWarehouse } = require("../utils/warehouse.utils.js");

// Create module-specific logger
const logger = createLogger('WarehousesController');

/**
 * @desc    Get all warehouses
 * @route   GET /warehouses
 * @access  Private
 */
const getAllWarehouses = asyncHandler(async (req, res, next) => {
  logger.info("getAllWarehouses called");
  logger.debug("Query parameters:", req.query);
  
  try {
    const result = await getAllWarehousesService(req.query);
    
    if (!result.warehouses.length) {
      return sendResponse(res, 200, "No warehouses found", {
        warehouses: [],
        pagination: result.pagination
      });
    }
    
    const transformedWarehouses = result.warehouses.map(transformWarehouse);
    sendResponse(
      res,
      200,
      "Warehouses retrieved successfully",
      { warehouses: transformedWarehouses, pagination: result.pagination }
    );
  } catch (error) {
    logger.error("Error retrieving warehouses:", error);
    next(error);
  }
});

/**
 * @desc    Get warehouse by MongoDB ID
 * @route   GET /warehouses/:warehouse_Id
 * @access  Private
 */
const getWarehouseById = asyncHandler(async (req, res, next) => {
  const id = req.params.warehouse_Id;
  logger.info(`getWarehouseById called with ID: ${id}`);
  
  try {
    const warehouse = await getWarehouseByIdService(id);
    
    if (!warehouse) {
      return next(new DatabaseError('notFound', 'Warehouse', id));
    }
    
    const transformedWarehouse = transformWarehouse(warehouse);
    sendResponse(
      res,
      200,
      "Warehouse retrieved successfully",
      transformedWarehouse
    );
  } catch (error) {
    logger.error(`Error retrieving warehouse with ID: ${id}`, error);
    
    // Handle CastError for invalid ObjectId
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return next(new ValidationError('id', id, 'Invalid warehouse ID format'));
    }
    
    next(error);
  }
});

/**
 * @desc    Get warehouse by name
 * @route   GET /warehouses/name/:name
 * @access  Private
 */
const getWarehouseByName = asyncHandler(async (req, res, next) => {
  const name = req.params.name;
  logger.info(`getWarehouseByName called with name: ${name}`);
  
  try {
    if (!name || name.trim().length < 2) {
      return next(new ValidationError('name', name, 'Warehouse name must be at least 2 characters long'));
    }
    
    const warehouse = await getWarehouseByNameService(name);
    
    if (!warehouse) {
      return next(new DatabaseError('notFound', 'Warehouse', null, { name }));
    }
    
    const transformedWarehouse = transformWarehouse(warehouse);
    sendResponse(
      res,
      200,
      "Warehouse retrieved successfully",
      transformedWarehouse
    );
  } catch (error) {
    logger.error(`Error retrieving warehouse with name: ${name}`, error);
    next(error);
  }
});

/**
 * @desc    Get warehouse by warehouse ID (WH-XXXXX format)
 * @route   GET /warehouses/warehouseID/:warehouseID
 * @access  Private
 */
const getWarehouseByWarehouseID = asyncHandler(async (req, res, next) => {
  const warehouseID = req.params.warehouseID;
  logger.info(`getWarehouseByWarehouseID called with warehouseID: ${warehouseID}`);
  
  try {
    // Validate warehouse ID format
    if (!warehouseID.match(/^WH-\d{5}$/)) {
      return next(new ValidationError(
        'warehouseID', 
        warehouseID, 
        'Warehouse ID must be in the format WH-XXXXX where X is a digit'
      ));
    }
    
    const warehouse = await getWarehouseByWarehouseIDService(warehouseID);
    
    if (!warehouse) {
      return next(new DatabaseError('notFound', 'Warehouse', null, { warehouseID }));
    }
    
    const transformedWarehouse = transformWarehouse(warehouse);
    sendResponse(
      res,
      200,
      "Warehouse retrieved successfully",
      transformedWarehouse
    );
  } catch (error) {
    logger.error(`Error retrieving warehouse with warehouse ID: ${warehouseID}`, error);
    next(error);
  }
});

/**
 * @desc    Create a new warehouse
 * @route   POST /warehouses
 * @access  Private
 */
const createWarehouse = asyncHandler(async (req, res, next) => {
  logger.info("createWarehouse called");
  logger.debug("Warehouse data:", req.body);
  
  try {
    // Ensure we're not using any user-provided warehouseID to force generation
    const warehouseData = { ...req.body };
    delete warehouseData.warehouseID;
    
    const warehouse = await createWarehouseService(warehouseData);
    const transformedWarehouse = transformWarehouse(warehouse);
    sendResponse(res, 201, "Warehouse created successfully", transformedWarehouse);
  } catch (error) {
    logger.error("Error creating warehouse:", error);
    
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
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      
      return next(new DatabaseError(
        'duplicate',
        'Warehouse',
        null,
        { field, value }
      ));
    }
    
    next(error);
  }
});

/**
 * @desc    Update warehouse by ID
 * @route   PUT /warehouses/:warehouse_Id
 * @access  Private
 */
const updateWarehouseById = asyncHandler(async (req, res, next) => {
  const id = req.params.warehouse_Id;
  logger.info(`updateWarehouse called with ID: ${id}`);
  logger.debug("Update data:", req.body);
  
  try {
    // Prevent updating the warehouseID
    if (req.body.warehouseID) {
      delete req.body.warehouseID;
    }
    
    const warehouse = await updateWarehouseService(id, req.body);
    
    if (!warehouse) {
      return next(new DatabaseError('notFound', 'Warehouse', id));
    }
    
    const transformedWarehouse = transformWarehouse(warehouse);
    sendResponse(
      res,
      200,
      "Warehouse updated successfully",
      transformedWarehouse
    );
  } catch (error) {
    logger.error(`Error updating warehouse with ID: ${id}`, error);
    
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
    
    // Handle CastError for invalid ObjectId
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return next(new ValidationError('id', id, 'Invalid warehouse ID format'));
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      
      return next(new DatabaseError(
        'duplicate',
        'Warehouse',
        null,
        { field, value }
      ));
    }
    
    next(error);
  }
});

/**
 * @desc    Delete warehouse by ID
 * @route   DELETE /warehouses/:warehouse_Id
 * @access  Private
 */
const deleteWarehouseById = asyncHandler(async (req, res, next) => {
  const id = req.params.warehouse_Id;
  logger.info(`deleteWarehouse called with ID: ${id}`);
  
  try {
    const result = await deleteWarehouseService(id);
    
    if (result.deletedCount === 0) {
      return next(new DatabaseError('notFound', 'Warehouse', id));
    }
    
    sendResponse(res, 200, "Warehouse deleted successfully");
  } catch (error) {
    logger.error(`Error deleting warehouse with ID: ${id}`, error);
    
    // Handle CastError for invalid ObjectId
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return next(new ValidationError('id', id, 'Invalid warehouse ID format'));
    }
    
    next(error);
  }
});

/**
 * @desc    Delete all warehouses
 * @route   DELETE /warehouses
 * @access  Private
 */
const deleteAllWarehouses = asyncHandler(async (req, res, next) => {
  logger.info("deleteAllWarehouses called");
  try {
    const result = await deleteAllWarehousesService();
    sendResponse(
      res,
      200,
      `${result.deletedCount} warehouses deleted successfully`
    );
  } catch (error) {
    logger.error("Error deleting all warehouses:", error);
    next(error);
  }
});

module.exports = {
  getAllWarehouses,
  getWarehouseById,
  getWarehouseByName,
  getWarehouseByWarehouseID,
  createWarehouse,
  updateWarehouseById,
  deleteWarehouseById,
  deleteAllWarehouses,
};
