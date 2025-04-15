const sendResponse = require("../utils/response.js");
const asyncHandler = require("express-async-handler");
const { createLogger } = require("../utils/logger.js");
const mongoose = require("mongoose");
const { ValidationError, DatabaseError } = require("../utils/errors");
const {
  getAllAdjustmentsService,
  getAdjustmentByIdService,
  getAdjustmentByAdjustmentIDService,
  getAdjustmentsByWarehouseService,
  getAdjustmentsByReasonService,
  getAdjustmentsByStatusService,
  getAdjustmentsByDateRangeService,
  getAdjustmentsByProductService,
  createAdjustmentService,
  updateAdjustmentService,
  approveAdjustmentService,
  completeAdjustmentService,
  deleteAdjustmentService,
  deleteAllAdjustmentsService,
} = require("../services/inventoryAdjustments.service");
const { transformInventoryAdjustment } = require("../utils/inventoryAdjustment.utils");
const logger = createLogger("InventoryAdjustmentsController");

/**
 * @desc    Get all inventory adjustments
 * @route   GET /inventory-adjustments
 * @access  Private
 */
const getAllAdjustments = asyncHandler(async (req, res, next) => {
  logger.info("getAllAdjustments called");
  logger.debug("Query parameters:", req.query);
  
  try {
    const result = await getAllAdjustmentsService(req.query);
    
    if (!result.adjustments.length) {
      return sendResponse(res, 200, "No inventory adjustments found", {
        adjustments: [],
        pagination: result.pagination
      });
    }
    
    const transformedAdjustments = result.adjustments.map(transformInventoryAdjustment);
    sendResponse(
      res,
      200,
      "Inventory adjustments retrieved successfully",
      { adjustments: transformedAdjustments, pagination: result.pagination }
    );
  } catch (error) {
    logger.error("Error retrieving inventory adjustments:", error);
    next(error);
  }
});

/**
 * @desc    Get inventory adjustment by MongoDB ID
 * @route   GET /inventory-adjustments/:adjustment_Id
 * @access  Private
 */
const getAdjustmentById = asyncHandler(async (req, res, next) => {
  const id = req.params.adjustment_Id;
  logger.info(`getAdjustmentById called with ID: ${id}`);
  
  try {
    const adjustment = await getAdjustmentByIdService(id);
    
    if (!adjustment) {
      return next(new DatabaseError('notFound', 'Inventory Adjustment', id));
    }
    
    const transformedAdjustment = transformInventoryAdjustment(adjustment);
    sendResponse(
      res,
      200,
      "Inventory adjustment retrieved successfully",
      transformedAdjustment
    );
  } catch (error) {
    logger.error(`Error retrieving inventory adjustment with ID: ${id}`, error);
    
    // Handle CastError for invalid ObjectId
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return next(new ValidationError('id', id, 'Invalid inventory adjustment ID format'));
    }
    
    next(error);
  }
});

/**
 * @desc    Get inventory adjustment by adjustment ID (ADJ-XXXXX format)
 * @route   GET /inventory-adjustments/adjustmentID/:adjustmentID
 * @access  Private
 */
const getAdjustmentByAdjustmentID = asyncHandler(async (req, res, next) => {
  const adjustmentID = req.params.adjustmentID;
  logger.info(`getAdjustmentByAdjustmentID called with adjustment ID: ${adjustmentID}`);
  
  try {
    // Validate adjustment ID format
    if (!adjustmentID.match(/^ADJ-\d{5}$/)) {
      return next(new ValidationError(
        'adjustmentID', 
        adjustmentID, 
        'Adjustment ID must be in the format ADJ-XXXXX where X is a digit'
      ));
    }
    
    const adjustment = await getAdjustmentByAdjustmentIDService(adjustmentID);
    
    if (!adjustment) {
      return next(new DatabaseError('notFound', 'Inventory Adjustment', null, { adjustmentID }));
    }
    
    const transformedAdjustment = transformInventoryAdjustment(adjustment);
    sendResponse(
      res,
      200,
      "Inventory adjustment retrieved successfully",
      transformedAdjustment
    );
  } catch (error) {
    logger.error(`Error retrieving inventory adjustment with adjustment ID: ${adjustmentID}`, error);
    next(error);
  }
});

