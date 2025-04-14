const InventoryReturn = require("../models/return.model.js");
const Inventory = require("../models/inventory.model.js");
const InventoryTransaction = require("../models/transaction.model.js");
const { generateReturnId } = require("../utils/inventoryReturn.utils.js");
const { generateTransactionId } = require("../utils/inventoryTransaction.utils.js");
const APIFeatures = require("../utils/apiFeatures.js");
const logger = require("../utils/logger.js");

/**
 * Get all inventory returns with optional filtering and pagination
 */
const getAllInventoryReturnsService = async (query = {}) => {
  try {
    // Define custom filters mapping based on our model structure
    const customFilters = {
      sourceType: 'sourceType',
      status: 'status',
      warehouse: 'warehouse',
      'source.sourceId': 'source.sourceId',
      'source.sourceName': {
        field: 'source.sourceName',
        transform: (value) => ({ $regex: value, $options: 'i' })
      },
      'relatedDocument.documentType': 'relatedDocument.documentType',
      'relatedDocument.documentId': 'relatedDocument.documentId',
      'relatedDocument.documentCode': 'relatedDocument.documentCode',
      requestedBy: 'requestedBy',
      approvedBy: 'approvedBy',
      processedBy: 'processedBy',
      fromDate: {
        field: 'returnDate',
        transform: (value) => ({ $gte: new Date(value) })
      },
      toDate: {
        field: 'returnDate',
        transform: (value) => ({ $lte: new Date(value) })
      },
      processed: {
        field: 'processedDate',
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
    
    // Get sort parameters with default sort by return date descending
    const sort = APIFeatures.getSort(query, '-returnDate');

    // Execute query
    const returns = await InventoryReturn.find(filter)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate("warehouse", "name warehouseID")
      .populate("items.product", "name productID sku category")
      .populate("requestedBy", "fullName email username")
      .populate("approvedBy", "fullName email username")
      .populate("processedBy", "fullName email username");

    // Get total count for pagination
    const total = await InventoryReturn.countDocuments(filter);

    return {
      returns,
      pagination: APIFeatures.paginationResult(total, pagination)
    };
  } catch (error) {
    logger.error("Error in getAllInventoryReturnsService:", error);
    throw error;
  }
};

/**
 * Get inventory return by MongoDB ID
 */
const getInventoryReturnByIdService = async (id) => {
  try {
    return await InventoryReturn.findById(id)
      .populate("warehouse", "name warehouseID")
      .populate("items.product", "name productID sku category")
      .populate("requestedBy", "fullName email username")
      .populate("approvedBy", "fullName email username")
      .populate("processedBy", "fullName email username");
  } catch (error) {
    logger.error(`Error in getInventoryReturnByIdService for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get inventory return by return ID (RET-XXXXX format)
 */
const getInventoryReturnByReturnIDService = async (returnID) => {
  try {
    return await InventoryReturn.findOne({ returnID })
      .populate("warehouse", "name warehouseID")
      .populate("items.product", "name productID sku category")
      .populate("requestedBy", "fullName email username")
      .populate("approvedBy", "fullName email username")
      .populate("processedBy", "fullName email username");
  } catch (error) {
    logger.error(`Error in getInventoryReturnByReturnIDService for returnID ${returnID}:`, error);
    throw error;
  }
};

/**
 * Get inventory returns by warehouse
 */
const getInventoryReturnsByWarehouseService = async (warehouseId, query = {}) => {
  try {
    // Use our pagination and sorting utilities
    const pagination = APIFeatures.getPagination(query);
    const sort = APIFeatures.getSort(query, '-returnDate');
    
    // Create the warehouse filter
    const filter = { warehouse: warehouseId };
    
    // Apply any additional filters from query
    const additionalFilters = APIFeatures.buildFilter(query, {
      status: 'status',
      sourceType: 'sourceType',
      fromDate: {
        field: 'returnDate',
        transform: (value) => ({ $gte: new Date(value) })
      },
      toDate: {
        field: 'returnDate',
        transform: (value) => ({ $lte: new Date(value) })
      }
    });
    
    // Combine filters
    const combinedFilter = { ...filter, ...additionalFilters };
    
    // Execute query with pagination and sorting
    const returns = await InventoryReturn.find(combinedFilter)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate("warehouse", "name warehouseID")
      .populate("items.product", "name productID sku category")
      .populate("requestedBy", "fullName email username")
      .populate("approvedBy", "fullName email username")
      .populate("processedBy", "fullName email username");
    
    // Get total count for pagination
    const total = await InventoryReturn.countDocuments(combinedFilter);

    return {
      returns,
      pagination: APIFeatures.paginationResult(total, pagination)
    };
  } catch (error) {
    logger.error(`Error in getInventoryReturnsByWarehouseService for warehouse ${warehouseId}:`, error);
    throw error;
  }
};

/**
 * Get inventory returns by source type and source ID
 */
const getInventoryReturnsBySourceService = async (sourceType, sourceId, query = {}) => {
  try {
    // Use our pagination and sorting utilities
    const pagination = APIFeatures.getPagination(query);
    const sort = APIFeatures.getSort(query, '-returnDate');
    
    // Create the source filter
    let filter = { sourceType };
    if (sourceId) {
      filter["source.sourceId"] = sourceId;
    }
    
    // Apply any additional filters from query
    const additionalFilters = APIFeatures.buildFilter(query, {
      status: 'status',
      warehouse: 'warehouse',
      fromDate: {
        field: 'returnDate',
        transform: (value) => ({ $gte: new Date(value) })
      },
      toDate: {
        field: 'returnDate',
        transform: (value) => ({ $lte: new Date(value) })
      }
    });
    
    // Combine filters
    const combinedFilter = { ...filter, ...additionalFilters };
    
    // Execute query with pagination and sorting
    const returns = await InventoryReturn.find(combinedFilter)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate("warehouse", "name warehouseID")
      .populate("items.product", "name productID sku category")
      .populate("requestedBy", "fullName email username")
      .populate("approvedBy", "fullName email username")
      .populate("processedBy", "fullName email username");
    
    // Get total count for pagination
    const total = await InventoryReturn.countDocuments(combinedFilter);

    return {
      returns,
      pagination: APIFeatures.paginationResult(total, pagination)
    };
  } catch (error) {
    logger.error(`Error in getInventoryReturnsBySourceService for sourceType ${sourceType}:`, error);
    throw error;
  }
};

/**
 * Get inventory returns by status
 */
const getInventoryReturnsByStatusService = async (status, query = {}) => {
  try {
    // Use our pagination and sorting utilities
    const pagination = APIFeatures.getPagination(query);
    const sort = APIFeatures.getSort(query, '-returnDate');
    
    // Create the status filter
    const filter = { status };
    
    // Apply any additional filters from query
    const additionalFilters = APIFeatures.buildFilter(query, {
      sourceType: 'sourceType',
      warehouse: 'warehouse',
      fromDate: {
        field: 'returnDate',
        transform: (value) => ({ $gte: new Date(value) })
      },
      toDate: {
        field: 'returnDate',
        transform: (value) => ({ $lte: new Date(value) })
      }
    });
    
    // Combine filters
    const combinedFilter = { ...filter, ...additionalFilters };
    
    // Execute query with pagination and sorting
    const returns = await InventoryReturn.find(combinedFilter)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate("warehouse", "name warehouseID")
      .populate("items.product", "name productID sku category")
      .populate("requestedBy", "fullName email username")
      .populate("approvedBy", "fullName email username")
      .populate("processedBy", "fullName email username");
    
    // Get total count for pagination
    const total = await InventoryReturn.countDocuments(combinedFilter);

    return {
      returns,
      pagination: APIFeatures.paginationResult(total, pagination)
    };
  } catch (error) {
    logger.error(`Error in getInventoryReturnsByStatusService for status ${status}:`, error);
    throw error;
  }
};

/**
 * Create a new inventory return
 */
const createInventoryReturnService = async (returnData) => {
  try {
    // Generate return ID if not provided
    if (!returnData.returnID) {
      returnData.returnID = await generateReturnId();
    }
    
    // Create and save the return
    const inventoryReturn = new InventoryReturn(returnData);
    const savedReturn = await inventoryReturn.save();
    
    // Return the populated return
    return await InventoryReturn.findById(savedReturn._id)
      .populate("warehouse", "name warehouseID")
      .populate("items.product", "name productID sku category")
      .populate("requestedBy", "fullName email username")
      .populate("approvedBy", "fullName email username")
      .populate("processedBy", "fullName email username");
  } catch (error) {
    logger.error("Error in createInventoryReturnService:", error);
    throw error;
  }
};

/**
 * Update an inventory return
 */
const updateInventoryReturnService = async (id, updateData) => {
  try {
    // Prevent updating certain fields if return has already been approved or processed
    const existingReturn = await InventoryReturn.findById(id);
    if (!existingReturn) {
      return null;
    }
    
    if (existingReturn.status !== "Draft" && existingReturn.status !== "Pending") {
      // If status is not Draft or Pending, only allow updating status, notes, and specific fields
      const allowedFields = ['status', 'notes'];
      const updateKeys = Object.keys(updateData);
      
      for (const key of updateKeys) {
        if (!allowedFields.includes(key)) {
          delete updateData[key];
        }
      }
    }
    
    const updatedReturn = await InventoryReturn.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate("warehouse", "name warehouseID")
      .populate("items.product", "name productID sku category")
      .populate("requestedBy", "fullName email username")
      .populate("approvedBy", "fullName email username")
      .populate("processedBy", "fullName email username");
      
    return updatedReturn;
  } catch (error) {
    logger.error(`Error in updateInventoryReturnService for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Approve an inventory return - changes status to Approved
 */
const approveInventoryReturnService = async (id, approvalData) => {
  try {
    const existingReturn = await InventoryReturn.findById(id);
    
    if (!existingReturn) {
      return null;
    }
    
    // Can only approve returns that are in Pending status
    if (existingReturn.status !== "Pending") {
      throw new Error(`Cannot approve return in ${existingReturn.status} status. Return must be in Pending status.`);
    }
    
    // Update return with approval data
    const updateData = {
      status: "Approved",
      approvedBy: approvalData.approvedBy,
      notes: approvalData.notes || existingReturn.notes
    };
    
    const approvedReturn = await InventoryReturn.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate("warehouse", "name warehouseID")
      .populate("items.product", "name productID sku category")
      .populate("requestedBy", "fullName email username")
      .populate("approvedBy", "fullName email username")
      .populate("processedBy", "fullName email username");
      
    return approvedReturn;
  } catch (error) {
    logger.error(`Error in approveInventoryReturnService for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Process an inventory return - creates inventory transactions and changes status to Completed
 */
const processInventoryReturnService = async (id, processData) => {
  try {
    const existingReturn = await InventoryReturn.findById(id)
      .populate("items.product")
      .populate("warehouse");
    
    if (!existingReturn) {
      return null;
    }
    
    // Can only process returns that are in Approved status
    if (existingReturn.status !== "Approved") {
      throw new Error(`Cannot process return in ${existingReturn.status} status. Return must be in Approved status.`);
    }
    
    // Create inventory transactions for each item based on action
    const session = await InventoryReturn.startSession();
    let processedReturn;
    
    await session.withTransaction(async () => {
      // Process each item in the return
      for (const item of existingReturn.items) {
        // Handle inventory changes based on item action
        if (item.action === "Return to Stock") {
          // Find inventory item
          const inventory = await Inventory.findOne({
            product: item.product._id,
            warehouse: existingReturn.warehouse._id
          });
          
          if (!inventory) {
            throw new Error(`No inventory record found for product ${item.product.name} in warehouse ${existingReturn.warehouse.name}`);
          }
          
          // Create transaction for adding item back to inventory
          const transactionData = {
            transactionID: await generateTransactionId(),
            inventory: inventory._id,
            product: item.product._id,
            warehouse: existingReturn.warehouse._id,
            transactionType: "Return",
            quantityBefore: inventory.quantity,
            quantityChange: item.quantity,
            quantityAfter: inventory.quantity + item.quantity,
            reference: {
              documentType: "Return",
              documentId: existingReturn._id,
              documentCode: existingReturn.returnID
            },
            performedBy: processData.processedBy,
            notes: `Return processed: ${item.reason}, ${item.condition}, ${item.notes || ''}`
          };
          
          // Create transaction and update inventory
          await InventoryTransaction.create([transactionData], { session });
          await Inventory.findByIdAndUpdate(
            inventory._id,
            { 
              quantity: inventory.quantity + item.quantity,
              lastStockCheck: new Date()
            },
            { session }
          );
        }
        // Handle other actions: Return to Supplier, Dispose, Repair, Pending Inspection
        // These may not require inventory adjustments but should be logged
        else {
          // Create transaction just for record keeping without inventory adjustment
          const transactionData = {
            transactionID: await generateTransactionId(),
            product: item.product._id,
            warehouse: existingReturn.warehouse._id,
            transactionType: "Return",
            quantityBefore: 0, // No inventory affected
            quantityChange: 0, // No quantity change
            quantityAfter: 0, // No inventory affected
            reference: {
              documentType: "Return",
              documentId: existingReturn._id,
              documentCode: existingReturn.returnID
            },
            performedBy: processData.processedBy,
            notes: `Return processed: ${item.action}, ${item.reason}, ${item.condition}, ${item.notes || ''}`
          };
          
          // Create transaction for record keeping
          await InventoryTransaction.create([transactionData], { session });
        }
      }
      
      // Update return with processing data
      const updateData = {
        status: "Completed",
        processedBy: processData.processedBy,
        processedDate: new Date(),
        notes: processData.notes || existingReturn.notes
      };
      
      processedReturn = await InventoryReturn.findByIdAndUpdate(
        id,
        updateData,
        { 
          new: true,
          session 
        }
      )
        .populate("warehouse", "name warehouseID")
        .populate("items.product", "name productID sku category")
        .populate("requestedBy", "fullName email username")
        .populate("approvedBy", "fullName email username")
        .populate("processedBy", "fullName email username");
    });
    
    await session.endSession();
    return processedReturn;
  } catch (error) {
    logger.error(`Error in processInventoryReturnService for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete an inventory return
 */
const deleteInventoryReturnService = async (id) => {
  try {
    // Check if the return can be deleted (only Draft or Cancelled status)
    const existingReturn = await InventoryReturn.findById(id);
    if (existingReturn && 
        existingReturn.status !== "Draft" && 
        existingReturn.status !== "Cancelled") {
      throw new Error(`Cannot delete return in ${existingReturn.status} status. Only returns in Draft or Cancelled status can be deleted.`);
    }
    
    return await InventoryReturn.deleteOne({ _id: id });
  } catch (error) {
    logger.error(`Error in deleteInventoryReturnService for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete all inventory returns
 */
const deleteAllInventoryReturnsService = async () => {
  try {
    return await InventoryReturn.deleteMany({});
  } catch (error) {
    logger.error("Error in deleteAllInventoryReturnsService:", error);
    throw error;
  }
};

module.exports = {
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
};
