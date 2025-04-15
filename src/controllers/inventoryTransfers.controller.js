const sendResponse = require("../utils/response.js");
const asyncHandler = require("express-async-handler");
const { createLogger } = require("../utils/logger.js");
const { ValidationError, DatabaseError } = require("../utils/errors");
const {
  getAllInventoryTransfersService,
  getInventoryTransferByIdService,
  getInventoryTransferByTransferIDService,
  getInventoryTransfersByFromWarehouseService,
  getInventoryTransfersByToWarehouseService,
  getInventoryTransfersByStatusService,
  createInventoryTransferService,
  updateInventoryTransferService,
  approveInventoryTransferService,
  shipInventoryTransferService,
  receiveInventoryTransferService,
  deleteInventoryTransferService,
  deleteAllInventoryTransfersService
} = require("../services/inventoryTransfers.service");
const { transformInventoryTransfer, generateTransferId } = require("../utils/inventoryTransfer.utils");
const logger = createLogger("inventorTransfersController");
/**
 * @desc    Get all inventory transfers
 * @route   GET /inventory-transfers
 * @access  Private
 */
const getAllInventoryTransfers = asyncHandler(async (req, res, next) => {
  logger.info("getAllInventoryTransfers called");
  logger.debug("Query parameters:", req.query);
  
  try {
    const result = await getAllInventoryTransfersService(req.query);
    const transformedTransfers = result.transfers.map(transformInventoryTransfer);
    
    sendResponse(
      res,
      200,
      "Inventory transfers retrieved successfully",
      {
        transfers: transformedTransfers,
        pagination: result.pagination
      }
    );
  } catch (error) {
    logger.error("Error retrieving all inventory transfers:", error);
    next(error);
  }
});

/**
 * @desc    Get inventory transfer by ID
 * @route   GET /inventory-transfers/:transfer_Id
 * @access  Private
 */
const getInventoryTransferById = asyncHandler(async (req, res, next) => {
  const id = req.params.transfer_Id;
  logger.info(`getInventoryTransferById called with ID: ${id}`);
  
  try {
    const inventoryTransfer = await getInventoryTransferByIdService(id);
    
    if (!inventoryTransfer) {
      return next(new DatabaseError('notFound', 'Inventory Transfer', id));
    }
    
    const transformedTransfer = transformInventoryTransfer(inventoryTransfer);
    sendResponse(
      res,
      200,
      "Inventory transfer retrieved successfully",
      transformedTransfer
    );
  } catch (error) {
    logger.error(`Error retrieving inventory transfer with ID: ${id}`, error);
    
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return next(new ValidationError('id', id, 'Invalid inventory transfer ID format'));
    }
    
    next(error);
  }
});

/**
 * @desc    Get inventory transfer by transfer ID (TR-XXXXX format)
 * @route   GET /inventory-transfers/transferID/:transferID
 * @access  Private
 */
const getInventoryTransferByTransferID = asyncHandler(async (req, res, next) => {
  const transferID = req.params.transferID;
  logger.info(`getInventoryTransferByTransferID called with transfer ID: ${transferID}`);
  
  try {
    if (!transferID.match(/^TR-\d{5}$/)) {
      return next(new ValidationError(
        'transferID', 
        transferID, 
        'Transfer ID must be in the format TR-XXXXX where X is a digit'
      ));
    }
    
    const inventoryTransfer = await getInventoryTransferByTransferIDService(transferID);
    
    if (!inventoryTransfer) {
      return next(new DatabaseError('notFound', 'Inventory Transfer', null, { transferID }));
    }
    
    const transformedTransfer = transformInventoryTransfer(inventoryTransfer);
    sendResponse(
      res,
      200,
      "Inventory transfer retrieved successfully",
      transformedTransfer
    );
  } catch (error) {
    logger.error(`Error retrieving inventory transfer with transfer ID: ${transferID}`, error);
    next(error);
  }
});

/**
 * @desc    Get inventory transfers by from warehouse
 * @route   GET /inventory-transfers/from-warehouse/:warehouseId
 * @access  Private
 */
const getInventoryTransfersByFromWarehouse = asyncHandler(async (req, res, next) => {
  const warehouseId = req.params.warehouseId;
  logger.info(`getInventoryTransfersByFromWarehouse called with warehouse ID: ${warehouseId}`);
  logger.debug("Query parameters:", req.query);
  
  try {
    const result = await getInventoryTransfersByFromWarehouseService(warehouseId, req.query);
    
    if (!result.transfers.length) {
      return sendResponse(res, 200, "No inventory transfers found from this warehouse", {
        transfers: [],
        pagination: result.pagination
      });
    }
    
    const transformedTransfers = result.transfers.map(transformInventoryTransfer);
    sendResponse(
      res,
      200,
      "Inventory transfers retrieved successfully",
      {
        transfers: transformedTransfers,
        pagination: result.pagination
      }
    );
  } catch (error) {
    logger.error(`Error retrieving inventory transfers from warehouse: ${warehouseId}`, error);
    next(error);
  }
});

