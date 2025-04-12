const sendResponse = require("../utils/response.js");
const asyncHandler = require("express-async-handler");
const logger = require("../utils/logger.js");
const { DatabaseError } = require("../utils/errors");
const {
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
} = require("../services/inventory.service");
const { transformInventory, generateInventoryId } = require("../utils/inventory.utils");

/**
 * @desc    Get all inventory items
 * @route   GET /inventory
 * @access  Public
 */
const getAllInventory = asyncHandler(async (req, res, next) => {
  logger.info("getAllInventory called");
  logger.debug("Query parameters:", req.query);
  
  try {
    const result = await getAllInventoryService(req.query);
    
    sendResponse(
      res,
      200,
      "Inventory items retrieved successfully",
      {
        inventory: result.inventoryItems,
        pagination: result.pagination
      }
    );
  } catch (error) {
    logger.error("Error retrieving all inventory items:", error);
    next(error);
  }
});

/**
 * @desc    Get inventory item by ID
 * @route   GET /inventory/:inventory_Id
 * @access  Private
 */
const getInventoryById = asyncHandler(async (req, res, next) => {
  logger.info(`getInventoryById called with ID: ${req.params.inventory_Id}`);
  try {
    const inventory = await getInventoryByIdService(req.params.inventory_Id);
    if (inventory) {
      const transformedInventory = transformInventory(inventory);
      sendResponse(
        res,
        200,
        "Inventory item retrieved successfully",
        transformedInventory
      );
    } else {
      return next(DatabaseError.notFound("Inventory item"));
    }
  } catch (error) {
    logger.error(`Error retrieving inventory item with ID: ${req.params.inventory_Id}`, error);
    next(error);
  }
});

/**
 * @desc    Get inventory item by inventory ID (IN-XXXXX format)
 * @route   GET /inventory/inventoryID/:inventoryID
 * @access  Private
 */
const getInventoryByInventoryID = asyncHandler(async (req, res, next) => {
  logger.info(
    `getInventoryByInventoryID called with inventory ID: ${req.params.inventoryID}`
  );
  try {
    const inventory = await getInventoryByInventoryIDService(
      req.params.inventoryID
    );
    if (inventory) {
      const transformedInventory = transformInventory(inventory);
      sendResponse(
        res,
        200,
        "Inventory item retrieved successfully",
        transformedInventory
      );
    } else {
      return next(DatabaseError.notFound("Inventory item"));
    }
  } catch (error) {
    logger.error(
      `Error retrieving inventory item with inventory ID: ${req.params.inventoryID}`,
      error
    );
    next(error);
  }
});

/**
 * @desc    Get inventory items by warehouse
 * @route   GET /inventory/warehouse/:warehouseId
 * @access  Public
 */
const getInventoryByWarehouse = asyncHandler(async (req, res, next) => {
  logger.info(`getInventoryByWarehouse called with warehouse ID: ${req.params.warehouseId}`);
  
  try {
    const result = await getInventoryByWarehouseService(req.params.warehouseId, req.query);
    
    if (!result.inventoryItems.length) {
      return sendResponse(res, 200, "No inventory items found for this warehouse", {
        inventory: [],
        pagination: result.pagination
      });
    }
    
    sendResponse(
      res,
      200,
      "Inventory items retrieved successfully",
      {
        inventory: result.inventoryItems,
        pagination: result.pagination
      }
    );
  } catch (error) {
    logger.error(`Error retrieving inventory for warehouse ID: ${req.params.warehouseId}`, error);
    next(error);
  }
});

/**
 * @desc    Get inventory items by product
 * @route   GET /inventory/product/:productId
 * @access  Public
 */
const getInventoryByProduct = asyncHandler(async (req, res, next) => {
  logger.info(`getInventoryByProduct called with product ID: ${req.params.productId}`);
  
  try {
    const result = await getInventoryByProductService(req.params.productId, req.query);
    
    if (!result.inventoryItems.length) {
      return sendResponse(res, 200, "No inventory items found for this product", {
        inventory: [],
        pagination: result.pagination
      });
    }
    
    sendResponse(
      res,
      200,
      "Inventory items retrieved successfully",
      {
        inventory: result.inventoryItems,
        pagination: result.pagination
      }
    );
  } catch (error) {
    logger.error(`Error retrieving inventory for product ID: ${req.params.productId}`, error);
    next(error);
  }
});

