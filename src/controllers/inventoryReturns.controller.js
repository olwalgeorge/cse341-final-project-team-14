const sendResponse = require("../utils/response.js");
const asyncHandler = require("express-async-handler");
const logger = require("../utils/logger.js");
const mongoose = require("mongoose");
const { ValidationError, DatabaseError } = require("../utils/errors");
const {
  getAllReturnsService,
  getReturnByIdService,
  getReturnByReturnIDService,
  getReturnsBySupplierService,
  getReturnsByWarehouseService,
  getReturnsByDateRangeService,
  getReturnsByStatusService,
  createReturnService,
  updateReturnService,
  approveReturnService,
  completeReturnService,
  deleteReturnService,
  deleteAllReturnsService,
} = require("../services/inventoryReturns.service");
const { transformReturn } = require("../utils/inventoryReturn.utils");

/**
 * @desc    Get all inventory returns
 * @route   GET /inventory-returns
 * @access  Private
 */
const getAllReturns = asyncHandler(async (req, res, next) => {
  logger.info("getAllReturns called");
  logger.debug("Query parameters:", req.query);
  
  try {
    const result = await getAllReturnsService(req.query);
    
    if (!result.returns.length) {
      return sendResponse(res, 200, "No inventory returns found", {
        returns: [],
        pagination: result.pagination
      });
    }
    
    const transformedReturns = result.returns.map(transformReturn);
    sendResponse(
      res,
      200,
      "Inventory returns retrieved successfully",
      { returns: transformedReturns, pagination: result.pagination }
    );
  } catch (error) {
    logger.error("Error retrieving inventory returns:", error);
    next(error);
  }
});

/**
 * @desc    Get inventory return by ID
 * @route   GET /inventory-returns/:return_Id
 * @access  Private
 */
const getReturnById = asyncHandler(async (req, res, next) => {
  const id = req.params.return_Id;
  logger.info(`getReturnById called with ID: ${id}`);
  
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ValidationError('id', id, 'Invalid return ID format'));
    }
    
    const inventoryReturn = await getReturnByIdService(id);
    
    if (!inventoryReturn) {
      return next(new DatabaseError('notFound', 'Inventory Return', id));
    }
    
    const transformedReturn = transformReturn(inventoryReturn);
    sendResponse(
      res,
      200,
      "Inventory return retrieved successfully",
      transformedReturn
    );
  } catch (error) {
    logger.error(`Error retrieving inventory return with ID: ${id}`, error);
    next(error);
  }
});

/**
 * @desc    Get inventory return by return ID
 * @route   GET /inventory-returns/returnID/:returnID
 * @access  Private
 */
const getReturnByReturnID = asyncHandler(async (req, res, next) => {
  const returnID = req.params.returnID;
  logger.info(`getReturnByReturnID called with return ID: ${returnID}`);
  
  try {
    // Validate return ID format
    if (!returnID.match(/^RET-\d{5}$/)) {
      return next(new ValidationError(
        'returnID', 
        returnID, 
        'Return ID must be in the format RET-XXXXX where X is a digit'
      ));
    }
    
    const inventoryReturn = await getReturnByReturnIDService(returnID);
    
    if (!inventoryReturn) {
      return next(new DatabaseError('notFound', 'Inventory Return', null, { returnID }));
    }
    
    const transformedReturn = transformReturn(inventoryReturn);
    sendResponse(
      res,
      200,
      "Inventory return retrieved successfully",
      transformedReturn
    );
  } catch (error) {
    logger.error(`Error retrieving inventory return with return ID: ${returnID}`, error);
    next(error);
  }
});

/**
 * @desc    Get returns by supplier
 * @route   GET /inventory-returns/supplier/:supplierId
 * @access  Private
 */
const getReturnsBySupplier = asyncHandler(async (req, res, next) => {
  const supplierId = req.params.supplierId;
  logger.info(`getReturnsBySupplier called with supplier ID: ${supplierId}`);
  
  try {
    if (!mongoose.Types.ObjectId.isValid(supplierId)) {
      return next(new ValidationError('supplierId', supplierId, 'Invalid supplier ID format'));
    }
    
    const result = await getReturnsBySupplierService(supplierId, req.query);
    
    if (!result.returns.length) {
      return sendResponse(res, 200, `No returns found for supplier ID: ${supplierId}`, {
        returns: [],
        pagination: result.pagination
      });
    }
    
    const transformedReturns = result.returns.map(transformReturn);
    sendResponse(
      res,
      200,
      `Returns for supplier ID "${supplierId}" retrieved successfully`,
      { returns: transformedReturns, pagination: result.pagination }
    );
  } catch (error) {
    logger.error(`Error retrieving returns for supplier ${supplierId}:`, error);
    next(error);
  }
});

/**
 * @desc    Get returns by warehouse
 * @route   GET /inventory-returns/warehouse/:warehouseId
 * @access  Private
 */
