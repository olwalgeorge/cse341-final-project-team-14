const Warehouse = require("../models/warehouse.model");
const logger = require("../utils/logger");
const APIFeatures = require("../utils/apiFeatures");

/**
 * Get all warehouses with filtering, pagination, and sorting
 */
const getAllWarehousesService = async (query = {}) => {
  logger.debug("getAllWarehousesService called with query:", query);
  
  try {
    // Define custom filters mapping
    const customFilters = {
      name: {
        field: 'name',
        transform: (value) => ({ $regex: value, $options: 'i' })
      },
      status: 'status',
      minCapacity: {
        field: 'capacity',
        transform: (value) => ({ $gte: parseInt(value) })
      },
      maxCapacity: {
        field: 'capacity',
        transform: (value) => ({ $lte: parseInt(value) })
      },
      street: {
        field: 'address.street',
        transform: (value) => ({ $regex: value, $options: 'i' })
      },
      city: {
        field: 'address.city',
        transform: (value) => ({ $regex: value, $options: 'i' })
      },
      state: {
        field: 'address.state',
        transform: (value) => ({ $regex: value, $options: 'i' })
      },
      postalCode: 'address.postalCode',
      country: {
        field: 'address.country',
        transform: (value) => ({ $regex: value, $options: 'i' })
      },
      contactName: {
        field: 'contact.name',
        transform: (value) => ({ $regex: value, $options: 'i' })
      },
      contactEmail: {
        field: 'contact.email',
        transform: (value) => ({ $regex: value, $options: 'i' })
      },
      contactPhone: 'contact.phone'
    };
    
    // Build filter using APIFeatures utility
    const filter = APIFeatures.buildFilter(query, customFilters);
    
    // Get pagination parameters
    const pagination = APIFeatures.getPagination(query);
    
    // Get sort parameters with default sort by name
    const sort = APIFeatures.getSort(query, 'name');

    // Execute query with pagination and sorting
    const warehouses = await Warehouse.find(filter)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit);
    
    // Get total count for pagination
    const total = await Warehouse.countDocuments(filter);
    
    return {
      warehouses,
      pagination: APIFeatures.paginationResult(total, pagination)
    };
  } catch (error) {
    logger.error("Error in getAllWarehousesService:", error);
    throw error;
  }
};

/**
 * Get warehouse by MongoDB ID
 */
const getWarehouseByIdService = async (warehouse_Id) => {
  logger.debug(`getWarehouseByIdService called with warehouse_Id: ${warehouse_Id}`);
  return await Warehouse.findById(warehouse_Id);
};

/**
 * Get warehouse by warehouse ID (WH-XXXXX format)
 */
const getWarehouseByWarehouseIDService = async (warehouseID) => {
  logger.debug(`getWarehouseByWarehouseIDService called with warehouseID: ${warehouseID}`);
  return await Warehouse.findOne({ warehouseID: warehouseID });
};

/**
 * Get warehouse by name
 */
const getWarehouseByNameService = async (name) => {
  logger.debug(`getWarehouseByNameService called with name: ${name}`);
  return await Warehouse.findOne({ name: name });
};

/**
 * Create a new warehouse
 */
const createWarehouseService = async (warehouseData) => {
  logger.debug("createWarehouseService called with data:", warehouseData);
  const warehouse = new Warehouse(warehouseData);
  return await warehouse.save();
};

/**
 * Update warehouse by MongoDB ID
 */
const updateWarehouseService = async (warehouse_Id, updateData) => {
  logger.debug(`updateWarehouseService called with warehouse_Id: ${warehouse_Id}`, updateData);
  return await Warehouse.findByIdAndUpdate(warehouse_Id, updateData, { 
    new: true,
    runValidators: true  // Ensure validators run on update
  });
};

/**
 * Delete warehouse by MongoDB ID
 */
const deleteWarehouseService = async (warehouse_Id) => {
  logger.debug(`deleteWarehouseService called with warehouse_Id: ${warehouse_Id}`);
  return await Warehouse.deleteOne({ _id: warehouse_Id });
};

/**
 * Delete all warehouses
 */
const deleteAllWarehousesService = async () => {
  logger.debug("deleteAllWarehousesService called");
  return await Warehouse.deleteMany({});
};

/**
 * Search warehouses by term (name, city, country, etc.)
 */
const searchWarehousesService = async (searchTerm, query = {}) => {
  logger.debug(`searchWarehousesService called with term: ${searchTerm}`);
  
  try {
    // Get pagination parameters
    const pagination = APIFeatures.getPagination(query);
    
    // Get sort parameters with default sort by name
    const sort = APIFeatures.getSort(query, 'name');

    // Create text search criteria
    const searchCriteria = {
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { 'address.city': { $regex: searchTerm, $options: 'i' } },
        { 'address.state': { $regex: searchTerm, $options: 'i' } },
        { 'address.country': { $regex: searchTerm, $options: 'i' } },
        { 'contact.name': { $regex: searchTerm, $options: 'i' } }
      ]
    };

    // Execute search query with pagination and sorting
    const warehouses = await Warehouse.find(searchCriteria)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit);
    
    // Get total count for pagination
    const total = await Warehouse.countDocuments(searchCriteria);
    
    return {
      warehouses,
      pagination: APIFeatures.paginationResult(total, pagination)
    };
  } catch (error) {
    logger.error("Error in searchWarehousesService:", error);
    throw error;
  }
};

module.exports = {
  getAllWarehousesService,
  getWarehouseByIdService,
  getWarehouseByWarehouseIDService,
  getWarehouseByNameService,
  createWarehouseService,
  updateWarehouseService,
  deleteWarehouseService,
  deleteAllWarehousesService,
  searchWarehousesService
};
