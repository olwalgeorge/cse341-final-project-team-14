const InventoryAdjustment = require("../models/adjustment.model.js");
const { generateAdjustmentId } = require("../utils/inventoryAdjustment.utils.js");
const inventoryTransactionManager = require("../managers/inventoryTransaction.manager.js");
const APIFeatures = require("../utils/apiFeatures.js");
const { createLogger } = require("../utils/logger.js");
const logger = createLogger("InventoryAdjustmentsService");

/**
 * Get all inventory adjustments with optional filtering and pagination
 */
const getAllInventoryAdjustmentsService = async (query = {}) => {
  try {
    // Define custom filters mapping based on our model structure
    const customFilters = {
      reason: 'reason',
      warehouse: 'warehouse',
      status: 'status',
      performedBy: 'performedBy',
      approvedBy: 'approvedBy',
      fromDate: {
        field: 'adjustmentDate',
        transform: (value) => ({ $gte: new Date(value) })
      },
      toDate: {
        field: 'adjustmentDate',
        transform: (value) => ({ $lte: new Date(value) })
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
    
    // Get sort parameters with default sort by adjustment date descending
    const sort = APIFeatures.getSort(query, '-adjustmentDate');

    // Execute query
    const adjustments = await InventoryAdjustment.find(filter)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate("warehouse", "name warehouseID")
      .populate("items.product", "name productID sku category")
      .populate("performedBy", "fullName email username")
      .populate("approvedBy", "fullName email username");

    // Get total count for pagination
    const total = await InventoryAdjustment.countDocuments(filter);

    return {
      adjustments,
      pagination: APIFeatures.paginationResult(total, pagination)
    };
  } catch (error) {
    logger.error("Error in getAllInventoryAdjustmentsService:", error);
    throw error;
  }
};

/**
 * Get inventory adjustment by MongoDB ID
 */
const getInventoryAdjustmentByIdService = async (id) => {
  try {
    return await InventoryAdjustment.findById(id)
      .populate("warehouse", "name warehouseID")
      .populate("items.product", "name productID sku category")
      .populate("performedBy", "fullName email username")
      .populate("approvedBy", "fullName email username");
  } catch (error) {
    logger.error(`Error in getInventoryAdjustmentByIdService for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get inventory adjustment by adjustment ID (ADJ-XXXXX format)
 */
const getInventoryAdjustmentByAdjustmentIDService = async (adjustmentID) => {
  try {
    return await InventoryAdjustment.findOne({ adjustmentID })
      .populate("warehouse", "name warehouseID")
      .populate("items.product", "name productID sku category")
      .populate("performedBy", "fullName email username")
      .populate("approvedBy", "fullName email username");
  } catch (error) {
    logger.error(`Error in getInventoryAdjustmentByAdjustmentIDService for adjustmentID ${adjustmentID}:`, error);
    throw error;
  }
};

/**
 * Get inventory adjustments by warehouse
 */
const getInventoryAdjustmentsByWarehouseService = async (warehouseId, query = {}) => {
  try {
    // Use our pagination and sorting utilities
    const pagination = APIFeatures.getPagination(query);
    const sort = APIFeatures.getSort(query, '-adjustmentDate');
    
    // Create the warehouse filter
    const filter = { warehouse: warehouseId };
    
    // Apply any additional filters from query
    const additionalFilters = APIFeatures.buildFilter(query, {
      reason: 'reason',
      status: 'status',
      fromDate: {
        field: 'adjustmentDate',
        transform: (value) => ({ $gte: new Date(value) })
      },
      toDate: {
        field: 'adjustmentDate',
        transform: (value) => ({ $lte: new Date(value) })
      }
    });
    
    // Combine filters
    const combinedFilter = { ...filter, ...additionalFilters };
    
    // Execute query with pagination and sorting
    const adjustments = await InventoryAdjustment.find(combinedFilter)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate("warehouse", "name warehouseID")
      .populate("items.product", "name productID sku category")
      .populate("performedBy", "fullName email username")
      .populate("approvedBy", "fullName email username");
    
    // Get total count for pagination
    const total = await InventoryAdjustment.countDocuments(combinedFilter);

    return {
      adjustments,
      pagination: APIFeatures.paginationResult(total, pagination)
    };
  } catch (error) {
    logger.error(`Error in getInventoryAdjustmentsByWarehouseService for warehouse ${warehouseId}:`, error);
    throw error;
  }
};

/**
 * Get inventory adjustments by reason
 */
const getInventoryAdjustmentsByReasonService = async (reason, query = {}) => {
  try {
    // Use our pagination and sorting utilities
    const pagination = APIFeatures.getPagination(query);
    const sort = APIFeatures.getSort(query, '-adjustmentDate');
    
    // Create the reason filter
    const filter = { reason };
    
    // Apply any additional filters from query
    const additionalFilters = APIFeatures.buildFilter(query, {
      warehouse: 'warehouse',
      status: 'status',
      fromDate: {
        field: 'adjustmentDate',
        transform: (value) => ({ $gte: new Date(value) })
      },
      toDate: {
        field: 'adjustmentDate',
        transform: (value) => ({ $lte: new Date(value) })
      }
    });
    
    // Combine filters
    const combinedFilter = { ...filter, ...additionalFilters };
    
    // Execute query with pagination and sorting
    const adjustments = await InventoryAdjustment.find(combinedFilter)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate("warehouse", "name warehouseID")
      .populate("items.product", "name productID sku category")
      .populate("performedBy", "fullName email username")
      .populate("approvedBy", "fullName email username");
    
    // Get total count for pagination
    const total = await InventoryAdjustment.countDocuments(combinedFilter);

    return {
      adjustments,
      pagination: APIFeatures.paginationResult(total, pagination)
    };
  } catch (error) {
    logger.error(`Error in getInventoryAdjustmentsByReasonService for reason ${reason}:`, error);
    throw error;
  }
};

/**
 * Get inventory adjustments by status
 */
const getInventoryAdjustmentsByStatusService = async (status, query = {}) => {
  try {
    // Use our pagination and sorting utilities
    const pagination = APIFeatures.getPagination(query);
    const sort = APIFeatures.getSort(query, '-adjustmentDate');
    
    // Create the status filter
    const filter = { status };
    
    // Apply any additional filters from query
    const additionalFilters = APIFeatures.buildFilter(query, {
      warehouse: 'warehouse',
      reason: 'reason',
      fromDate: {
        field: 'adjustmentDate',
        transform: (value) => ({ $gte: new Date(value) })
      },
      toDate: {
        field: 'adjustmentDate',
        transform: (value) => ({ $lte: new Date(value) })
      }
    });
    
    // Combine filters
    const combinedFilter = { ...filter, ...additionalFilters };
    
    // Execute query with pagination and sorting
    const adjustments = await InventoryAdjustment.find(combinedFilter)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate("warehouse", "name warehouseID")
      .populate("items.product", "name productID sku category")
      .populate("performedBy", "fullName email username")
      .populate("approvedBy", "fullName email username");
    
    // Get total count for pagination
    const total = await InventoryAdjustment.countDocuments(combinedFilter);

    return {
      adjustments,
      pagination: APIFeatures.paginationResult(total, pagination)
    };
  } catch (error) {
    logger.error(`Error in getInventoryAdjustmentsByStatusService for status ${status}:`, error);
    throw error;
  }
};

/**
 * Create a new inventory adjustment
 */
const createInventoryAdjustmentService = async (adjustmentData) => {
  try {
    // Generate adjustment ID if not provided
    if (!adjustmentData.adjustmentID) {
      adjustmentData.adjustmentID = await generateAdjustmentId();
      logger.debug(`Generated adjustmentID: ${adjustmentData.adjustmentID}`);
    }
    
    // Create and save the adjustment
    const inventoryAdjustment = new InventoryAdjustment(adjustmentData);
    const savedAdjustment = await inventoryAdjustment.save();
    
    // Return the populated adjustment
    return await InventoryAdjustment.findById(savedAdjustment._id)
      .populate("warehouse", "name warehouseID")
      .populate("items.product", "name productID sku category")
      .populate("performedBy", "fullName email username")
      .populate("approvedBy", "fullName email username");
  } catch (error) {
    logger.error("Error in createInventoryAdjustmentService:", error);
    throw error;
  }
};

/**
 * Update an inventory adjustment
 */
const updateInventoryAdjustmentService = async (id, updateData) => {
  try {
    // Prevent updating certain fields if adjustment has already been approved or completed
    const existingAdjustment = await InventoryAdjustment.findById(id);
    if (!existingAdjustment) {
      return null;
    }
    
    if (existingAdjustment.status !== "Draft" && existingAdjustment.status !== "Pending Approval") {
      // If status is not Draft or Pending Approval, only allow updating status, description
      const allowedFields = ['status', 'description'];
      const updateKeys = Object.keys(updateData);
      
      for (const key of updateKeys) {
        if (!allowedFields.includes(key)) {
          delete updateData[key];
        }
      }
    }
    
    const updatedAdjustment = await InventoryAdjustment.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate("warehouse", "name warehouseID")
      .populate("items.product", "name productID sku category")
      .populate("performedBy", "fullName email username")
      .populate("approvedBy", "fullName email username");
      
    return updatedAdjustment;
  } catch (error) {
    logger.error(`Error in updateInventoryAdjustmentService for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Approve an inventory adjustment - changes status to Approved
 */
const approveInventoryAdjustmentService = async (id, approvalData) => {
  try {
    const existingAdjustment = await InventoryAdjustment.findById(id);
    
    if (!existingAdjustment) {
      return null;
    }
    
    // Can only approve adjustments that are in Pending Approval status
    if (existingAdjustment.status !== "Pending Approval") {
      throw new Error(`Cannot approve adjustment in ${existingAdjustment.status} status. Adjustment must be in Pending Approval status.`);
    }
    
    // Update adjustment with approval data
    const updateData = {
      status: "Approved",
      approvedBy: approvalData.approvedBy,
      description: approvalData.description || existingAdjustment.description
    };
    
    const approvedAdjustment = await InventoryAdjustment.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate("warehouse", "name warehouseID")
      .populate("items.product", "name productID sku category")
      .populate("performedBy", "fullName email username")
      .populate("approvedBy", "fullName email username");
      
    return approvedAdjustment;
  } catch (error) {
    logger.error(`Error in approveInventoryAdjustmentService for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Complete an inventory adjustment - creates inventory transactions and changes status to Completed
 */
const completeInventoryAdjustmentService = async (id, userId) => {
  try {
    const existingAdjustment = await InventoryAdjustment.findById(id)
      .populate("items.product")
      .populate("warehouse");
    
    if (!existingAdjustment) {
      return null;
    }
    
    // Can only complete adjustments that are in Approved status
    if (existingAdjustment.status !== "Approved") {
      throw new Error(`Cannot complete adjustment in ${existingAdjustment.status} status. Adjustment must be in Approved status.`);
    }
    
    // Process adjustment using the inventory transaction manager
    const session = await InventoryAdjustment.startSession();
    let completedAdjustment;
    
    await session.withTransaction(async () => {
      // Process each item in the adjustment
      for (const item of existingAdjustment.items) {
        // Use the inventory transaction manager to process the adjustment
        await inventoryTransactionManager.processAdjustment({
          product: item.product._id,
          warehouse: existingAdjustment.warehouse._id,
          quantityBefore: item.quantityBefore,
          quantityAfter: item.quantityAfter,
          performedBy: userId,
          reference: {
            documentType: "Adjustment",
            documentId: existingAdjustment._id,
            documentCode: existingAdjustment.adjustmentID
          },
          notes: `${existingAdjustment.reason} adjustment: ${item.reason || existingAdjustment.description || ''}`
        });
      }
      
      // Update adjustment with completion data
      const updateData = {
        status: "Completed"
      };
      
      completedAdjustment = await InventoryAdjustment.findByIdAndUpdate(
        id,
        updateData,
        { 
          new: true,
          session 
        }
      )
        .populate("warehouse", "name warehouseID")
        .populate("items.product", "name productID sku category")
        .populate("performedBy", "fullName email username")
        .populate("approvedBy", "fullName email username");
    });
    
    await session.endSession();
    return completedAdjustment;
  } catch (error) {
    logger.error(`Error in completeInventoryAdjustmentService for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete an inventory adjustment
 */
const deleteInventoryAdjustmentService = async (id) => {
  try {
    // Check if the adjustment can be deleted (only Draft, Pending Approval, or Cancelled status)
    const existingAdjustment = await InventoryAdjustment.findById(id);
    if (existingAdjustment && 
        existingAdjustment.status !== "Draft" && 
        existingAdjustment.status !== "Pending Approval" &&
        existingAdjustment.status !== "Cancelled") {
      throw new Error(`Cannot delete adjustment in ${existingAdjustment.status} status. Only adjustments in Draft, Pending Approval, or Cancelled status can be deleted.`);
    }
    
    return await InventoryAdjustment.deleteOne({ _id: id });
  } catch (error) {
    logger.error(`Error in deleteInventoryAdjustmentService for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete all inventory adjustments
 */
const deleteAllInventoryAdjustmentsService = async () => {
  try {
    return await InventoryAdjustment.deleteMany({});
  } catch (error) {
    logger.error("Error in deleteAllInventoryAdjustmentsService:", error);
    throw error;
  }
};

module.exports = {
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
};