const getReturnsByWarehouse = asyncHandler(async (req, res, next) => {
  const warehouseId = req.params.warehouseId;
  logger.info(`getReturnsByWarehouse called with warehouse ID: ${warehouseId}`);
  
  try {
    if (!mongoose.Types.ObjectId.isValid(warehouseId)) {
      return next(new ValidationError('warehouseId', warehouseId, 'Invalid warehouse ID format'));
    }
    
    const result = await getReturnsByWarehouseService(warehouseId, req.query);
    
    if (!result.returns.length) {
      return sendResponse(res, 200, `No returns found for warehouse ID: ${warehouseId}`, {
        returns: [],
        pagination: result.pagination
      });
    }
    
    const transformedReturns = result.returns.map(transformReturn);
    sendResponse(
      res,
      200,
      `Returns for warehouse ID "${warehouseId}" retrieved successfully`,
      { returns: transformedReturns, pagination: result.pagination }
    );
  } catch (error) {
    logger.error(`Error retrieving returns for warehouse ${warehouseId}:`, error);
    next(error);
  }
});

/**
 * @desc    Get returns by date range
 * @route   GET /inventory-returns/date-range
 * @access  Private
 */
const getReturnsByDateRange = asyncHandler(async (req, res, next) => {
  const { fromDate, toDate } = req.query;
  logger.info(`getReturnsByDateRange called with dates: ${fromDate} to ${toDate}`);
  
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
    
    const result = await getReturnsByDateRangeService(start, end, req.query);
    
    if (!result.returns.length) {
      return sendResponse(res, 200, `No returns found between ${fromDate} and ${toDate}`, {
        returns: [],
        pagination: result.pagination
      });
    }
    
    const transformedReturns = result.returns.map(transformReturn);
    sendResponse(
      res,
      200,
      `Returns from ${fromDate} to ${toDate} retrieved successfully`,
      { returns: transformedReturns, pagination: result.pagination }
    );
  } catch (error) {
    logger.error(`Error retrieving returns by date range:`, error);
    next(error);
  }
});

/**
 * @desc    Get returns by status
 * @route   GET /inventory-returns/status/:status
 * @access  Private
 */
const getReturnsByStatus = asyncHandler(async (req, res, next) => {
  const status = req.params.status;
  logger.info(`getReturnsByStatus called with status: ${status}`);
  
  try {
    // Validate status
    const validStatuses = ['Draft', 'Pending', 'Pending Approval', 'Approved', 'In Progress', 'Completed', 'Rejected', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return next(new ValidationError('status', status, `Status must be one of: ${validStatuses.join(', ')}`));
    }
    
    const result = await getReturnsByStatusService(status, req.query);
    
    if (!result.returns.length) {
      return sendResponse(res, 200, `No returns found with status: ${status}`, {
        returns: [],
        pagination: result.pagination
      });
    }
    
    const transformedReturns = result.returns.map(transformReturn);
    sendResponse(
      res,
      200,
      `Returns with status "${status}" retrieved successfully`,
      { returns: transformedReturns, pagination: result.pagination }
    );
  } catch (error) {
    logger.error(`Error retrieving returns with status ${status}:`, error);
    next(error);
  }
});

/**
 * @desc    Create a new inventory return
 * @route   POST /inventory-returns
 * @access  Private
 */
const createReturn = asyncHandler(async (req, res, next) => {
  logger.info("createReturn called");
  logger.debug("Return data:", req.body);
  
  try {
    // Additional validations can be done here if needed
    
    // Set creator if available
    const returnData = { ...req.body };
    if (req.user) {
      returnData.createdBy = req.user._id;
    }
    
    const inventoryReturn = await createReturnService(returnData);
    const transformedReturn = transformReturn(inventoryReturn);
    
    sendResponse(res, 201, "Inventory return created successfully", transformedReturn);
  } catch (error) {
    logger.error("Error creating inventory return:", error);
    
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
        'Inventory Return',
        null,
        { field, value }
      ));
    }
    
    next(error);
  }
});

/**
 * @desc    Update inventory return
 * @route   PUT /inventory-returns/:return_Id
 * @access  Private
 */
const updateReturn = asyncHandler(async (req, res, next) => {
  const id = req.params.return_Id;
  logger.info(`updateReturn called with ID: ${id}`);
  logger.debug("Update data:", req.body);
  
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ValidationError('id', id, 'Invalid return ID format'));
    }
    
    // Get current return to check status
    const currentReturn = await getReturnByIdService(id);
    if (!currentReturn) {
      return next(new DatabaseError('notFound', 'Inventory Return', id));
    }
    
    // Prevent updates to completed returns
    if (currentReturn.status === 'Completed') {
      return next(new ValidationError(
        'status',
        'Completed',
        'Completed returns cannot be modified'
      ));
    }
    
    const inventoryReturn = await updateReturnService(id, req.body);
    const transformedReturn = transformReturn(inventoryReturn);
    
    sendResponse(
      res,
      200,
      "Inventory return updated successfully",
      transformedReturn
    );
  } catch (error) {
    logger.error(`Error updating inventory return with ID: ${id}`, error);
    
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
    
    next(error);
  }
});

