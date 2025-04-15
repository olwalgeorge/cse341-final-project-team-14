const InventoryTransfer = require("../models/transfer.model");
const Inventory = require("../models/inventory.model.js");
const { generateTransferId } = require("../utils/inventoryTransfer.utils.js");
const inventoryTransactionManager = require("../managers/inventoryTransaction.manager.js");
const APIFeatures = require("../utils/apiFeatures.js");
const logger = require("../utils/logger.js");

/**
 * Get all inventory transfers with optional filtering and pagination
 */
const getAllInventoryTransfersService = async (query = {}) => {
  try {
    // Define custom filters mapping based on our model structure
    const customFilters = {
      status: 'status',
      fromWarehouse: 'fromWarehouse',
      toWarehouse: 'toWarehouse',
      requestedBy: 'requestedBy',
      approvedBy: 'approvedBy',
      receivedBy: 'receivedBy',
      fromDate: {
        field: 'requestDate',
        transform: (value) => ({ $gte: new Date(value) })
      },
      toDate: {
        field: 'requestDate',
        transform: (value) => ({ $lte: new Date(value) })
      },
      expectedDeliveryFromDate: {
        field: 'expectedDeliveryDate',
        transform: (value) => ({ $gte: new Date(value) })
      },
      expectedDeliveryToDate: {
        field: 'expectedDeliveryDate',
        transform: (value) => ({ $lte: new Date(value) })
      },
      completed: {
        field: 'completionDate',
        transform: (value) => value === 'true' ? { $ne: null } : { $eq: null }
      },
      product: {
        field: 'items.product',
        transform: (value) => ({ $elemMatch: { product: value } })
      }
    };

    // Build filter using APIFeatures utility
    const filter = APIFeatures.buildFilter(query, customFilters);

    // Get pagination parameters
    const pagination = APIFeatures.getPagination(query);
    
    // Get sort parameters with default sort by request date descending
    const sort = APIFeatures.getSort(query, '-requestDate');

    // Execute query
    const transfers = await InventoryTransfer.find(filter)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate("fromWarehouse", "name warehouseID")
      .populate("toWarehouse", "name warehouseID")
      .populate("items.product", "name productID sku category")
      .populate("requestedBy", "fullName email username")
      .populate("approvedBy", "fullName email username")
      .populate("receivedBy", "fullName email username");

    // Get total count for pagination
    const total = await InventoryTransfer.countDocuments(filter);

    return {
      transfers,
      pagination: APIFeatures.paginationResult(total, pagination)
    };
  } catch (error) {
    logger.error("Error in getAllInventoryTransfersService:", error);
    throw error;
  }
};

/**
 * Get inventory transfer by MongoDB ID
 */