/**
 * @desc    Get inventory transfers by to warehouse
 * @route   GET /inventory-transfers/to-warehouse/:warehouseId
 * @access  Private
 */
const getInventoryTransfersByToWarehouse = asyncHandler(async (req, res, next) => {
  const warehouseId = req.params.warehouseId;
  logger.info(`getInventoryTransfersByToWarehouse called with warehouse ID: ${warehouseId}`);
  logger.debug("Query parameters:", req.query);
  
  try {
    const result = await getInventoryTransfersByToWarehouseService(warehouseId, req.query);
    
    if (!result.transfers.length) {
      return sendResponse(res, 200, "No inventory transfers found to this warehouse", {
        transfers: [],
        pagination: result.pagination
      });
    }
    
    const transformedTransfers = result.transfers.map(transformInventoryTransfer);
    sendResponse(
      res,
      200,
      "Inventory transfers retrieved successfully",
      {
        transfers: transformedTransfers,
        pagination: result.pagination
      }
    );
  } catch (error) {
    logger.error(`Error retrieving inventory transfers to warehouse: ${warehouseId}`, error);
    next(error);
  }
});

/**
 * @desc    Get inventory transfers by status
 * @route   GET /inventory-transfers/status/:status
 * @access  Private
 */
const getInventoryTransfersByStatus = asyncHandler(async (req, res, next) => {
  const status = req.params.status;
  logger.info(`getInventoryTransfersByStatus called with status: ${status}`);
  logger.debug("Query parameters:", req.query);
  
  try {
    const validStatuses = ['Draft', 'Pending', 'Approved', 'Shipped', 'Received', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return next(new ValidationError('status', status, `Status must be one of: ${validStatuses.join(', ')}`));
    }
    
    const result = await getInventoryTransfersByStatusService(status, req.query);
    
    if (!result.transfers.length) {
      return sendResponse(res, 200, `No inventory transfers found with status: ${status}`, {
        transfers: [],
        pagination: result.pagination
      });
    }
    
    const transformedTransfers = result.transfers.map(transformInventoryTransfer);
    sendResponse(
      res,
      200,
      "Inventory transfers retrieved successfully",
      {
        transfers: transformedTransfers,
        pagination: result.pagination
      }
    );
  } catch (error) {
    logger.error(`Error retrieving inventory transfers with status: ${status}`, error);
    next(error);
  }
});

/**
 * @desc    Create a new inventory transfer
 * @route   POST /inventory-transfers
 * @access  Private
 */
const createInventoryTransfer = asyncHandler(async (req, res, next) => {
  logger.info("createInventoryTransfer called");
  logger.debug("Request body:", req.body);
  try {
    const transferData = { ...req.body };
    delete transferData.transferID;
    
    transferData.transferID = await generateTransferId();
    logger.debug(`Generated transferID: ${transferData.transferID}`);
    
    if (!transferData.requestedBy && req.user) {
      transferData.requestedBy = req.user._id;
    }
    
    if (transferData.fromWarehouse && transferData.toWarehouse && 
        transferData.fromWarehouse.toString() === transferData.toWarehouse.toString()) {
      return next(new ValidationError(
        'warehouses', 
        `${transferData.fromWarehouse} -> ${transferData.toWarehouse}`, 
        'Source and destination warehouses must be different'
      ));
    }
    
    const inventoryTransfer = await createInventoryTransferService(transferData);
    const transformedTransfer = transformInventoryTransfer(inventoryTransfer);
    sendResponse(
      res,
      201,
      "Inventory transfer created successfully",
      transformedTransfer
    );
  } catch (error) {
    logger.error("Error creating inventory transfer:", error);
    
    if (error.name === 'ValidationError') {
      const firstErrorKey = Object.keys(error.errors)[0];
      const firstError = error.errors[firstErrorKey];
      
      return next(new ValidationError(
        firstErrorKey,
        firstError.value,
        firstError.message
      ));
    }
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      
      return next(new DatabaseError(
        'duplicate',
        'Inventory Transfer',
        null,
        { field, value }
      ));
    }
    
    next(error);
  }
});

