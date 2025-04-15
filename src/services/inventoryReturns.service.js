const InventoryReturn = require("../models/return.model");
const { createLogger } = require("../utils/logger");
const APIFeatures = require("../utils/apiFeatures");

const logger = createLogger("InventoryReturnsService");
const { generateReturnId } = require("../utils/inventoryReturn.utils.js");

/**
 * Get all inventory returns with pagination and filtering
 */
const getAllReturnsService = async (query = {}) => {
  logger.debug("getAllReturnsService called with query:", query);
  
  // Define custom filters mapping
  const customFilters = {
    supplier: 'supplier',
    warehouse: 'warehouse',
    status: 'status',
    reason: 'reason',
    fromDate: {
      field: 'returnDate',
      transform: (value) => ({ $gte: new Date(value) })
    },
    toDate: {
      field: 'returnDate',
      transform: (value) => ({ $lte: new Date(value + 'T23:59:59.999Z') })
    }
  };
  
  // Build filter using APIFeatures utility
  const filter = APIFeatures.buildFilter(query, customFilters);
  
  // Get pagination parameters
  const pagination = APIFeatures.getPagination(query);
  
  // Get sort parameters with default sort by name
  const sort = APIFeatures.getSort(query, '-returnDate');

  // Execute query with pagination and sorting
  const returns = await InventoryReturn.find(filter)
    .sort(sort)
    .skip(pagination.skip)
    .limit(pagination.limit)
    .populate('supplier', 'name')
    .populate('warehouse', 'name location')
    .populate('items.product', 'name sku')
    .populate('createdBy', 'fullName email')
    .populate('approvedBy', 'fullName email')
    .populate('completedBy', 'fullName email');
  
  // Get total count for pagination
  const total = await InventoryReturn.countDocuments(filter);
  
  return {
    returns,
    pagination: APIFeatures.paginationResult(total, pagination)
  };
};

/**
 * Get inventory return by MongoDB ID
 */
const getReturnByIdService = async (id) => {
  logger.debug(`getReturnByIdService called with ID: ${id}`);
  
  return await InventoryReturn.findById(id)
    .populate('supplier', 'name')
    .populate('warehouse', 'name location')
    .populate('items.product', 'name sku')
    .populate('createdBy', 'fullName email')
    .populate('approvedBy', 'fullName email')
    .populate('completedBy', 'fullName email');
};

/**
 * Get inventory return by return ID (RET-XXXXX format)
 */
const getReturnByReturnIDService = async (returnID) => {
  logger.debug(`getReturnByReturnIDService called with returnID: ${returnID}`);
  
  return await InventoryReturn.findOne({ returnID })
    .populate('supplier', 'name')
    .populate('warehouse', 'name location')
    .populate('items.product', 'name sku')
    .populate('createdBy', 'fullName email')
    .populate('approvedBy', 'fullName email')
    .populate('completedBy', 'fullName email');
};

/**
 * Get returns by supplier
 */
const getReturnsBySupplierService = async (supplierId, query = {}) => {
  logger.debug(`getReturnsBySupplierService called with supplierId: ${supplierId}`);
  
  // Get pagination and sorting parameters
  const pagination = APIFeatures.getPagination(query);
  const sort = APIFeatures.getSort(query, '-returnDate');
  
  // Set base filter
  const filter = { supplier: supplierId };
  
  // Add additional filters from query
  const customFilters = {
    status: 'status',
    reason: 'reason',
    fromDate: {
      field: 'returnDate',
      transform: (value) => ({ $gte: new Date(value) })
    },
    toDate: {
      field: 'returnDate',
      transform: (value) => ({ $lte: new Date(value + 'T23:59:59.999Z') })
    }
  };
  
  const additionalFilters = APIFeatures.buildFilter(query, customFilters);
  Object.assign(filter, additionalFilters);
  
  // Execute query with pagination and sorting
  const returns = await InventoryReturn.find(filter)
    .sort(sort)
    .skip(pagination.skip)
    .limit(pagination.limit)
    .populate('supplier', 'name')
    .populate('warehouse', 'name location')
    .populate('items.product', 'name sku')
    .populate('createdBy', 'fullName email')
    .populate('approvedBy', 'fullName email')
    .populate('completedBy', 'fullName email');
  
  // Get total count for pagination
  const total = await InventoryReturn.countDocuments(filter);
  
  return {
    returns,
    pagination: APIFeatures.paginationResult(total, pagination)
  };
};

