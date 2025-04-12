const sendResponse = require("../utils/response.js");
const asyncHandler = require("express-async-handler");
const logger = require("../utils/logger.js");
const { DatabaseError } = require("../utils/errors");
const {
  getAllInventoryAdjustmentsService,
  getInventoryAdjustmentByIdService,
  getInventoryAdjustmentByAdjustmentIDService,
  getInventoryAdjustmentsByWarehouseService,
  getInventoryAdjustmentsByReasonService,
  getInventoryAdjustmentsByStatusService,
  createInventoryAdjustmentService,
  updateInventoryAdjustmentService,
  approveInventoryAdjustmentService,
  completeInventoryAdjustmentService,
  deleteInventoryAdjustmentService,
  deleteAllInventoryAdjustmentsService
} = require("../services/inventoryAdjustments.service");
const { transformInventoryAdjustment, generateAdjustmentId } = require("../utils/inventoryAdjustment.utils");

/**
 * @desc    Get all inventory adjustments
 * @route   GET /inventory-adjustments
 * @access  Private
 */
const getAllInventoryAdjustments = asyncHandler(async (req, res, next) => {
  logger.info("getAllInventoryAdjustments called");
  logger.debug("Query parameters:", req.query);
  
  try {
    const result = await getAllInventoryAdjustmentsService(req.query);
    const transformedAdjustments = result.adjustments.map(transformInventoryAdjustment);
    
    sendResponse(
      res,
      200,
      "Inventory adjustments retrieved successfully",
      {
        adjustments: transformedAdjustments,
        pagination: result.pagination
      }
    );
  } catch (error) {
    logger.error("Error retrieving all inventory adjustments:", error);
    next(error);
  }
});

/**
 * @desc    Get inventory adjustment by ID
 * @route   GET /inventory-adjustments/:adjustment_Id
 * @access  Private
 */
const getInventoryAdjustmentById = asyncHandler(async (req, res, next) => {
  logger.info(`getInventoryAdjustmentById called with ID: ${req.params.adjustment_Id}`);
  try {
    const inventoryAdjustment = await getInventoryAdjustmentByIdService(req.params.adjustment_Id);
    if (inventoryAdjustment) {
      const transformedAdjustment = transformInventoryAdjustment(inventoryAdjustment);
      sendResponse(
        res,
        200,
        "Inventory adjustment retrieved successfully",
        transformedAdjustment
      );
    } else {
      return next(DatabaseError.notFound("Inventory adjustment"));
    }
  } catch (error) {
    logger.error(`Error retrieving inventory adjustment with ID: ${req.params.adjustment_Id}`, error);
    next(error);
  }
});

/**
 * @desc    Get inventory adjustment by adjustment ID (ADJ-XXXXX format)
 * @route   GET /inventory-adjustments/adjustmentID/:adjustmentID
 * @access  Private
 */
const getInventoryAdjustmentByAdjustmentID = asyncHandler(async (req, res, next) => {
  logger.info(`getInventoryAdjustmentByAdjustmentID called with adjustment ID: ${req.params.adjustmentID}`);
  try {
    const inventoryAdjustment = await getInventoryAdjustmentByAdjustmentIDService(req.params.adjustmentID);
    if (inventoryAdjustment) {
      const transformedAdjustment = transformInventoryAdjustment(inventoryAdjustment);
      sendResponse(
        res,
        200,
        "Inventory adjustment retrieved successfully",
        transformedAdjustment
      );
    } else {
      return next(DatabaseError.notFound("Inventory adjustment"));
    }
  } catch (error) {
    logger.error(`Error retrieving inventory adjustment with adjustment ID: ${req.params.adjustmentID}`, error);
    next(error);
  }
});

/**
 * @desc    Get inventory adjustments by warehouse
 * @route   GET /inventory-adjustments/warehouse/:warehouseId
 * @access  Private
 */