/**
 * @desc    Update inventory transfer by ID
 * @route   PUT /inventory-transfers/:transfer_Id
 * @access  Private
 */
const updateInventoryTransferById = asyncHandler(async (req, res, next) => {
  const id = req.params.transfer_Id;
  logger.info(`updateInventoryTransferById called with ID: ${id}`);
  logger.debug("Update data:", req.body);
  try {
    const updateData = { ...req.body };
    delete updateData.transferID;
    
    const currentTransfer = await getInventoryTransferByIdService(id);
    if (!currentTransfer) {
      return next(new DatabaseError('notFound', 'Inventory Transfer', id));
    }
    
    const nonEditableStatuses = ['Shipped', 'Received', 'Completed', 'Cancelled'];
    if (nonEditableStatuses.includes(currentTransfer.status)) {
      return next(new ValidationError(
        'status',
        currentTransfer.status,
        `Transfers with status '${currentTransfer.status}' cannot be edited`
      ));
    }
    
    if (updateData.status) {
      const validTransitions = {
        'Draft': ['Pending', 'Cancelled'],
        'Pending': ['Draft', 'Approved', 'Cancelled'],
        'Approved': ['Pending', 'Shipped', 'Cancelled']
      };
      
      const currentStatus = currentTransfer.status;
      const newStatus = updateData.status;
      
      if (!validTransitions[currentStatus] || !validTransitions[currentStatus].includes(newStatus)) {
        return next(new ValidationError(
          'status',
          newStatus,
          `Invalid status transition from '${currentStatus}' to '${newStatus}'`
        ));
      }
    }
    
    const inventoryTransfer = await updateInventoryTransferService(id, updateData);
    
    const transformedTransfer = transformInventoryTransfer(inventoryTransfer);
    sendResponse(
      res,
      200,
      "Inventory transfer updated successfully",
      transformedTransfer
    );
  } catch (error) {
    logger.error(`Error updating inventory transfer with ID: ${id}`, error);
    
    if (error.name === 'ValidationError') {
      const firstErrorKey = Object.keys(error.errors)[0];
      const firstError = error.errors[firstErrorKey];
      
      return next(new ValidationError(
        firstErrorKey,
        firstError.value,
        firstError.message
      ));
    }
    
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return next(new ValidationError('id', id, 'Invalid inventory transfer ID format'));
    }
    
    next(error);
  }
});

/**
 * @desc    Approve inventory transfer
 * @route   PUT /inventory-transfers/:transfer_Id/approve
 * @access  Private
 */
const approveInventoryTransfer = asyncHandler(async (req, res, next) => {
  const id = req.params.transfer_Id;
  logger.info(`approveInventoryTransfer called with ID: ${id}`);
  logger.debug("Approval data:", req.body);
  try {
    const currentTransfer = await getInventoryTransferByIdService(id);
    if (!currentTransfer) {
      return next(new DatabaseError('notFound', 'Inventory Transfer', id));
    }
    
    if (currentTransfer.status !== 'Pending') {
      return next(new ValidationError(
        'status', 
        currentTransfer.status, 
        `Only transfers with 'Pending' status can be approved. Current status: ${currentTransfer.status}`
      ));
    }
    
    const approvalData = { ...req.body };
    if (!approvalData.approvedBy && req.user) {
      approvalData.approvedBy = req.user._id;
    }
    
    const inventoryTransfer = await approveInventoryTransferService(id, approvalData);
    
    const transformedTransfer = transformInventoryTransfer(inventoryTransfer);
    sendResponse(
      res,
      200,
      "Inventory transfer approved successfully",
      transformedTransfer
    );
  } catch (error) {
    logger.error(`Error approving inventory transfer with ID: ${id}`, error);
    
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return next(new ValidationError('id', id, 'Invalid inventory transfer ID format'));
    }
    
    next(error);
  }
});

/**
 * @desc    Ship inventory transfer
 * @route   PUT /inventory-transfers/:transfer_Id/ship
 * @access  Private
 */