/**
 * Get returns by warehouse
 */
const getReturnsByWarehouseService = async (warehouseId, query = {}) => {
  logger.debug(`getReturnsByWarehouseService called with warehouseId: ${warehouseId}`);
  
  // Get pagination and sorting parameters
  const pagination = APIFeatures.getPagination(query);
  const sort = APIFeatures.getSort(query, '-returnDate');
  
  // Set base filter
  const filter = { warehouse: warehouseId };
  
  // Add additional filters from query
  const customFilters = {
    supplier: 'supplier',
    status: 'status',
    reason: 'reason',
    fromDate: {
      field: 'returnDate',
      transform: (value) => ({ $gte: new Date(value) })
    },
    toDate: {
      field: 'returnDate',
      transform: (value) => ({ $lte: new Date(value + 'T23:59:59.999Z') })
    }
  };
  
  const additionalFilters = APIFeatures.buildFilter(query, customFilters);
  Object.assign(filter, additionalFilters);
  
  // Execute query with pagination and sorting
  const returns = await InventoryReturn.find(filter)
    .sort(sort)
    .skip(pagination.skip)
    .limit(pagination.limit)
    .populate('supplier', 'name')
    .populate('warehouse', 'name location')
    .populate('items.product', 'name sku')
    .populate('createdBy', 'fullName email')
    .populate('approvedBy', 'fullName email')
    .populate('completedBy', 'fullName email');
  
  // Get total count for pagination
  const total = await InventoryReturn.countDocuments(filter);
  
  return {
    returns,
    pagination: APIFeatures.paginationResult(total, pagination)
  };
};

/**
 * Get returns by date range
 */
const getReturnsByDateRangeService = async (startDate, endDate, query = {}) => {
  logger.debug(`getReturnsByDateRangeService called with dates: ${startDate} to ${endDate}`);
  
  // Get pagination and sorting parameters
  const pagination = APIFeatures.getPagination(query);
  const sort = APIFeatures.getSort(query, '-returnDate');
  
  // Set date range filter
  const filter = {
    returnDate: {
      $gte: startDate,
      $lte: new Date(endDate.setHours(23, 59, 59, 999))
    }
  };
  
  // Add additional filters from query
  const customFilters = {
    supplier: 'supplier',
    warehouse: 'warehouse',
    status: 'status',
    reason: 'reason'
  };
  
  const additionalFilters = APIFeatures.buildFilter(query, customFilters);
  Object.assign(filter, additionalFilters);
  
  // Execute query with pagination and sorting
  const returns = await InventoryReturn.find(filter)
    .sort(sort)
    .skip(pagination.skip)
    .limit(pagination.limit)
    .populate('supplier', 'name')
    .populate('warehouse', 'name location')
    .populate('items.product', 'name sku')
    .populate('createdBy', 'fullName email')
    .populate('approvedBy', 'fullName email')
    .populate('completedBy', 'fullName email');
  
  // Get total count for pagination
  const total = await InventoryReturn.countDocuments(filter);
  
  return {
    returns,
    pagination: APIFeatures.paginationResult(total, pagination)
  };
};

/**
 * Get returns by status
 */