const getInventoryAdjustmentsByWarehouse = asyncHandler(async (req, res, next) => {
  logger.info(`getInventoryAdjustmentsByWarehouse called with warehouse ID: ${req.params.warehouseId}`);
  logger.debug("Query parameters:", req.query);
  
  try {
    const result = await getInventoryAdjustmentsByWarehouseService(req.params.warehouseId, req.query);
    
    if (!result.adjustments.length) {
      return sendResponse(res, 200, "No inventory adjustments found for this warehouse", {
        adjustments: [],
        pagination: result.pagination
      });
    }
    
    const transformedAdjustments = result.adjustments.map(transformInventoryAdjustment);
    sendResponse(
      res,
      200,
      "Inventory adjustments retrieved successfully",
      {
        adjustments: transformedAdjustments,
        pagination: result.pagination
      }
    );
  } catch (error) {
    logger.error(`Error retrieving inventory adjustments for warehouse: ${req.params.warehouseId}`, error);
    next(error);
  }
});

/**
 * @desc    Get inventory adjustments by reason
 * @route   GET /inventory-adjustments/reason/:reason
 * @access  Private
 */
const getInventoryAdjustmentsByReason = asyncHandler(async (req, res, next) => {
  logger.info(`getInventoryAdjustmentsByReason called with reason: ${req.params.reason}`);
  logger.debug("Query parameters:", req.query);
  
  try {
    const result = await getInventoryAdjustmentsByReasonService(req.params.reason, req.query);
    
    if (!result.adjustments.length) {
      return sendResponse(res, 200, `No inventory adjustments found with reason: ${req.params.reason}`, {
        adjustments: [],
        pagination: result.pagination
      });
    }
    
    const transformedAdjustments = result.adjustments.map(transformInventoryAdjustment);
    sendResponse(
      res,
      200,
      "Inventory adjustments retrieved successfully",
      {
        adjustments: transformedAdjustments,
        pagination: result.pagination
      }
    );
  } catch (error) {
    logger.error(`Error retrieving inventory adjustments with reason: ${req.params.reason}`, error);
    next(error);
  }
});

/**
 * @desc    Get inventory adjustments by status
 * @route   GET /inventory-adjustments/status/:status
 * @access  Private
 */
const getInventoryAdjustmentsByStatus = asyncHandler(async (req, res, next) => {
  logger.info(`getInventoryAdjustmentsByStatus called with status: ${req.params.status}`);
  logger.debug("Query parameters:", req.query);
  
  try {
    const result = await getInventoryAdjustmentsByStatusService(req.params.status, req.query);
    
    if (!result.adjustments.length) {
      return sendResponse(res, 200, `No inventory adjustments found with status: ${req.params.status}`, {
        adjustments: [],
        pagination: result.pagination
      });
    }
    
    const transformedAdjustments = result.adjustments.map(transformInventoryAdjustment);
    sendResponse(
      res,
      200,
      "Inventory adjustments retrieved successfully",
      {
        adjustments: transformedAdjustments,
        pagination: result.pagination
      }
    );
  } catch (error) {
    logger.error(`Error retrieving inventory adjustments with status: ${req.params.status}`, error);
    next(error);
  }
});

/**
 * @desc    Create a new inventory adjustment
 * @route   POST /inventory-adjustments
 * @access  Private
 */
const createInventoryAdjustment = asyncHandler(async (req, res, next) => {
  logger.info("createInventoryAdjustment called");
  logger.debug("Request body:", req.body);
  try {
    // Generate adjustmentID if not provided
    if (!req.body.adjustmentID) {
      const adjustmentID = await generateAdjustmentId();
      logger.debug(`Generated adjustmentID: ${adjustmentID}`);
      req.body.adjustmentID = adjustmentID;
    }
    
    // Add the user who performed the adjustment
    if (!req.body.performedBy) {
      req.body.performedBy = req.user._id;
    }
    
    const inventoryAdjustment = await createInventoryAdjustmentService(req.body);
    const transformedAdjustment = transformInventoryAdjustment(inventoryAdjustment);
    sendResponse(
      res,
      201,
      "Inventory adjustment created successfully",
      transformedAdjustment
    );
  } catch (error) {
    logger.error("Error creating inventory adjustment:", error);
    next(error);
  }
});

/**
 * @desc    Update inventory adjustment by ID
 * @route   PUT /inventory-adjustments/:adjustment_Id
 * @access  Private
 */
