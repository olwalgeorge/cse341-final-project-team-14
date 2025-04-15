const Warehouse = require("../models/warehouse.model");
const { createLogger } = require("../utils/logger");
const logger = createLogger("WarehouseService");
const APIFeatures = require("../utils/apiFeatures.js");
const { generateWarehouseId } = require("../utils/warehouse.utils.js");

/**
 * Get all warehouses with pagination and filtering
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
      city: {
        field: 'address.city',
        transform: (value) => ({ $regex: value, $options: 'i' })
      },
      state: {
        field: 'address.state',
        transform: (value) => ({ $regex: value, $options: 'i' })
      },
      country: {
        field: 'address.country',
        transform: (value) => ({ $regex: value, $options: 'i' })
      },
      postalCode: {
        field: 'address.postalCode',
        transform: (value) => ({ $regex: value, $options: 'i' })
      },
      minCapacity: {
        field: 'capacity',
        transform: (value) => ({ $gte: parseInt(value) })
      },
      maxCapacity: {
        field: 'capacity',
        transform: (value) => ({ $lte: parseInt(value) })
      },
      type: 'type',
      status: 'status'
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
      .limit(pagination.limit)
      .populate('manager', 'fullName email');
    
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
const getWarehouseByIdService = async (id) => {
  logger.debug(`getWarehouseByIdService called with ID: ${id}`);
  try {
    return await Warehouse.findById(id).populate('manager', 'fullName email');
  } catch (error) {
    logger.error(`Error in getWarehouseByIdService for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get warehouse by name
 */
const getWarehouseByNameService = async (name) => {
  logger.debug(`getWarehouseByNameService called with name: ${name}`);
  
  try {
    return await Warehouse.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    }).populate('manager', 'fullName email');
  } catch (error) {
    logger.error(`Error in getWarehouseByNameService for name ${name}:`, error);
    throw error;
  }
};

/**
 * Get warehouse by warehouse ID (WH-XXXXX format)
 */
const getWarehouseByWarehouseIDService = async (warehouseID) => {
  logger.debug(`getWarehouseByWarehouseIDService called with warehouseID: ${warehouseID}`);
  
  try {
    return await Warehouse.findOne({ warehouseID }).populate('manager', 'fullName email');
  } catch (error) {
    logger.error(`Error in getWarehouseByWarehouseIDService for warehouseID ${warehouseID}:`, error);
    throw error;
  }
};

/**
 * Create a new warehouse
 */
const createWarehouseService = async (warehouseData) => {
  logger.debug("createWarehouseService called with data:", warehouseData);
  try {
    // Generate warehouse ID if not provided
    if (!warehouseData.warehouseID) {
      warehouseData.warehouseID = await generateWarehouseId();
      logger.debug(`Generated warehouseID: ${warehouseData.warehouseID}`);
    }
    
    const warehouse = new Warehouse(warehouseData);
    return await warehouse.save();
  } catch (error) {
    logger.error("Error in createWarehouseService:", error);
    throw error;
  }
};

/**
 * Update warehouse by ID
 */
const updateWarehouseService = async (id, updateData) => {
  logger.debug(`updateWarehouseService called with ID: ${id}`, updateData);
  try {
    // Prevent updating warehouseID
    if (updateData.warehouseID) {
      delete updateData.warehouseID;
    }
    
    return await Warehouse.findByIdAndUpdate(
      id, 
      { ...updateData, updatedAt: Date.now() }, 
      { new: true, runValidators: true }
    ).populate('manager', 'fullName email');
  } catch (error) {
    logger.error(`Error in updateWarehouseService for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete warehouse by ID
 */
const deleteWarehouseService = async (id) => {
  logger.debug(`deleteWarehouseService called with ID: ${id}`);
  try {
    return await Warehouse.deleteOne({ _id: id });
  } catch (error) {
    logger.error(`Error in deleteWarehouseService for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete all warehouses
 */
const deleteAllWarehousesService = async () => {
  logger.debug("deleteAllWarehousesService called");
  try {
    return await Warehouse.deleteMany({});
  } catch (error) {
    logger.error("Error in deleteAllWarehousesService:", error);
    throw error;
  }
};

module.exports = {
  getAllWarehousesService,
  getWarehouseByIdService,
  getWarehouseByNameService,
  getWarehouseByWarehouseIDService,
  createWarehouseService,
  updateWarehouseService,
  deleteWarehouseService,
  deleteAllWarehousesService,
};
