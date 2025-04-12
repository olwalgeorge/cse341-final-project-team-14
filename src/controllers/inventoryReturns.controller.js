const sendResponse = require("../utils/response.js");
const asyncHandler = require("express-async-handler");
const logger = require("../utils/logger.js");
const { DatabaseError } = require("../utils/errors");
const {
  getAllInventoryReturnsService,
  getInventoryReturnByIdService,
  getInventoryReturnByReturnIDService,
  getInventoryReturnsByWarehouseService,
  getInventoryReturnsBySourceService,
  getInventoryReturnsByStatusService,
  createInventoryReturnService,
  updateInventoryReturnService,
  approveInventoryReturnService,
  processInventoryReturnService,
  deleteInventoryReturnService,
  deleteAllInventoryReturnsService
} = require("../services/inventoryReturns.service");
const { transformInventoryReturn, generateReturnId } = require("../utils/inventoryReturn.utils");

/**
 * @desc    Get all inventory returns
 * @route   GET /inventory-returns
 * @access  Private
 */
const getAllInventoryReturns = asyncHandler(async (req, res, next) => {
  logger.info("getAllInventoryReturns called");
  logger.debug("Query parameters:", req.query);
  
  try {
    const result = await getAllInventoryReturnsService(req.query);
    const transformedReturns = result.returns.map(transformInventoryReturn);
    
    sendResponse(
      res,
      200,
      "Inventory returns retrieved successfully",
      {
        returns: transformedReturns,
        pagination: result.pagination
      }
    );
  } catch (error) {
    logger.error("Error retrieving all inventory returns:", error);
    next(error);
  }
});

/**
 * @desc    Get inventory return by ID
 * @route   GET /inventory-returns/:return_Id
 * @access  Private
 */
const getInventoryReturnById = asyncHandler(async (req, res, next) => {
  logger.info(`getInventoryReturnById called with ID: ${req.params.return_Id}`);
  try {
    const inventoryReturn = await getInventoryReturnByIdService(req.params.return_Id);
    if (inventoryReturn) {
      const transformedReturn = transformInventoryReturn(inventoryReturn);
      sendResponse(
        res,
        200,
        "Inventory return retrieved successfully",
        transformedReturn
      );
    } else {
      return next(DatabaseError.notFound("Inventory return"));
    }
  } catch (error) {
    logger.error(`Error retrieving inventory return with ID: ${req.params.return_Id}`, error);
    next(error);
  }
});

/**
 * @desc    Get inventory return by return ID (RET-XXXXX format)
 * @route   GET /inventory-returns/returnID/:returnID
 * @access  Private
 */
const getInventoryReturnByReturnID = asyncHandler(async (req, res, next) => {
  logger.info(`getInventoryReturnByReturnID called with return ID: ${req.params.returnID}`);
  try {
    const inventoryReturn = await getInventoryReturnByReturnIDService(req.params.returnID);
    if (inventoryReturn) {
      const transformedReturn = transformInventoryReturn(inventoryReturn);
      sendResponse(
        res,
        200,
        "Inventory return retrieved successfully",
        transformedReturn
      );
    } else {
      return next(DatabaseError.notFound("Inventory return"));
    }
  } catch (error) {
    logger.error(`Error retrieving inventory return with return ID: ${req.params.returnID}`, error);
    next(error);
  }
});

/**
 * @desc    Get inventory returns by warehouse
 * @route   GET /inventory-returns/warehouse/:warehouseId
 * @access  Private
 */
const getInventoryReturnsByWarehouse = asyncHandler(async (req, res, next) => {
  logger.info(`getInventoryReturnsByWarehouse called with warehouse ID: ${req.params.warehouseId}`);
  logger.debug("Query parameters:", req.query);
  
  try {
    const result = await getInventoryReturnsByWarehouseService(req.params.warehouseId, req.query);
    
    if (!result.returns.length) {
      return sendResponse(res, 200, "No inventory returns found for this warehouse", {
        returns: [],
        pagination: result.pagination
      });
    }
    
    const transformedReturns = result.returns.map(transformInventoryReturn);
    sendResponse(
      res,
      200,
      "Inventory returns retrieved successfully",
      {
        returns: transformedReturns,
        pagination: result.pagination
      }
    );
  } catch (error) {
    logger.error(`Error retrieving inventory returns for warehouse: ${req.params.warehouseId}`, error);
    next(error);
  }
});