const updateInventoryAdjustmentById = asyncHandler(async (req, res, next) => {
  logger.info(`updateInventoryAdjustmentById called with ID: ${req.params.adjustment_Id}`);
  logger.debug("Update data:", req.body);
  try {
    const inventoryAdjustment = await updateInventoryAdjustmentService(req.params.adjustment_Id, req.body);
    if (inventoryAdjustment) {
      const transformedAdjustment = transformInventoryAdjustment(inventoryAdjustment);
      sendResponse(
        res,
        200,
        "Inventory adjustment updated successfully",
        transformedAdjustment
      );
    } else {
      return next(DatabaseError.notFound("Inventory adjustment"));
    }
  } catch (error) {
    logger.error(`Error updating inventory adjustment with ID: ${req.params.adjustment_Id}`, error);
    next(error);
  }
});

/**
 * @desc    Approve inventory adjustment
 * @route   PUT /inventory-adjustments/:adjustment_Id/approve
 * @access  Private
 */
const approveInventoryAdjustment = asyncHandler(async (req, res, next) => {
  logger.info(`approveInventoryAdjustment called with ID: ${req.params.adjustment_Id}`);
  logger.debug("Approval data:", req.body);
  try {
    // Add the user who approved the adjustment
    req.body.approvedBy = req.user._id;
    
    const inventoryAdjustment = await approveInventoryAdjustmentService(req.params.adjustment_Id, req.body);
    if (inventoryAdjustment) {
      const transformedAdjustment = transformInventoryAdjustment(inventoryAdjustment);
      sendResponse(
        res,
        200,
        "Inventory adjustment approved successfully",
        transformedAdjustment
      );
    } else {
      return next(DatabaseError.notFound("Inventory adjustment"));
    }
  } catch (error) {
    logger.error(`Error approving inventory adjustment with ID: ${req.params.adjustment_Id}`, error);
    next(error);
  }
});

/**
 * @desc    Complete inventory adjustment (apply changes to inventory)
 * @route   PUT /inventory-adjustments/:adjustment_Id/complete
 * @access  Private
 */
const completeInventoryAdjustment = asyncHandler(async (req, res, next) => {
  logger.info(`completeInventoryAdjustment called with ID: ${req.params.adjustment_Id}`);
  try {
    const inventoryAdjustment = await completeInventoryAdjustmentService(req.params.adjustment_Id, req.user._id);
    if (inventoryAdjustment) {
      const transformedAdjustment = transformInventoryAdjustment(inventoryAdjustment);
      sendResponse(
        res,
        200,
        "Inventory adjustment completed successfully",
        transformedAdjustment
      );
    } else {
      return next(DatabaseError.notFound("Inventory adjustment"));
    }
  } catch (error) {
    logger.error(`Error completing inventory adjustment with ID: ${req.params.adjustment_Id}`, error);
    next(error);
  }
});

/**
 * @desc    Delete inventory adjustment by ID
 * @route   DELETE /inventory-adjustments/:adjustment_Id
 * @access  Private
 */
const deleteInventoryAdjustmentById = asyncHandler(async (req, res, next) => {
  logger.info(`deleteInventoryAdjustmentById called with ID: ${req.params.adjustment_Id}`);
  try {
    const result = await deleteInventoryAdjustmentService(req.params.adjustment_Id);
    if (result.deletedCount > 0) {
      sendResponse(res, 200, "Inventory adjustment deleted successfully");
    } else {
      return next(DatabaseError.notFound("Inventory adjustment"));
    }
  } catch (error) {
    logger.error(`Error deleting inventory adjustment with ID: ${req.params.adjustment_Id}`, error);
    next(error);
  }
});

/**
 * @desc    Delete all inventory adjustments
 * @route   DELETE /inventory-adjustments
 * @access  Private
 */
const deleteAllInventoryAdjustments = asyncHandler(async (req, res, next) => {
  logger.info("deleteAllInventoryAdjustments called");
  try {
    const result = await deleteAllInventoryAdjustmentsService();
    sendResponse(
      res,
      200,
      `${result.deletedCount} inventory adjustments deleted successfully`
    );
  } catch (error) {
    logger.error("Error deleting all inventory adjustments:", error);
    next(error);
  }
});

module.exports = {
  getAllInventoryAdjustments,
  getInventoryAdjustmentById,
  getInventoryAdjustmentByAdjustmentID,
  getInventoryAdjustmentsByWarehouse,
  getInventoryAdjustmentsByReason,
  getInventoryAdjustmentsByStatus,
  createInventoryAdjustment,
  updateInventoryAdjustmentById,
  approveInventoryAdjustment,
  completeInventoryAdjustment,
  deleteInventoryAdjustmentById,
  deleteAllInventoryAdjustments
};