const getReturnsByStatusService = async (status, query = {}) => {
  logger.debug(`getReturnsByStatusService called with status: ${status}`);
  
  // Get pagination and sorting parameters
  const pagination = APIFeatures.getPagination(query);
  const sort = APIFeatures.getSort(query, '-returnDate');
  
  // Set base filter
  const filter = { status };
  
  // Add additional filters from query
  const customFilters = {
    supplier: 'supplier',
    warehouse: 'warehouse',
    reason: 'reason',
    fromDate: {
      field: 'returnDate',
      transform: (value) => ({ $gte: new Date(value) })
    },
    toDate: {
      field: 'returnDate',
      transform: (value) => ({ $lte: new Date(value + 'T23:59:59.999Z') })
    }
  };
  
  const additionalFilters = APIFeatures.buildFilter(query, customFilters);
  Object.assign(filter, additionalFilters);
  
  // Execute query with pagination and sorting
  const returns = await InventoryReturn.find(filter)
    .sort(sort)
    .skip(pagination.skip)
    .limit(pagination.limit)
    .populate('supplier', 'name')
    .populate('warehouse', 'name location')
    .populate('items.product', 'name sku')
    .populate('createdBy', 'fullName email')
    .populate('approvedBy', 'fullName email')
    .populate('completedBy', 'fullName email');
  
  // Get total count for pagination
  const total = await InventoryReturn.countDocuments(filter);
  
  return {
    returns,
    pagination: APIFeatures.paginationResult(total, pagination)
  };
};

/**
 * Create a new inventory return
 */
const createReturnService = async (returnData) => {
  logger.debug("createReturnService called with data:", returnData);
  
  // Generate return ID
  returnData.returnID = await generateReturnId();
  logger.debug(`Generated returnID: ${returnData.returnID}`);
  
  // Set return date if not provided
  if (!returnData.returnDate) {
    returnData.returnDate = new Date();
  }
  
  // Create and save the return
  const inventoryReturn = new InventoryReturn(returnData);
  return await inventoryReturn.save();
};

/**
 * Update inventory return
 */
const updateReturnService = async (id, updateData) => {
  logger.debug(`updateReturnService called with ID: ${id}`, updateData);
  
  // Apply updates
  return await InventoryReturn.findByIdAndUpdate(
    id, 
    { ...updateData, updatedAt: Date.now() }, 
    { new: true, runValidators: true }
  ).populate('supplier', 'name')
    .populate('warehouse', 'name location')
    .populate('items.product', 'name sku')
    .populate('createdBy', 'fullName email')
    .populate('approvedBy', 'fullName email')
    .populate('completedBy', 'fullName email');
};

/**
 * Approve an inventory return
 */
const approveReturnService = async (id, approvalData) => {
  logger.debug(`approveReturnService called with ID: ${id}`, approvalData);
  
  // Apply approval
  const updates = {
    status: 'Approved',
    approvedBy: approvalData.approvedBy,
    approvalDate: new Date(),
    approvalNotes: approvalData.approvalNotes || '',
    updatedAt: Date.now()
  };
  
  return await InventoryReturn.findByIdAndUpdate(
    id, 
    updates, 
    { new: true, runValidators: true }
  ).populate('supplier', 'name')
    .populate('warehouse', 'name location')
    .populate('items.product', 'name sku')
    .populate('createdBy', 'fullName email')
    .populate('approvedBy', 'fullName email')
    .populate('completedBy', 'fullName email');
};

/**
 * Mark an inventory return as completed
 */
const completeReturnService = async (id, completionData) => {
  logger.debug(`completeReturnService called with ID: ${id}`, completionData);
  
  // Apply completion
  const updates = {
    status: 'Completed',
    completedBy: completionData.completedBy,
    completionDate: new Date(),
    completionNotes: completionData.completionNotes || '',
    updatedAt: Date.now()
  };
  
  return await InventoryReturn.findByIdAndUpdate(
    id, 
    updates, 
    { new: true, runValidators: true }
  ).populate('supplier', 'name')
    .populate('warehouse', 'name location')
    .populate('items.product', 'name sku')
    .populate('createdBy', 'fullName email')
    .populate('approvedBy', 'fullName email')
    .populate('completedBy', 'fullName email');
};

/**
 * Delete inventory return
 */
const deleteReturnService = async (id) => {
  logger.debug(`deleteReturnService called with ID: ${id}`);
  return await InventoryReturn.deleteOne({ _id: id });
};

/**
 * Delete all inventory returns
 */
const deleteAllReturnsService = async () => {
  logger.debug("deleteAllReturnsService called");
  // For safety, do not delete completed returns
  return await InventoryReturn.deleteMany({ status: { $ne: 'Completed' } });
};

module.exports = {
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
};