/**
 * @desc    Approve inventory return
 * @route   PUT /inventory-returns/:return_Id/approve
 * @access  Private
 */
const approveReturn = asyncHandler(async (req, res, next) => {
  const id = req.params.return_Id;
  logger.info(`approveReturn called with ID: ${id}`);
  
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ValidationError('id', id, 'Invalid return ID format'));
    }
    
    // Get current return to check status
    const currentReturn = await getReturnByIdService(id);
    if (!currentReturn) {
      return next(new DatabaseError('notFound', 'Inventory Return', id));
    }
    
    // Check if return can be approved (must be in Pending Approval status)
    if (currentReturn.status !== 'Pending Approval') {
      return next(new ValidationError(
        'status', 
        currentReturn.status, 
        `Only returns with 'Pending Approval' status can be approved. Current status: ${currentReturn.status}`
      ));
    }
    
    // Prepare approval data
    const approvalData = {
      approvedBy: req.user ? req.user._id : null,
      approvalNotes: req.body.approvalNotes || '',
    };
    
    const inventoryReturn = await approveReturnService(id, approvalData);
    const transformedReturn = transformReturn(inventoryReturn);
    
    sendResponse(
      res,
      200,
      "Inventory return approved successfully",
      transformedReturn
    );
  } catch (error) {
    logger.error(`Error approving inventory return with ID: ${id}`, error);
    next(error);
  }
});

/**
 * @desc    Complete inventory return
 * @route   PUT /inventory-returns/:return_Id/complete
 * @access  Private
 */
const completeReturn = asyncHandler(async (req, res, next) => {
  const id = req.params.return_Id;
  logger.info(`completeReturn called with ID: ${id}`);
  
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ValidationError('id', id, 'Invalid return ID format'));
    }
    
    // Get current return to check status
    const currentReturn = await getReturnByIdService(id);
    if (!currentReturn) {
      return next(new DatabaseError('notFound', 'Inventory Return', id));
    }
    
    // Check if return can be completed (must be in Approved status)
    if (currentReturn.status !== 'Approved') {
      return next(new ValidationError(
        'status', 
        currentReturn.status, 
        `Only returns with 'Approved' status can be completed. Current status: ${currentReturn.status}`
      ));
    }
    
    // Prepare completion data
    const completionData = {
      completedBy: req.user ? req.user._id : null,
      completionNotes: req.body.completionNotes || '',
    };
    
    const inventoryReturn = await completeReturnService(id, completionData);
    const transformedReturn = transformReturn(inventoryReturn);
    
    sendResponse(
      res,
      200,
      "Inventory return completed successfully",
      transformedReturn
    );
  } catch (error) {
    logger.error(`Error completing inventory return with ID: ${id}`, error);
    next(error);
  }
});

/**
 * @desc    Delete inventory return
 * @route   DELETE /inventory-returns/:return_Id
 * @access  Private
 */
const deleteReturn = asyncHandler(async (req, res, next) => {
  const id = req.params.return_Id;
  logger.info(`deleteReturn called with ID: ${id}`);
  
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ValidationError('id', id, 'Invalid return ID format'));
    }
    
    // Get current return to check status
    const currentReturn = await getReturnByIdService(id);
    if (!currentReturn) {
      return next(new DatabaseError('notFound', 'Inventory Return', id));
    }
    
    // Prevent deletion of completed returns
    if (currentReturn.status === 'Completed') {
      return next(new ValidationError(
        'status',
        'Completed',
        'Completed returns cannot be deleted for audit purposes'
      ));
    }
    
    const result = await deleteReturnService(id);
    
    sendResponse(res, 200, "Inventory return deleted successfully");
  } catch (error) {
    logger.error(`Error deleting inventory return with ID: ${id}`, error);
    next(error);
  }
});

/**
 * @desc    Delete all inventory returns
 * @route   DELETE /inventory-returns
 * @access  Private
 */
const deleteAllReturns = asyncHandler(async (req, res, next) => {
  logger.info("deleteAllReturns called");
  
  try {
    // Only allow in development/test environments for safety
    const env = process.env.NODE_ENV || 'development';
    if (env === 'production') {
      return next(new ValidationError(
        'environment',
        env,
        'Mass deletion of inventory returns is not allowed in production environment'
      ));
    }
    
    const result = await deleteAllReturnsService();
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
  getAllReturns,
  getReturnById,
  getReturnByReturnID,
  getReturnsBySupplier,
  getReturnsByWarehouse,
  getReturnsByDateRange,
  getReturnsByStatus,
  createReturn,
  updateReturn,
  approveReturn,
  completeReturn,
  deleteReturn,
  deleteAllReturns,
};