/**
 * @desc    Get inventory items by stock status
 * @route   GET /inventory/status/:stockStatus
 * @access  Public
 */
const getInventoryByStockStatus = asyncHandler(async (req, res, next) => {
  logger.info(`getInventoryByStockStatus called with status: ${req.params.stockStatus}`);
  
  try {
    const result = await getInventoryByStockStatusService(req.params.stockStatus, req.query);
    
    if (!result.inventoryItems.length) {
      return sendResponse(res, 200, `No inventory items found with status: ${req.params.stockStatus}`, {
        inventory: [],
        pagination: result.pagination
      });
    }
    
    sendResponse(
      res,
      200,
      "Inventory items retrieved successfully",
      {
        inventory: result.inventoryItems,
        pagination: result.pagination
      }
    );
  } catch (error) {
    logger.error(`Error retrieving inventory with status: ${req.params.stockStatus}`, error);
    next(error);
  }
});

/**
 * @desc    Create a new inventory item
 * @route   POST /inventory
 * @access  Private
 */
const createInventory = asyncHandler(async (req, res, next) => {
  logger.info("createInventory called");
  logger.debug("Request body:", req.body);
  try {
    // Generate inventoryID if not provided
    if (!req.body.inventoryID) {
      const inventoryID = await generateInventoryId();
      logger.debug(`Generated inventoryID: ${inventoryID}`);
      req.body.inventoryID = inventoryID;
    }
    
    const inventory = await createInventoryService(req.body);
    const transformedInventory = transformInventory(inventory);
    sendResponse(
      res,
      201,
      "Inventory item created successfully",
      transformedInventory
    );
  } catch (error) {
    logger.error("Error creating inventory item:", error);
    next(error);
  }
});

/**
 * @desc    Update inventory item by ID
 * @route   PUT /inventory/:inventory_Id
 * @access  Private
 */
const updateInventoryById = asyncHandler(async (req, res, next) => {
  logger.info(`updateInventoryById called with ID: ${req.params.inventory_Id}`);
  logger.debug("Update data:", req.body);
  try {
    const inventory = await updateInventoryService(req.params.inventory_Id, req.body);
    if (inventory) {
      const transformedInventory = transformInventory(inventory);
      sendResponse(
        res,
        200,
        "Inventory item updated successfully",
        transformedInventory
      );
    } else {
      return next(DatabaseError.notFound("Inventory item"));
    }
  } catch (error) {
    logger.error(`Error updating inventory item with ID: ${req.params.inventory_Id}`, error);
    next(error);
  }
});

/**
 * @desc    Delete inventory item by ID
 * @route   DELETE /inventory/:inventory_Id
 * @access  Private
 */
const deleteInventoryById = asyncHandler(async (req, res, next) => {
  logger.info(`deleteInventoryById called with ID: ${req.params.inventory_Id}`);
  try {
    const result = await deleteInventoryService(req.params.inventory_Id);
    if (result.deletedCount > 0) {
      sendResponse(res, 200, "Inventory item deleted successfully");
    } else {
      return next(DatabaseError.notFound("Inventory item"));
    }
  } catch (error) {
    logger.error(`Error deleting inventory item with ID: ${req.params.inventory_Id}`, error);
    next(error);
  }
});

/**
 * @desc    Delete all inventory items
 * @route   DELETE /inventory
 * @access  Private
 */
const deleteAllInventory = asyncHandler(async (req, res, next) => {
  logger.info("deleteAllInventory called");
  try {
    const result = await deleteAllInventoryService();
    sendResponse(
      res,
      200,
      `${result.deletedCount} inventory items deleted successfully`
    );
  } catch (error) {
    logger.error("Error deleting all inventory items:", error);
    next(error);
  }
});

module.exports = {
  getAllInventory,
  getInventoryById,
  getInventoryByInventoryID,
  getInventoryByWarehouse,
  getInventoryByProduct,
  getInventoryByStockStatus,
  createInventory,
  updateInventoryById,
  deleteInventoryById,
  deleteAllInventory,
};
