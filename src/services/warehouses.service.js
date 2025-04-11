const Warehouse = require("../models/warehouse.model.js");
const logger = require("../utils/logger.js");
const APIFeatures = require("../utils/apiFeatures.js");

/**
 * Get all warehouses with optional filtering and pagination
 * @param {Object} query - Query parameters for filtering and pagination
 * @returns {Promise<Array>} - Array of warehouse documents
 */
const getAllWarehousesService = async (query = {}) => {
  try {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filter options
    const filter = {};
    if (query.name) {
      filter.name = { $regex: query.name, $options: "i" };
    }
    if (query.status) {
      filter.status = query.status;
    }
    if (query.city) {
      filter["address.city"] = { $regex: query.city, $options: "i" };
    }
    if (query.state) {
      filter["address.state"] = { $regex: query.state, $options: "i" };
    }
    if (query.country) {
      filter["address.country"] = { $regex: query.country, $options: "i" };
    }

    // Sort options
    const sort = {};
    if (query.sort) {
      const sortFields = query.sort.split(",");
      sortFields.forEach((field) => {
        if (field.startsWith("-")) {
          sort[field.substring(1)] = -1;
        } else {
          sort[field] = 1;
        }
      });
    } else {
      sort.createdAt = -1; // Default sort by newest
    }

    // Execute query
    const warehouses = await Warehouse.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("manager", "fullName email userID");

    // Get total count for pagination
    const total = await Warehouse.countDocuments(filter);

    return {
      warehouses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error("Error in getAllWarehousesService:", error);
    throw error;
  }
};

/**
 * Get warehouse by MongoDB ID
 * @param {string} id - Warehouse MongoDB ID
 * @returns {Promise<Object>} - Warehouse document
 */
const getWarehouseByIdService = async (id) => {
  try {
    const warehouse = await Warehouse.findById(id).populate("manager", "fullName email userID");
    return warehouse;
  } catch (error) {
    logger.error(`Error in getWarehouseByIdService for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get warehouse by warehouse ID (WH-XXXXX format)
 * @param {string} warehouseID - Warehouse ID in WH-XXXXX format
 * @returns {Promise<Object>} - Warehouse document
 */
const getWarehouseByWarehouseIDService = async (warehouseID) => {
  try {
    const warehouse = await Warehouse.findOne({ warehouseID }).populate("manager", "fullName email userID");
    return warehouse;
  } catch (error) {
    logger.error(`Error in getWarehouseByWarehouseIDService for warehouseID ${warehouseID}:`, error);
    throw error;
  }
};

/**
 * Get warehouse by name
 * @param {string} name - Warehouse name
 * @returns {Promise<Object>} - Warehouse document
 */
const getWarehouseByNameService = async (name) => {
  try {
    const warehouse = await Warehouse.findOne({ 
      name: { $regex: new RegExp(name, "i") } 
    }).populate("manager", "fullName email userID");
    return warehouse;
  } catch (error) {
    logger.error(`Error in getWarehouseByNameService for name ${name}:`, error);
    throw error;
  }
};

/**
 * Create a new warehouse
 * @param {Object} warehouseData - Data for creating a new warehouse
 * @returns {Promise<Object>} - Created warehouse document
 */
const createWarehouseService = async (warehouseData) => {
  try {
    const warehouse = new Warehouse(warehouseData);
    await warehouse.save();
    return warehouse;
  } catch (error) {
    logger.error("Error in createWarehouseService:", error);
    throw error;
  }
};

/**
 * Update a warehouse by ID
 * @param {string} id - Warehouse MongoDB ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} - Updated warehouse document
 */
const updateWarehouseService = async (id, updateData) => {
  try {
    const warehouse = await Warehouse.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate("manager", "fullName email userID");
    
    return warehouse;
  } catch (error) {
    logger.error(`Error in updateWarehouseService for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a warehouse by ID
 * @param {string} id - Warehouse MongoDB ID
 * @returns {Promise<Object>} - Deletion result
 */
const deleteWarehouseService = async (id) => {
  try {
    const result = await Warehouse.deleteOne({ _id: id });
    return result;
  } catch (error) {
    logger.error(`Error in deleteWarehouseService for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete all warehouses
 * @returns {Promise<Object>} - Deletion result with count
 */
const deleteAllWarehousesService = async () => {
  try {
    const result = await Warehouse.deleteMany({});
    return result;
  } catch (error) {
    logger.error("Error in deleteAllWarehousesService:", error);
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
};