/**
 * @desc    Get adjustments by warehouse
 * @route   GET /inventory-adjustments/warehouse/:warehouseId
 * @access  Private
 */
const getAdjustmentsByWarehouse = asyncHandler(async (req, res, next) => {
  const warehouseId = req.params.warehouseId;
  logger.info(`getAdjustmentsByWarehouse called with warehouse ID: ${warehouseId}`);
  logger.debug("Query parameters:", req.query);
  
  try {
    // Validate warehouseId format
    if (!mongoose.Types.ObjectId.isValid(warehouseId)) {
      return next(new ValidationError('warehouseId', warehouseId, 'Invalid warehouse ID format'));
    }
    
    const result = await getAdjustmentsByWarehouseService(warehouseId, req.query);
    
    if (!result.adjustments.length) {
      return sendResponse(res, 200, `No inventory adjustments found for warehouse ID: ${warehouseId}`, {
        adjustments: [],
        pagination: result.pagination
      });
    }
    
    const transformedAdjustments = result.adjustments.map(transformInventoryAdjustment);
    sendResponse(
      res,
      200,
      `Inventory adjustments for warehouse ID "${warehouseId}" retrieved successfully`,
      { adjustments: transformedAdjustments, pagination: result.pagination }
    );
  } catch (error) {
    logger.error(`Error retrieving inventory adjustments for warehouse ${warehouseId}:`, error);
    next(error);
  }
});

/**
 * @desc    Get adjustments by reason
 * @route   GET /inventory-adjustments/reason/:reason
 * @access  Private
 */
const getAdjustmentsByReason = asyncHandler(async (req, res, next) => {
  const reason = req.params.reason;
  logger.info(`getAdjustmentsByReason called with reason: ${reason}`);
  logger.debug("Query parameters:", req.query);
  
  try {
    // Validate reason
    const validReasons = ['Physical Count', 'Damaged Goods', 'Expired', 'Quality Control', 'System Correction', 'Other'];
    if (!validReasons.includes(reason)) {
      return next(new ValidationError(
        'reason',
        reason,
        `Reason must be one of: ${validReasons.join(', ')}`
      ));
    }
    
    const result = await getAdjustmentsByReasonService(reason, req.query);
    
    if (!result.adjustments.length) {
      return sendResponse(res, 200, `No inventory adjustments found with reason: ${reason}`, {
        adjustments: [],
        pagination: result.pagination
      });
    }
    
    const transformedAdjustments = result.adjustments.map(transformInventoryAdjustment);
    sendResponse(
      res,
      200,
      `Inventory adjustments with reason "${reason}" retrieved successfully`,
      { adjustments: transformedAdjustments, pagination: result.pagination }
    );
  } catch (error) {
    logger.error(`Error retrieving inventory adjustments for reason ${reason}:`, error);
    next(error);
  }
});

/**
 * @desc    Get adjustments by status
 * @route   GET /inventory-adjustments/status/:status
 * @access  Private
 */
const getAdjustmentsByStatus = asyncHandler(async (req, res, next) => {
  const status = req.params.status;
  logger.info(`getAdjustmentsByStatus called with status: ${status}`);
  logger.debug("Query parameters:", req.query);
  
  try {
    // Validate status
    const validStatuses = ['Draft', 'Pending Approval', 'Approved', 'Completed', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return next(new ValidationError('status', status, `Status must be one of: ${validStatuses.join(', ')}`));
    }
    
    const result = await getAdjustmentsByStatusService(status, req.query);
    
    if (!result.adjustments.length) {
      return sendResponse(res, 200, `No inventory adjustments found with status: ${status}`, {
        adjustments: [],
        pagination: result.pagination
      });
    }
    
    const transformedAdjustments = result.adjustments.map(transformInventoryAdjustment);
    sendResponse(
      res,
      200,
      `Inventory adjustments with status "${status}" retrieved successfully`,
      { adjustments: transformedAdjustments, pagination: result.pagination }
    );
  } catch (error) {
    logger.error(`Error retrieving inventory adjustments with status ${status}:`, error);
    next(error);
  }
});

/**
 * @desc    Get adjustments by date range
 * @route   GET /inventory-adjustments/date-range
 * @access  Private
 */
