const sendResponse = require("../utils/response.js");
const asyncHandler = require("express-async-handler");
const logger = require("../utils/logger.js");
const { DatabaseError } = require("../utils/errors");
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
  logger.info(`getInventoryTransferById called with ID: ${req.params.transfer_Id}`);
  try {
    const inventoryTransfer = await getInventoryTransferByIdService(req.params.transfer_Id);
    if (inventoryTransfer) {
      const transformedTransfer = transformInventoryTransfer(inventoryTransfer);
      sendResponse(
        res,
        200,
        "Inventory transfer retrieved successfully",
        transformedTransfer
      );
    } else {
      return next(DatabaseError.notFound("Inventory transfer"));
    }
  } catch (error) {
    logger.error(`Error retrieving inventory transfer with ID: ${req.params.transfer_Id}`, error);
    next(error);
  }
});

/**
 * @desc    Get inventory transfer by transfer ID (TR-XXXXX format)
 * @route   GET /inventory-transfers/transferID/:transferID
 * @access  Private
 */
const getInventoryTransferByTransferID = asyncHandler(async (req, res, next) => {
  logger.info(`getInventoryTransferByTransferID called with transfer ID: ${req.params.transferID}`);
  try {
    const inventoryTransfer = await getInventoryTransferByTransferIDService(req.params.transferID);
    if (inventoryTransfer) {
      const transformedTransfer = transformInventoryTransfer(inventoryTransfer);
      sendResponse(
        res,
        200,
        "Inventory transfer retrieved successfully",
        transformedTransfer
      );
    } else {
      return next(DatabaseError.notFound("Inventory transfer"));
    }
  } catch (error) {
    logger.error(`Error retrieving inventory transfer with transfer ID: ${req.params.transferID}`, error);
    next(error);
  }
});

/**
 * @desc    Get inventory transfers by from warehouse
 * @route   GET /inventory-transfers/from-warehouse/:warehouseId
 * @access  Private
 */
const getInventoryTransfersByFromWarehouse = asyncHandler(async (req, res, next) => {
  logger.info(`getInventoryTransfersByFromWarehouse called with warehouse ID: ${req.params.warehouseId}`);
  logger.debug("Query parameters:", req.query);
  
  try {
    const result = await getInventoryTransfersByFromWarehouseService(req.params.warehouseId, req.query);
    
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
    logger.error(`Error retrieving inventory transfers from warehouse: ${req.params.warehouseId}`, error);
    next(error);
  }
});

/**
 * @desc    Get inventory transfers by to warehouse
 * @route   GET /inventory-transfers/to-warehouse/:warehouseId
 * @access  Private
 */
const getInventoryTransfersByToWarehouse = asyncHandler(async (req, res, next) => {
  logger.info(`getInventoryTransfersByToWarehouse called with warehouse ID: ${req.params.warehouseId}`);
  logger.debug("Query parameters:", req.query);
  
  try {
    const result = await getInventoryTransfersByToWarehouseService(req.params.warehouseId, req.query);
    
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
    logger.error(`Error retrieving inventory transfers to warehouse: ${req.params.warehouseId}`, error);
    next(error);
  }
});

/**
 * @desc    Get inventory transfers by status
 * @route   GET /inventory-transfers/status/:status
 * @access  Private
 */
