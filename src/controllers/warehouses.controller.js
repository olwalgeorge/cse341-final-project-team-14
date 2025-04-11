const sendResponse = require("../utils/response.js");
const asyncHandler = require("express-async-handler");
const logger = require("../utils/logger.js");
const { DatabaseError } = require("../utils/errors");
const {
  getAllWarehousesService,
  getWarehouseByIdService,
  getWarehouseByNameService,
  getWarehouseByWarehouseIDService,
  createWarehouseService,
  updateWarehouseService,
  deleteWarehouseService,
  deleteAllWarehousesService,
} = require("../services/warehouses.service");
const { transformWarehouse, generateWarehouseId } = require("../utils/warehouse.utils");

/**
 * @desc    Get all warehouses
 * @route   GET /warehouses
 * @access  Private
 */
const getAllWarehouses = asyncHandler(async (req, res, next) => {
  logger.info("getAllWarehouses called");
  try {
    const result = await getAllWarehousesService(req.query);
    const transformedWarehouses = result.warehouses.map(transformWarehouse);
    sendResponse(
      res,
      200,
      "Warehouses retrieved successfully",
      {
        warehouses: transformedWarehouses,
        pagination: result.pagination
      }
    );
  } catch (error) {
    logger.error("Error retrieving all warehouses:", error);
    next(error);
  }
});

/**
 * @desc    Get warehouse by ID
 * @route   GET /warehouses/:warehouse_Id
 * @access  Private
 */
const getWarehouseById = asyncHandler(async (req, res, next) => {
  logger.info(`getWarehouseById called with ID: ${req.params.warehouse_Id}`);
  try {
    const warehouse = await getWarehouseByIdService(req.params.warehouse_Id);
    if (warehouse) {
      const transformedWarehouse = transformWarehouse(warehouse);
      sendResponse(
        res,
        200,
        "Warehouse retrieved successfully",
        transformedWarehouse
      );
    } else {
      return next(DatabaseError.notFound("Warehouse"));
    }
  } catch (error) {
    logger.error(`Error retrieving warehouse with ID: ${req.params.warehouse_Id}`, error);
    next(error);
  }
});

/**
 * @desc    Get warehouse by name
 * @route   GET /warehouses/name/:name
 * @access  Private
 */
const getWarehouseByName = asyncHandler(async (req, res, next) => {
  logger.info(`getWarehouseByName called with name: ${req.params.name}`);
  try {
    const warehouse = await getWarehouseByNameService(req.params.name);
    if (warehouse) {
      const transformedWarehouse = transformWarehouse(warehouse);
      sendResponse(
        res,
        200,
        "Warehouse retrieved successfully",
        transformedWarehouse
      );
    } else {
      return next(DatabaseError.notFound("Warehouse"));
    }
  } catch (error) {
    logger.error(
      `Error retrieving warehouse with name: ${req.params.name}`,
      error
    );
    next(error);
  }
});

/**
 * @desc    Get warehouse by warehouse ID (WH-XXXXX format)
 * @route   GET /warehouses/warehouseID/:warehouseID
 * @access  Private
 */
const getWarehouseByWarehouseID = asyncHandler(async (req, res, next) => {
  logger.info(
    `getWarehouseByWarehouseID called with warehouse ID: ${req.params.warehouseID}`
  );
  try {
    const warehouse = await getWarehouseByWarehouseIDService(
      req.params.warehouseID
    );
    if (warehouse) {
      const transformedWarehouse = transformWarehouse(warehouse);
      sendResponse(
        res,
        200,
        "Warehouse retrieved successfully",
        transformedWarehouse
      );
    } else {
      return next(DatabaseError.notFound("Warehouse"));
    }
  } catch (error) {
    logger.error(
      `Error retrieving warehouse with warehouse ID: ${req.params.warehouseID}`,
      error
    );
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
  logger.debug("Request body:", req.body);
  try {
    // Generate a warehouse ID and add it to the request body
    const warehouseID = await generateWarehouseId();
    const warehouseData = { ...req.body, warehouseID };
    logger.debug("Warehouse data with generated ID:", warehouseData);
    
    const warehouse = await createWarehouseService(warehouseData);
    const transformedWarehouse = transformWarehouse(warehouse);
    sendResponse(
      res,
      201,
      "Warehouse created successfully",
      transformedWarehouse
    );
  } catch (error) {
    logger.error("Error creating warehouse:", error);
    next(error);
  }
});

/**
 * @desc    Update warehouse by ID
 * @route   PUT /warehouses/:warehouse_Id
 * @access  Private
 */
const updateWarehouseById = asyncHandler(async (req, res, next) => {
  logger.info(`updateWarehouseById called with ID: ${req.params.warehouse_Id}`);
  logger.debug("Update data:", req.body);
  try {
    const warehouse = await updateWarehouseService(req.params.warehouse_Id, req.body);
    if (warehouse) {
      const transformedWarehouse = transformWarehouse(warehouse);
      sendResponse(
        res,
        200,
        "Warehouse updated successfully",
        transformedWarehouse
      );
    } else {
      return next(DatabaseError.notFound("Warehouse"));
    }
  } catch (error) {
    logger.error(`Error updating warehouse with ID: ${req.params.warehouse_Id}`, error);
    next(error);
  }
});

/**
 * @desc    Delete warehouse by ID
 * @route   DELETE /warehouses/:warehouse_Id
 * @access  Private
 */
const deleteWarehouseById = asyncHandler(async (req, res, next) => {
  logger.info(`deleteWarehouseById called with ID: ${req.params.warehouse_Id}`);
  try {
    const result = await deleteWarehouseService(req.params.warehouse_Id);
    if (result.deletedCount > 0) {
      sendResponse(res, 200, "Warehouse deleted successfully");
    } else {
      return next(DatabaseError.notFound("Warehouse"));
    }
  } catch (error) {
    logger.error(`Error deleting warehouse with ID: ${req.params.warehouse_Id}`, error);
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