const getAdjustmentsByDateRange = asyncHandler(async (req, res, next) => {
  const { fromDate, toDate } = req.query;
  logger.info(`getAdjustmentsByDateRange called with dates: ${fromDate} to ${toDate}`);
  
  try {
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!fromDate || !dateRegex.test(fromDate)) {
      return next(new ValidationError('fromDate', fromDate, 'From date must be in YYYY-MM-DD format'));
    }
    if (!toDate || !dateRegex.test(toDate)) {
      return next(new ValidationError('toDate', toDate, 'To date must be in YYYY-MM-DD format'));
    }
    
    // Validate date range
    const start = new Date(fromDate);
    const end = new Date(toDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return next(new ValidationError('date', `${fromDate} - ${toDate}`, 'Invalid date format'));
    }
    if (start > end) {
      return next(new ValidationError('dateRange', `${fromDate} - ${toDate}`, 'From date must be before or equal to to date'));
    }
    
    const result = await getAdjustmentsByDateRangeService(start, end, req.query);
    
    if (!result.adjustments.length) {
      return sendResponse(res, 200, `No inventory adjustments found between ${fromDate} and ${toDate}`, {
        adjustments: [],
        pagination: result.pagination
      });
    }
    
    const transformedAdjustments = result.adjustments.map(transformInventoryAdjustment);
    sendResponse(
      res,
      200,
      `Inventory adjustments from ${fromDate} to ${toDate} retrieved successfully`,
      { adjustments: transformedAdjustments, pagination: result.pagination }
    );
  } catch (error) {
    logger.error(`Error retrieving inventory adjustments by date range:`, error);
    next(error);
  }
});

/**
 * @desc    Get adjustments by product
 * @route   GET /inventory-adjustments/product/:productId
 * @access  Private
 */
const getAdjustmentsByProduct = asyncHandler(async (req, res, next) => {
  const productId = req.params.productId;
  logger.info(`getAdjustmentsByProduct called with product ID: ${productId}`);
  logger.debug("Query parameters:", req.query);
  
  try {
    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return next(new ValidationError('productId', productId, 'Invalid product ID format'));
    }
    
    const result = await getAdjustmentsByProductService(productId, req.query);
    
    if (!result.adjustments.length) {
      return sendResponse(res, 200, `No inventory adjustments found for product ID: ${productId}`, {
        adjustments: [],
        pagination: result.pagination
      });
    }
    
    const transformedAdjustments = result.adjustments.map(transformInventoryAdjustment);
    sendResponse(
      res,
      200,
      `Inventory adjustments for product ID "${productId}" retrieved successfully`,
      { adjustments: transformedAdjustments, pagination: result.pagination }
    );
  } catch (error) {
    logger.error(`Error retrieving inventory adjustments for product ${productId}:`, error);
    next(error);
  }
});

/**
 * @desc    Create a new inventory adjustment
 * @route   POST /inventory-adjustments
 * @access  Private
 */
const createAdjustment = asyncHandler(async (req, res, next) => {
  logger.info("createAdjustment called");
  logger.debug("Adjustment data:", req.body);
  
  try {
    // Ensure adjustmentID is not provided to force auto-generation
    const adjustmentData = { ...req.body };
    delete adjustmentData.adjustmentID;
    
    // Set creator if not provided
    if (!adjustmentData.createdBy && req.user) {
      adjustmentData.createdBy = req.user._id;
    }
    
    // Set default status if not provided
    if (!adjustmentData.status) {
      adjustmentData.status = 'Draft';
    }
    
    // Validate required data
    if (!adjustmentData.warehouse) {
      return next(new ValidationError('warehouse', null, 'Warehouse is required'));
    }
    
    if (!adjustmentData.reason) {
      return next(new ValidationError('reason', null, 'Reason for adjustment is required'));
    }
    
    if (!adjustmentData.items || !Array.isArray(adjustmentData.items) || adjustmentData.items.length === 0) {
      return next(new ValidationError('items', adjustmentData.items, 'At least one item is required'));
    }
    
    // Validate each item has required fields
    for (let i = 0; i < adjustmentData.items.length; i++) {
      const item = adjustmentData.items[i];
      if (!item.product) {
        return next(new ValidationError(`items[${i}].product`, null, 'Product is required for each item'));
      }
      if (item.quantityBefore === undefined) {
        return next(new ValidationError(`items[${i}].quantityBefore`, null, 'Quantity before is required for each item'));
      }
      if (item.quantityAfter === undefined) {
        return next(new ValidationError(`items[${i}].quantityAfter`, null, 'Quantity after is required for each item'));
      }
    }
    
    const adjustment = await createAdjustmentService(adjustmentData);
    const transformedAdjustment = transformInventoryAdjustment(adjustment);
    
    sendResponse(res, 201, "Inventory adjustment created successfully", transformedAdjustment);
  } catch (error) {
    logger.error("Error creating inventory adjustment:", error);
    
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
        'Inventory Adjustment',
        null,
        { field, value }
      ));
    }
    
    next(error);
  }
});