const getInventoryTransferByIdService = async (id) => {
  try {
    return await InventoryTransfer.findById(id)
      .populate("fromWarehouse", "name warehouseID")
      .populate("toWarehouse", "name warehouseID")
      .populate("items.product", "name productID sku category")
      .populate("requestedBy", "fullName email username")
      .populate("approvedBy", "fullName email username")
      .populate("receivedBy", "fullName email username");
  } catch (error) {
    logger.error(`Error in getInventoryTransferByIdService for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get inventory transfer by transfer ID (TR-XXXXX format)
 */
const getInventoryTransferByTransferIDService = async (transferID) => {
  try {
    return await InventoryTransfer.findOne({ transferID })
      .populate("fromWarehouse", "name warehouseID")
      .populate("toWarehouse", "name warehouseID")
      .populate("items.product", "name productID sku category")
      .populate("requestedBy", "fullName email username")
      .populate("approvedBy", "fullName email username")
      .populate("receivedBy", "fullName email username");
  } catch (error) {
    logger.error(`Error in getInventoryTransferByTransferIDService for transferID ${transferID}:`, error);
    throw error;
  }
};

/**
 * Get inventory transfers by from warehouse
 */
const getInventoryTransfersByFromWarehouseService = async (warehouseId, query = {}) => {
  try {
    // Use our pagination and sorting utilities
    const pagination = APIFeatures.getPagination(query);
    const sort = APIFeatures.getSort(query, '-requestDate');
    
    // Create the warehouse filter
    const filter = { fromWarehouse: warehouseId };
    
    // Apply any additional filters from query
    const additionalFilters = APIFeatures.buildFilter(query, {
      status: 'status',
      toWarehouse: 'toWarehouse',
      fromDate: {
        field: 'requestDate',
        transform: (value) => ({ $gte: new Date(value) })
      },
      toDate: {
        field: 'requestDate',
        transform: (value) => ({ $lte: new Date(value) })
      }
    });
    
    // Combine filters
    const combinedFilter = { ...filter, ...additionalFilters };
    
    // Execute query with pagination and sorting
    const transfers = await InventoryTransfer.find(combinedFilter)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate("fromWarehouse", "name warehouseID")
      .populate("toWarehouse", "name warehouseID")
      .populate("items.product", "name productID sku category")
      .populate("requestedBy", "fullName email username")
      .populate("approvedBy", "fullName email username")
      .populate("receivedBy", "fullName email username");
    
    // Get total count for pagination
    const total = await InventoryTransfer.countDocuments(combinedFilter);

    return {
      transfers,
      pagination: APIFeatures.paginationResult(total, pagination)
    };
  } catch (error) {
    logger.error(`Error in getInventoryTransfersByFromWarehouseService for warehouse ${warehouseId}:`, error);
    throw error;
  }
};

/**
 * Get inventory transfers by to warehouse
 */
const getInventoryTransfersByToWarehouseService = async (warehouseId, query = {}) => {
  try {
    // Use our pagination and sorting utilities
    const pagination = APIFeatures.getPagination(query);
    const sort = APIFeatures.getSort(query, '-requestDate');
    
    // Create the warehouse filter
    const filter = { toWarehouse: warehouseId };
    
    // Apply any additional filters from query
    const additionalFilters = APIFeatures.buildFilter(query, {
      status: 'status',
      fromWarehouse: 'fromWarehouse',
      fromDate: {
        field: 'requestDate',
        transform: (value) => ({ $gte: new Date(value) })
      },
      toDate: {
        field: 'requestDate',
        transform: (value) => ({ $lte: new Date(value) })
      }
    });
    
    // Combine filters
    const combinedFilter = { ...filter, ...additionalFilters };
    
    // Execute query with pagination and sorting
    const transfers = await InventoryTransfer.find(combinedFilter)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate("fromWarehouse", "name warehouseID")
      .populate("toWarehouse", "name warehouseID")
      .populate("items.product", "name productID sku category")
      .populate("requestedBy", "fullName email username")
      .populate("approvedBy", "fullName email username")
      .populate("receivedBy", "fullName email username");
    
    // Get total count for pagination
    const total = await InventoryTransfer.countDocuments(combinedFilter);

    return {
      transfers,
      pagination: APIFeatures.paginationResult(total, pagination)
    };
  } catch (error) {
    logger.error(`Error in getInventoryTransfersByToWarehouseService for warehouse ${warehouseId}:`, error);
    throw error;
  }
};

/**
 * Get inventory transfers by status
 */
const getInventoryTransfersByStatusService = async (status, query = {}) => {
  try {
    // Use our pagination and sorting utilities
    const pagination = APIFeatures.getPagination(query);
    const sort = APIFeatures.getSort(query, '-requestDate');
    
    // Create the status filter
    const filter = { status };
    
    // Apply any additional filters from query
    const additionalFilters = APIFeatures.buildFilter(query, {
      fromWarehouse: 'fromWarehouse',
      toWarehouse: 'toWarehouse',
      fromDate: {
        field: 'requestDate',
        transform: (value) => ({ $gte: new Date(value) })
      },
      toDate: {
        field: 'requestDate',
        transform: (value) => ({ $lte: new Date(value) })
      }
    });
    
    // Combine filters
    const combinedFilter = { ...filter, ...additionalFilters };
    
    // Execute query with pagination and sorting
    const transfers = await InventoryTransfer.find(combinedFilter)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate("fromWarehouse", "name warehouseID")
      .populate("toWarehouse", "name warehouseID")
      .populate("items.product", "name productID sku category")
      .populate("requestedBy", "fullName email username")
      .populate("approvedBy", "fullName email username")
      .populate("receivedBy", "fullName email username");
    
    // Get total count for pagination
    const total = await InventoryTransfer.countDocuments(combinedFilter);

    return {
      transfers,
      pagination: APIFeatures.paginationResult(total, pagination)
    };
  } catch (error) {
    logger.error(`Error in getInventoryTransfersByStatusService for status ${status}:`, error);
    throw error;
  }
};

/**
 * Create a new inventory transfer
 */
const createInventoryTransferService = async (transferData) => {
  try {
    // Generate transfer ID if not provided
    if (!transferData.transferID) {
      transferData.transferID = await generateTransferId();
      logger.debug(`Generated transferID: ${transferData.transferID}`);
    }
    
    // Create and save the transfer
    const inventoryTransfer = new InventoryTransfer(transferData);
    const savedTransfer = await inventoryTransfer.save();
    
    // Return the populated transfer
    return await InventoryTransfer.findById(savedTransfer._id)
      .populate("fromWarehouse", "name warehouseID")
      .populate("toWarehouse", "name warehouseID")
      .populate("items.product", "name productID sku category")
      .populate("requestedBy", "fullName email username")
      .populate("approvedBy", "fullName email username")
      .populate("receivedBy", "fullName email username");
  } catch (error) {
    logger.error("Error in createInventoryTransferService:", error);
    throw error;
  }
};

/**
 * Update an inventory transfer
 */
const updateInventoryTransferService = async (id, updateData) => {
  try {
    // Prevent updating certain fields if transfer has already been approved or in transit
    const existingTransfer = await InventoryTransfer.findById(id);
    if (!existingTransfer) {
      return null;
    }
    
    if (existingTransfer.status !== "Draft" && existingTransfer.status !== "Pending") {
      // If status is not Draft or Pending, only allow updating status, notes, and specific fields
      const allowedFields = ['status', 'notes', 'expectedDeliveryDate', 'transportInfo'];
      const updateKeys = Object.keys(updateData);
      
      for (const key of updateKeys) {
        if (!allowedFields.includes(key)) {
          delete updateData[key];
        }
      }
    }
    
    const updatedTransfer = await InventoryTransfer.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate("fromWarehouse", "name warehouseID")
      .populate("toWarehouse", "name warehouseID")
      .populate("items.product", "name productID sku category")
      .populate("requestedBy", "fullName email username")
      .populate("approvedBy", "fullName email username")
      .populate("receivedBy", "fullName email username");
      
    return updatedTransfer;
  } catch (error) {
    logger.error(`Error in updateInventoryTransferService for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Approve an inventory transfer - changes status from Pending to Approved
 */
const approveInventoryTransferService = async (id, approvalData) => {
  try {
    const existingTransfer = await InventoryTransfer.findById(id);
    
    if (!existingTransfer) {
      return null;
    }
    
    // Can only approve transfers that are in Pending status
    if (existingTransfer.status !== "Pending") {
      throw new Error(`Cannot approve transfer in ${existingTransfer.status} status. Transfer must be in Pending status.`);
    }
    
    // Update transfer with approval data
    const updateData = {
      status: "Approved",
      approvedBy: approvalData.approvedBy,
      expectedDeliveryDate: approvalData.expectedDeliveryDate || existingTransfer.expectedDeliveryDate,
      notes: approvalData.notes || existingTransfer.notes
    };
    
    const approvedTransfer = await InventoryTransfer.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate("fromWarehouse", "name warehouseID")
      .populate("toWarehouse", "name warehouseID")
      .populate("items.product", "name productID sku category")
      .populate("requestedBy", "fullName email username")
      .populate("approvedBy", "fullName email username")
      .populate("receivedBy", "fullName email username");
      
    return approvedTransfer;
  } catch (error) {
    logger.error(`Error in approveInventoryTransferService for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Ship an inventory transfer - creates inventory transactions for Transfer Out and changes status to In Transit
 */
const shipInventoryTransferService = async (id, shipData, userId) => {
  try {
    const existingTransfer = await InventoryTransfer.findById(id)
      .populate("items.product")
      .populate("fromWarehouse")
      .populate("toWarehouse");
    
    if (!existingTransfer) {
      return null;
    }
    
    // Can only ship transfers that are in Approved status
    if (existingTransfer.status !== "Approved") {
      throw new Error(`Cannot ship transfer in ${existingTransfer.status} status. Transfer must be in Approved status.`);
    }
    
    // Process transfer out for each item using the inventory transaction manager
    const session = await InventoryTransfer.startSession();
    let shippedTransfer;
    
    await session.withTransaction(async () => {
      // Process each item in the transfer
      for (const item of existingTransfer.items) {
        // Verify inventory exists and has sufficient quantity
        const inventory = await Inventory.findOne({
          product: item.product._id,
          warehouse: existingTransfer.fromWarehouse._id
        });
        
        if (!inventory) {
          throw new Error(`No inventory record found for product ${item.product.name} in warehouse ${existingTransfer.fromWarehouse.name}`);
        }
        
        // Check if there's enough stock
        if (inventory.quantity < item.quantity) {
          throw new Error(`Insufficient quantity of ${item.product.name} in ${existingTransfer.fromWarehouse.name}. Available: ${inventory.quantity}, Required: ${item.quantity}`);
        }
        
        // Use the inventory transaction manager to process the transfer out
        await inventoryTransactionManager.processTransferOut({
          product: item.product._id,
          fromWarehouse: existingTransfer.fromWarehouse._id,
          toWarehouse: existingTransfer.toWarehouse._id,
          quantity: item.quantity,
          performedBy: userId,
          reference: {
            documentType: "Transfer",
            documentId: existingTransfer._id,
            documentCode: existingTransfer.transferID
          },
          notes: shipData.notes || `Transfer out to ${existingTransfer.toWarehouse.name}`
        });
      }
      
      // Update transfer with shipping data
      const updateData = {
        status: "In Transit",
        transportInfo: {
          ...existingTransfer.transportInfo,
          ...shipData.transportInfo
        },
        notes: shipData.notes || existingTransfer.notes
      };
      
      shippedTransfer = await InventoryTransfer.findByIdAndUpdate(
        id,
        updateData,
        { 
          new: true,
          session 
        }
      )
        .populate("fromWarehouse", "name warehouseID")
        .populate("toWarehouse", "name warehouseID")
        .populate("items.product", "name productID sku category")
        .populate("requestedBy", "fullName email username")
        .populate("approvedBy", "fullName email username")
        .populate("receivedBy", "fullName email username");
    });
    
    await session.endSession();
    return shippedTransfer;
  } catch (error) {
    logger.error(`Error in shipInventoryTransferService for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Receive inventory transfer - creates inventory transactions for Transfer In and updates status
 */
const receiveInventoryTransferService = async (id, receiveData) => {
  try {
    const existingTransfer = await InventoryTransfer.findById(id)
      .populate("items.product")
      .populate("fromWarehouse")
      .populate("toWarehouse");
    
    if (!existingTransfer) {
      return null;
    }
    
    // Can only receive transfers that are in In Transit or Partially Received status
    if (existingTransfer.status !== "In Transit" && existingTransfer.status !== "Partially Received") {
      throw new Error(`Cannot receive transfer in ${existingTransfer.status} status. Transfer must be in In Transit or Partially Received status.`);
    }
    
    // Validate received items data
    if (!receiveData.items || !Array.isArray(receiveData.items) || receiveData.items.length === 0) {
      throw new Error("Received items data is required");
    }
    
    // Process transfer in for each received item using the inventory transaction manager
    const session = await InventoryTransfer.startSession();
    let receivedTransfer;
    
    await session.withTransaction(async () => {
      // Process each received item
      for (const receivedItem of receiveData.items) {
        // Find matching item in transfer
        const transferItem = existingTransfer.items.find(
          item => item.product._id.toString() === receivedItem.product
        );
        
        if (!transferItem) {
          throw new Error(`Product ${receivedItem.product} is not part of this transfer`);
        }
        
        // Ensure received quantity doesn't exceed transfer quantity
        const receivedQuantity = parseInt(receivedItem.receivedQuantity) || 0;
        if (receivedQuantity < 0) {
          throw new Error("Received quantity cannot be negative");
        }
        
        const totalReceived = (transferItem.receivedQuantity || 0) + receivedQuantity;
        if (totalReceived > transferItem.quantity) {
          throw new Error(`Cannot receive more than the transferred quantity. Transferred: ${transferItem.quantity}, Already received: ${transferItem.receivedQuantity || 0}, Attempting to receive: ${receivedQuantity}`);
        }
        
        if (receivedQuantity > 0) {
          // Use the inventory transaction manager to process the transfer in
          await inventoryTransactionManager.processTransferIn({
            product: transferItem.product._id,
            fromWarehouse: existingTransfer.fromWarehouse._id,
            toWarehouse: existingTransfer.toWarehouse._id,
            quantity: receivedQuantity,
            performedBy: receiveData.receivedBy,
            reference: {
              documentType: "Transfer",
              documentId: existingTransfer._id,
              documentCode: existingTransfer.transferID
            },
            notes: receiveData.notes || `Transfer in from ${existingTransfer.fromWarehouse.name}`
          });
          
          // Update the transfer item's received quantity
          await InventoryTransfer.updateOne(
            { _id: id, "items._id": transferItem._id },
            { $set: { "items.$.receivedQuantity": totalReceived } },
            { session }
          );
        }
      }
      
      // Check the new total received quantities to determine the updated status
      const updatedTransfer = await InventoryTransfer.findById(id).session(session);
      const totalQuantity = updatedTransfer.items.reduce((sum, item) => sum + item.quantity, 0);
      const totalReceived = updatedTransfer.items.reduce((sum, item) => sum + (item.receivedQuantity || 0), 0);
      
      let newStatus = updatedTransfer.status;
      if (totalReceived === 0) {
        newStatus = "In Transit";
      } else if (totalReceived < totalQuantity) {
        newStatus = "Partially Received";
      } else if (totalReceived >= totalQuantity) {
        newStatus = "Completed";
      }
      
      // Update transfer with receiving data
      const updateData = {
        status: newStatus,
        receivedBy: newStatus === "Completed" ? receiveData.receivedBy : updatedTransfer.receivedBy,
        completionDate: newStatus === "Completed" ? new Date() : updatedTransfer.completionDate,
        notes: receiveData.notes || updatedTransfer.notes
      };
      
      receivedTransfer = await InventoryTransfer.findByIdAndUpdate(
        id,
        updateData,
        { 
          new: true,
          session 
        }
      )
        .populate("fromWarehouse", "name warehouseID")
        .populate("toWarehouse", "name warehouseID")
        .populate("items.product", "name productID sku category")
        .populate("requestedBy", "fullName email username")
        .populate("approvedBy", "fullName email username")
        .populate("receivedBy", "fullName email username");
    });
    
    await session.endSession();
    return receivedTransfer;
  } catch (error) {
    logger.error(`Error in receiveInventoryTransferService for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete an inventory transfer
 */
const deleteInventoryTransferService = async (id) => {
  try {
    // Check if the transfer can be deleted (only Draft, Pending, or Cancelled status)
    const existingTransfer = await InventoryTransfer.findById(id);
    if (existingTransfer && 
        existingTransfer.status !== "Draft" && 
        existingTransfer.status !== "Pending" &&
        existingTransfer.status !== "Cancelled") {
      throw new Error(`Cannot delete transfer in ${existingTransfer.status} status. Only transfers in Draft, Pending, or Cancelled status can be deleted.`);
    }
    
    return await InventoryTransfer.deleteOne({ _id: id });
  } catch (error) {
    logger.error(`Error in deleteInventoryTransferService for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete all inventory transfers
 */
const deleteAllInventoryTransfersService = async () => {
  try {
    return await InventoryTransfer.deleteMany({});
  } catch (error) {
    logger.error("Error in deleteAllInventoryTransfersService:", error);
    throw error;
  }
};

module.exports = {
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
};