/**
 * @desc    Get inventory returns by source (customer, supplier, etc.)
 * @route   GET /inventory-returns/source/:sourceType/:sourceId?
 * @access  Private
 */
const getInventoryReturnsBySource = asyncHandler(async (req, res, next) => {
  const { sourceType, sourceId } = req.params;
  logger.info(`getInventoryReturnsBySource called with sourceType: ${sourceType}, sourceId: ${sourceId || 'all'}`);
  logger.debug("Query parameters:", req.query);
  
  try {
    const result = await getInventoryReturnsBySourceService(sourceType, sourceId, req.query);
    
    if (!result.returns.length) {
      return sendResponse(res, 200, `No inventory returns found for ${sourceType}${sourceId ? ' ID: ' + sourceId : ''}`, {
        returns: [],
        pagination: result.pagination
      });
    }
    
    const transformedReturns = result.returns.map(transformInventoryReturn);
    sendResponse(
      res,
      200,
      "Inventory returns retrieved successfully",
      {
        returns: transformedReturns,
        pagination: result.pagination
      }
    );
  } catch (error) {
    logger.error(`Error retrieving inventory returns for ${sourceType}${sourceId ? ' ID: ' + sourceId : ''}`, error);
    next(error);
  }
});

/**
 * @desc    Get inventory returns by status
 * @route   GET /inventory-returns/status/:status
 * @access  Private
 */
const getInventoryReturnsByStatus = asyncHandler(async (req, res, next) => {
  logger.info(`getInventoryReturnsByStatus called with status: ${req.params.status}`);
  logger.debug("Query parameters:", req.query);
  
  try {
    const result = await getInventoryReturnsByStatusService(req.params.status, req.query);
    
    if (!result.returns.length) {
      return sendResponse(res, 200, `No inventory returns found with status: ${req.params.status}`, {
        returns: [],
        pagination: result.pagination
      });
    }
    
    const transformedReturns = result.returns.map(transformInventoryReturn);
    sendResponse(
      res,
      200,
      "Inventory returns retrieved successfully",
      {
        returns: transformedReturns,
        pagination: result.pagination
      }
    );
  } catch (error) {
    logger.error(`Error retrieving inventory returns with status: ${req.params.status}`, error);
    next(error);
  }
});

/**
 * @desc    Create a new inventory return
 * @route   POST /inventory-returns
 * @access  Private
 */
const createInventoryReturn = asyncHandler(async (req, res, next) => {
  logger.info("createInventoryReturn called");
  logger.debug("Request body:", req.body);
  try {
    // Generate returnID if not provided
    if (!req.body.returnID) {
      const returnID = await generateReturnId();
      logger.debug(`Generated returnID: ${returnID}`);
      req.body.returnID = returnID;
    }
    
    // Add the user who requested the return
    if (!req.body.requestedBy) {
      req.body.requestedBy = req.user._id;
    }
    
    const inventoryReturn = await createInventoryReturnService(req.body);
    const transformedReturn = transformInventoryReturn(inventoryReturn);
    sendResponse(
      res,
      201,
      "Inventory return created successfully",
      transformedReturn
    );
  } catch (error) {
    logger.error("Error creating inventory return:", error);
    next(error);
  }
});

/**
 * @desc    Update inventory return by ID
 * @route   PUT /inventory-returns/:return_Id
 * @access  Private
 */