/**
 * @desc    Update inventory adjustment
 * @route   PUT /inventory-adjustments/:adjustment_Id
 * @access  Private
 */
const updateAdjustment = asyncHandler(async (req, res, next) => {
  const id = req.params.adjustment_Id;
  logger.info(`updateAdjustment called with ID: ${id}`);
  logger.debug("Update data:", req.body);
  
  try {
    // Get current adjustment to check status
    const currentAdjustment = await getAdjustmentByIdService(id);
    if (!currentAdjustment) {
      return next(new DatabaseError('notFound', 'Inventory Adjustment', id));
    }
    
    // Prevent updates to completed or rejected adjustments
    if (['Completed', 'Rejected'].includes(currentAdjustment.status)) {
      return next(new ValidationError(
        'status',
        currentAdjustment.status,
        `Adjustments with status '${currentAdjustment.status}' cannot be modified`
      ));
    }
    
    // Prevent updating the adjustmentID
    const updateData = { ...req.body };
    delete updateData.adjustmentID;
    delete updateData.createdBy;
    delete updateData.createdAt;
    
    // Prevent direct status changes to Completed through regular update
    if (updateData.status === 'Completed' && currentAdjustment.status !== 'Completed') {
      return next(new ValidationError('status', 'Completed', 'Use the complete endpoint to mark adjustments as completed'));
    }
    
    // Prevent direct status changes to Approved through regular update
    if (updateData.status === 'Approved' && currentAdjustment.status !== 'Approved') {
      return next(new ValidationError('status', 'Approved', 'Use the approve endpoint to mark adjustments as approved'));
    }
    
    // Validate status transitions
    if (updateData.status) {
      const validTransitions = {
        'Draft': ['Pending Approval', 'Rejected'],
        'Pending Approval': ['Draft', 'Rejected']
      };
      
      const currentStatus = currentAdjustment.status;
      const newStatus = updateData.status;
      
      if (!validTransitions[currentStatus] || !validTransitions[currentStatus].includes(newStatus)) {
        return next(new ValidationError(
          'status',
          newStatus,
          `Invalid status transition from '${currentStatus}' to '${newStatus}'`
        ));
      }
    }
    
    const adjustment = await updateAdjustmentService(id, updateData);
    const transformedAdjustment = transformInventoryAdjustment(adjustment);
    
    sendResponse(
      res,
      200,
      "Inventory adjustment updated successfully",
      transformedAdjustment
    );
  } catch (error) {
    logger.error(`Error updating inventory adjustment with ID: ${id}`, error);
    
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
      return next(new ValidationError('id', id, 'Invalid inventory adjustment ID format'));
    }
    
    next(error);
  }
});

/**
 * @desc    Approve an inventory adjustment
 * @route   PUT /inventory-adjustments/:adjustment_Id/approve
 * @access  Private
 */
const approveAdjustment = asyncHandler(async (req, res, next) => {
  const id = req.params.adjustment_Id;
  logger.info(`approveAdjustment called with ID: ${id}`);
  logger.debug("Approval data:", req.body);
  
  try {
    // Get current adjustment to check status
    const currentAdjustment = await getAdjustmentByIdService(id);
    if (!currentAdjustment) {
      return next(new DatabaseError('notFound', 'Inventory Adjustment', id));
    }
    
    // Check if adjustment can be approved (must be in Pending Approval status)
    if (currentAdjustment.status !== 'Pending Approval') {
      return next(new ValidationError(
        'status', 
        currentAdjustment.status, 
        `Only adjustments with 'Pending Approval' status can be approved. Current status: ${currentAdjustment.status}`
      ));
    }
    
    // Set approver if not provided
    const approvalData = { ...req.body };
    if (!approvalData.approvedBy && req.user) {
      approvalData.approvedBy = req.user._id;
    }
    
    const adjustment = await approveAdjustmentService(id, approvalData);
    const transformedAdjustment = transformInventoryAdjustment(adjustment);
    
    sendResponse(
      res,
      200,
      "Inventory adjustment approved successfully",
      transformedAdjustment
    );
  } catch (error) {
    logger.error(`Error approving inventory adjustment with ID: ${id}`, error);
    
    // Handle CastError for invalid ObjectId
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return next(new ValidationError('id', id, 'Invalid inventory adjustment ID format'));
    }
    
    next(error);
  }
});