const shipInventoryTransfer = asyncHandler(async (req, res, next) => {
  const id = req.params.transfer_Id;
  logger.info(`shipInventoryTransfer called with ID: ${id}`);
  logger.debug("Shipping data:", req.body);
  try {
    const currentTransfer = await getInventoryTransferByIdService(id);
    if (!currentTransfer) {
      return next(new DatabaseError('notFound', 'Inventory Transfer', id));
    }
    
    if (currentTransfer.status !== 'Approved') {
      return next(new ValidationError(
        'status', 
        currentTransfer.status, 
        `Only transfers with 'Approved' status can be shipped. Current status: ${currentTransfer.status}`
      ));
    }
    
    const shippingData = { ...req.body };
    if (!shippingData.shippedBy && req.user) {
      shippingData.shippedBy = req.user._id;
    }
    
    const inventoryTransfer = await shipInventoryTransferService(id, shippingData, req.user ? req.user._id : null);
    
    const transformedTransfer = transformInventoryTransfer(inventoryTransfer);
    sendResponse(
      res,
      200,
      "Inventory transfer shipped successfully",
      transformedTransfer
    );
  } catch (error) {
    logger.error(`Error shipping inventory transfer with ID: ${id}`, error);
    
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return next(new ValidationError('id', id, 'Invalid inventory transfer ID format'));
    }
    
    next(error);
  }
});

/**
 * @desc    Receive inventory transfer
 * @route   PUT /inventory-transfers/:transfer_Id/receive
 * @access  Private
 */
const receiveInventoryTransfer = asyncHandler(async (req, res, next) => {
  const id = req.params.transfer_Id;
  logger.info(`receiveInventoryTransfer called with ID: ${id}`);
  logger.debug("Receiving data:", req.body);
  try {
    const currentTransfer = await getInventoryTransferByIdService(id);
    if (!currentTransfer) {
      return next(new DatabaseError('notFound', 'Inventory Transfer', id));
    }
    
    if (currentTransfer.status !== 'Shipped') {
      return next(new ValidationError(
        'status', 
        currentTransfer.status, 
        `Only transfers with 'Shipped' status can be received. Current status: ${currentTransfer.status}`
      ));
    }
    
    const receivingData = { ...req.body };
    if (!receivingData.receivedBy && req.user) {
      receivingData.receivedBy = req.user._id;
    }
    
    const inventoryTransfer = await receiveInventoryTransferService(id, receivingData);
    
    const transformedTransfer = transformInventoryTransfer(inventoryTransfer);
    sendResponse(
      res,
      200,
      "Inventory transfer received successfully",
      transformedTransfer
    );
  } catch (error) {
    logger.error(`Error receiving inventory transfer with ID: ${id}`, error);
    
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return next(new ValidationError('id', id, 'Invalid inventory transfer ID format'));
    }
    
    next(error);
  }
});

/**
 * @desc    Delete inventory transfer by ID
 * @route   DELETE /inventory-transfers/:transfer_Id
 * @access  Private
 */
const deleteInventoryTransferById = asyncHandler(async (req, res, next) => {
  const id = req.params.transfer_Id;
  logger.info(`deleteInventoryTransferById called with ID: ${id}`);
  try {
    const currentTransfer = await getInventoryTransferByIdService(id);
    if (!currentTransfer) {
      return next(new DatabaseError('notFound', 'Inventory Transfer', id));
    }
    
    const nonDeletableStatuses = ['Shipped', 'Received', 'Completed'];
    if (nonDeletableStatuses.includes(currentTransfer.status)) {
      return next(new ValidationError(
        'status',
        currentTransfer.status,
        `Transfers with status '${currentTransfer.status}' cannot be deleted for audit purposes`
      ));
    }
    
    const result = await deleteInventoryTransferService(id);
    
    sendResponse(res, 200, "Inventory transfer deleted successfully");
  } catch (error) {
    logger.error(`Error deleting inventory transfer with ID: ${id}`, error);
    
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return next(new ValidationError('id', id, 'Invalid inventory transfer ID format'));
    }
    
    next(error);
  }
});

/**
 * @desc    Delete all inventory transfers
 * @route   DELETE /inventory-transfers
 * @access  Private
 */
const deleteAllInventoryTransfers = asyncHandler(async (req, res, next) => {
  logger.info("deleteAllInventoryTransfers called");
  try {
    const result = await deleteAllInventoryTransfersService();
    sendResponse(
      res,
      200,
      `${result.deletedCount} inventory transfers deleted successfully`
    );
  } catch (error) {
    logger.error("Error deleting all inventory transfers:", error);
    next(error);
  }
});

module.exports = {
  getAllInventoryTransfers,
  getInventoryTransferById,
  getInventoryTransferByTransferID,
  getInventoryTransfersByFromWarehouse,
  getInventoryTransfersByToWarehouse,
  getInventoryTransfersByStatus,
  createInventoryTransfer,
  updateInventoryTransferById,
  approveInventoryTransfer,
  shipInventoryTransfer,
  receiveInventoryTransfer,
  deleteInventoryTransferById,
  deleteAllInventoryTransfers
};