const updateInventoryReturnById = asyncHandler(async (req, res, next) => {
  logger.info(`updateInventoryReturnById called with ID: ${req.params.return_Id}`);
  logger.debug("Update data:", req.body);
  try {
    const inventoryReturn = await updateInventoryReturnService(req.params.return_Id, req.body);
    if (inventoryReturn) {
      const transformedReturn = transformInventoryReturn(inventoryReturn);
      sendResponse(
        res,
        200,
        "Inventory return updated successfully",
        transformedReturn
      );
    } else {
      return next(DatabaseError.notFound("Inventory return"));
    }
  } catch (error) {
    logger.error(`Error updating inventory return with ID: ${req.params.return_Id}`, error);
    next(error);
  }
});

/**
 * @desc    Approve inventory return
 * @route   PUT /inventory-returns/:return_Id/approve
 * @access  Private
 */
const approveInventoryReturn = asyncHandler(async (req, res, next) => {
  logger.info(`approveInventoryReturn called with ID: ${req.params.return_Id}`);
  logger.debug("Approval data:", req.body);
  try {
    // Add the user who approved the return
    req.body.approvedBy = req.user._id;
    
    const inventoryReturn = await approveInventoryReturnService(req.params.return_Id, req.body);
    if (inventoryReturn) {
      const transformedReturn = transformInventoryReturn(inventoryReturn);
      sendResponse(
        res,
        200,
        "Inventory return approved successfully",
        transformedReturn
      );
    } else {
      return next(DatabaseError.notFound("Inventory return"));
    }
  } catch (error) {
    logger.error(`Error approving inventory return with ID: ${req.params.return_Id}`, error);
    next(error);
  }
});

/**
 * @desc    Process inventory return (complete the return process)
 * @route   PUT /inventory-returns/:return_Id/process
 * @access  Private
 */
const processInventoryReturn = asyncHandler(async (req, res, next) => {
  logger.info(`processInventoryReturn called with ID: ${req.params.return_Id}`);
  logger.debug("Processing data:", req.body);
  try {
    // Add the user who processed the return
    req.body.processedBy = req.user._id;
    
    const inventoryReturn = await processInventoryReturnService(req.params.return_Id, req.body);
    if (inventoryReturn) {
      const transformedReturn = transformInventoryReturn(inventoryReturn);
      sendResponse(
        res,
        200,
        "Inventory return processed successfully",
        transformedReturn
      );
    } else {
      return next(DatabaseError.notFound("Inventory return"));
    }
  } catch (error) {
    logger.error(`Error processing inventory return with ID: ${req.params.return_Id}`, error);
    next(error);
  }
});

/**
 * @desc    Delete inventory return by ID
 * @route   DELETE /inventory-returns/:return_Id
 * @access  Private
 */
const deleteInventoryReturnById = asyncHandler(async (req, res, next) => {
  logger.info(`deleteInventoryReturnById called with ID: ${req.params.return_Id}`);
  try {
    const result = await deleteInventoryReturnService(req.params.return_Id);
    if (result.deletedCount > 0) {
      sendResponse(res, 200, "Inventory return deleted successfully");
    } else {
      return next(DatabaseError.notFound("Inventory return"));
    }
  } catch (error) {
    logger.error(`Error deleting inventory return with ID: ${req.params.return_Id}`, error);
    next(error);
  }
});

/**
 * @desc    Delete all inventory returns
 * @route   DELETE /inventory-returns
 * @access  Private
 */
const deleteAllInventoryReturns = asyncHandler(async (req, res, next) => {
  logger.info("deleteAllInventoryReturns called");
  try {
    const result = await deleteAllInventoryReturnsService();
    sendResponse(
      res,
      200,
      `${result.deletedCount} inventory returns deleted successfully`
    );
  } catch (error) {
    logger.error("Error deleting all inventory returns:", error);
    next(error);
  }
});

module.exports = {
  getAllInventoryReturns,
  getInventoryReturnById,
  getInventoryReturnByReturnID,
  getInventoryReturnsByWarehouse,
  getInventoryReturnsBySource,
  getInventoryReturnsByStatus,
  createInventoryReturn,
  updateInventoryReturnById,
  approveInventoryReturn,
  processInventoryReturn,
  deleteInventoryReturnById,
  deleteAllInventoryReturns
};