/**
 * @desc    Complete an inventory adjustment
 * @route   PUT /inventory-adjustments/:adjustment_Id/complete
 * @access  Private
 */
const completeAdjustment = asyncHandler(async (req, res, next) => {
  const id = req.params.adjustment_Id;
  logger.info(`completeAdjustment called with ID: ${id}`);
  
  try {
    // Get current adjustment to check status
    const currentAdjustment = await getAdjustmentByIdService(id);
    if (!currentAdjustment) {
      return next(new DatabaseError('notFound', 'Inventory Adjustment', id));
    }
    
    // Check if adjustment can be completed (must be in Approved status)
    if (currentAdjustment.status !== 'Approved') {
      return next(new ValidationError(
        'status', 
        currentAdjustment.status, 
        `Only adjustments with 'Approved' status can be completed. Current status: ${currentAdjustment.status}`
      ));
    }
    
    // Set completer if not provided
    const completionData = { ...req.body };
    if (!completionData.completedBy && req.user) {
      completionData.completedBy = req.user._id;
    }
    
    const adjustment = await completeAdjustmentService(id, completionData);
    const transformedAdjustment = transformInventoryAdjustment(adjustment);
    
    sendResponse(
      res,
      200,
      "Inventory adjustment completed successfully",
      transformedAdjustment
    );
  } catch (error) {
    logger.error(`Error completing inventory adjustment with ID: ${id}`, error);
    
    // Handle CastError for invalid ObjectId
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return next(new ValidationError('id', id, 'Invalid inventory adjustment ID format'));
    }
    
    next(error);
  }
});

/**
 * @desc    Delete inventory adjustment
 * @route   DELETE /inventory-adjustments/:adjustment_Id
 * @access  Private
 */
const deleteAdjustment = asyncHandler(async (req, res, next) => {
  const id = req.params.adjustment_Id;
  logger.info(`deleteAdjustment called with ID: ${id}`);
  
  try {
    // Get current adjustment to check status
    const currentAdjustment = await getAdjustmentByIdService(id);
    if (!currentAdjustment) {
      return next(new DatabaseError('notFound', 'Inventory Adjustment', id));
    }
    
    // Prevent deletion of completed adjustments
    if (['Completed', 'Approved'].includes(currentAdjustment.status)) {
      return next(new ValidationError(
        'status',
        currentAdjustment.status,
        `Adjustments with status '${currentAdjustment.status}' cannot be deleted for audit purposes`
      ));
    }
    
    const result = await deleteAdjustmentService(id);
    
    sendResponse(res, 200, "Inventory adjustment deleted successfully");
  } catch (error) {
    logger.error(`Error deleting inventory adjustment with ID: ${id}`, error);
    
    // Handle CastError for invalid ObjectId
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return next(new ValidationError('id', id, 'Invalid inventory adjustment ID format'));
    }
    
    next(error);
  }
});

/**
 * @desc    Delete all inventory adjustments
 * @route   DELETE /inventory-adjustments
 * @access  Private
 */
const deleteAllAdjustments = asyncHandler(async (req, res, next) => {
  logger.info("deleteAllAdjustments called");
  
  try {
    const result = await deleteAllAdjustmentsService();
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
  getAllAdjustments,
  getAdjustmentById,
  getAdjustmentByAdjustmentID,
  getAdjustmentsByWarehouse,
  getAdjustmentsByReason,
  getAdjustmentsByStatus,
  getAdjustmentsByDateRange,
  getAdjustmentsByProduct,
  createAdjustment,
  updateAdjustment,
  approveAdjustment,
  completeAdjustment,
  deleteAdjustment,
  deleteAllAdjustments,
};