const getInventoryTransfersByStatus = asyncHandler(async (req, res, next) => {
  logger.info(`getInventoryTransfersByStatus called with status: ${req.params.status}`);
  logger.debug("Query parameters:", req.query);
  
  try {
    const result = await getInventoryTransfersByStatusService(req.params.status, req.query);
    
    if (!result.transfers.length) {
      return sendResponse(res, 200, `No inventory transfers found with status: ${req.params.status}`, {
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
    logger.error(`Error retrieving inventory transfers with status: ${req.params.status}`, error);
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
    // Generate transferID if not provided
    if (!req.body.transferID) {
      const transferID = await generateTransferId();
      logger.debug(`Generated transferID: ${transferID}`);
      req.body.transferID = transferID;
    }
    
    // Add the user who requested the transfer
    if (!req.body.requestedBy) {
      req.body.requestedBy = req.user._id;
    }
    
    const inventoryTransfer = await createInventoryTransferService(req.body);
    const transformedTransfer = transformInventoryTransfer(inventoryTransfer);
    sendResponse(
      res,
      201,
      "Inventory transfer created successfully",
      transformedTransfer
    );
  } catch (error) {
    logger.error("Error creating inventory transfer:", error);
    next(error);
  }
});

/**
 * @desc    Update inventory transfer by ID
 * @route   PUT /inventory-transfers/:transfer_Id
 * @access  Private
 */
const updateInventoryTransferById = asyncHandler(async (req, res, next) => {
  logger.info(`updateInventoryTransferById called with ID: ${req.params.transfer_Id}`);
  logger.debug("Update data:", req.body);
  try {
    const inventoryTransfer = await updateInventoryTransferService(req.params.transfer_Id, req.body);
    if (inventoryTransfer) {
      const transformedTransfer = transformInventoryTransfer(inventoryTransfer);
      sendResponse(
        res,
        200,
        "Inventory transfer updated successfully",
        transformedTransfer
      );
    } else {
      return next(DatabaseError.notFound("Inventory transfer"));
    }
  } catch (error) {
    logger.error(`Error updating inventory transfer with ID: ${req.params.transfer_Id}`, error);
    next(error);
  }
});

/**
 * @desc    Approve inventory transfer
 * @route   PUT /inventory-transfers/:transfer_Id/approve
 * @access  Private
 */
const approveInventoryTransfer = asyncHandler(async (req, res, next) => {
  logger.info(`approveInventoryTransfer called with ID: ${req.params.transfer_Id}`);
  logger.debug("Approval data:", req.body);
  try {
    // Add the user who approved the transfer
    req.body.approvedBy = req.user._id;
    
    const inventoryTransfer = await approveInventoryTransferService(req.params.transfer_Id, req.body);
    if (inventoryTransfer) {
      const transformedTransfer = transformInventoryTransfer(inventoryTransfer);
      sendResponse(
        res,
        200,
        "Inventory transfer approved successfully",
        transformedTransfer
      );
    } else {
      return next(DatabaseError.notFound("Inventory transfer"));
    }
  } catch (error) {
    logger.error(`Error approving inventory transfer with ID: ${req.params.transfer_Id}`, error);
    next(error);
  }
});

/**
 * @desc    Ship inventory transfer
 * @route   PUT /inventory-transfers/:transfer_Id/ship
 * @access  Private
 */
const shipInventoryTransfer = asyncHandler(async (req, res, next) => {
  logger.info(`shipInventoryTransfer called with ID: ${req.params.transfer_Id}`);
  logger.debug("Shipping data:", req.body);
  try {
    const inventoryTransfer = await shipInventoryTransferService(req.params.transfer_Id, req.body, req.user._id);
    if (inventoryTransfer) {
      const transformedTransfer = transformInventoryTransfer(inventoryTransfer);
      sendResponse(
        res,
        200,
        "Inventory transfer shipped successfully",
        transformedTransfer
      );
    } else {
      return next(DatabaseError.notFound("Inventory transfer"));
    }
  } catch (error) {
    logger.error(`Error shipping inventory transfer with ID: ${req.params.transfer_Id}`, error);
    next(error);
  }
});

/**
 * @desc    Receive inventory transfer
 * @route   PUT /inventory-transfers/:transfer_Id/receive
 * @access  Private
 */
const receiveInventoryTransfer = asyncHandler(async (req, res, next) => {
  logger.info(`receiveInventoryTransfer called with ID: ${req.params.transfer_Id}`);
  logger.debug("Receiving data:", req.body);
  try {
    // Add the user who received the transfer
    req.body.receivedBy = req.user._id;
    
    const inventoryTransfer = await receiveInventoryTransferService(req.params.transfer_Id, req.body);
    if (inventoryTransfer) {
      const transformedTransfer = transformInventoryTransfer(inventoryTransfer);
      sendResponse(
        res,
        200,
        "Inventory transfer received successfully",
        transformedTransfer
      );
    } else {
      return next(DatabaseError.notFound("Inventory transfer"));
    }
  } catch (error) {
    logger.error(`Error receiving inventory transfer with ID: ${req.params.transfer_Id}`, error);
    next(error);
  }
});

/**
 * @desc    Delete inventory transfer by ID
 * @route   DELETE /inventory-transfers/:transfer_Id
 * @access  Private
 */
const deleteInventoryTransferById = asyncHandler(async (req, res, next) => {
  logger.info(`deleteInventoryTransferById called with ID: ${req.params.transfer_Id}`);
  try {
    const result = await deleteInventoryTransferService(req.params.transfer_Id);
    if (result.deletedCount > 0) {
      sendResponse(res, 200, "Inventory transfer deleted successfully");
    } else {
      return next(DatabaseError.notFound("Inventory transfer"));
    }
  } catch (error) {
    logger.error(`Error deleting inventory transfer with ID: ${req.params.transfer_Id}`, error);
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
