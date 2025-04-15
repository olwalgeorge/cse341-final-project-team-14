const Supplier = require("../models/supplier.model");
const { createLogger } = require("../utils/logger");
const APIFeatures = require("../utils/apiFeatures.js");
const logger = createLogger("SuppliersService");
const { generateSupplierId } = require("../utils/supplier.utils.js");

/**
 * Get all suppliers with pagination and filtering
 */
const getAllSuppliersService = async (query = {}) => {
  logger.debug("getAllSuppliersService called with query:", query);
  
  try {
    // Define custom filters mapping
    const customFilters = {
      name: {
        field: 'name',
        transform: (value) => ({ $regex: value, $options: 'i' })
      },
      email: {
        field: 'contact.email',
        transform: (value) => ({ $regex: value, $options: 'i' })
      },
      phone: {
        field: 'contact.phone',
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
      status: 'status'
    };
    
    // Build filter using APIFeatures utility
    const filter = APIFeatures.buildFilter(query, customFilters);
    
    // Get pagination parameters
    const pagination = APIFeatures.getPagination(query);
    
    // Get sort parameters with default sort by name
    const sort = APIFeatures.getSort(query, 'name');

    // Execute query with pagination and sorting
    const suppliers = await Supplier.find(filter)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit);
    
    // Get total count for pagination
    const total = await Supplier.countDocuments(filter);
    
    return {
      suppliers,
      pagination: APIFeatures.paginationResult(total, pagination)
    };
  } catch (error) {
    logger.error("Error in getAllSuppliersService:", error);
    throw error;
  }
};

/**
 * Get supplier by MongoDB ID
 */
const getSupplierByIdService = async (id) => {
  logger.debug(`getSupplierByIdService called with ID: ${id}`);
  try {
    return await Supplier.findById(id);
  } catch (error) {
    logger.error(`Error in getSupplierByIdService for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get supplier by supplier ID (SP-XXXXX format)
 */
const getSupplierBySupplierIDService = async (supplierID) => {
  logger.debug(`getSupplierBySupplierIDService called with supplierID: ${supplierID}`);
  
  try {
    return await Supplier.findOne({ supplierID });
  } catch (error) {
    logger.error(`Error in getSupplierBySupplierIDService for supplierID ${supplierID}:`, error);
    throw error;
  }
};

/**
 * Get supplier by email
 */
const getSupplierByEmailService = async (email) => {
  logger.debug(`getSupplierByEmailService called with email: ${email}`);
  
  try {
    return await Supplier.findOne({ "contact.email": email });
  } catch (error) {
    logger.error(`Error in getSupplierByEmailService for email ${email}:`, error);
    throw error;
  }
};

/**
 * Search suppliers by term
 */
const searchSuppliersService = async (searchTerm, query = {}) => {
  logger.debug(`searchSuppliersService called with term: ${searchTerm}`);
  
  try {
    // Get pagination parameters
    const pagination = APIFeatures.getPagination(query);
    
    // Get sort parameters with default sort by name
    const sort = APIFeatures.getSort(query, 'name');

    // Create text search criteria
    const searchCriteria = {
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { "contact.email": { $regex: searchTerm, $options: 'i' } },
        { "contact.phone": { $regex: searchTerm, $options: 'i' } },
        { supplierID: { $regex: searchTerm, $options: 'i' } },
        { "address.street": { $regex: searchTerm, $options: 'i' } },
        { "address.city": { $regex: searchTerm, $options: 'i' } },
        { "address.state": { $regex: searchTerm, $options: 'i' } },
        { "address.country": { $regex: searchTerm, $options: 'i' } }
      ]
    };

    // Execute search query with pagination and sorting
    const suppliers = await Supplier.find(searchCriteria)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit);
    
    // Get total count for pagination
    const total = await Supplier.countDocuments(searchCriteria);
    
    return {
      suppliers,
      pagination: APIFeatures.paginationResult(total, pagination)
    };
  } catch (error) {
    logger.error(`Error in searchSuppliersService for term ${searchTerm}:`, error);
    throw error;
  }
};

/**
 * Create a new supplier
 */
const createSupplierService = async (supplierData) => {
  logger.debug("createSupplierService called with data:", supplierData);
  try {
    // Generate supplier ID if not provided
    if (!supplierData.supplierID) {
      supplierData.supplierID = await generateSupplierId();
      logger.debug(`Generated supplierID: ${supplierData.supplierID}`);
    }
    
    const supplier = new Supplier(supplierData);
    return await supplier.save();
  } catch (error) {
    logger.error("Error in createSupplierService:", error);
    throw error;
  }
};

/**
 * Update supplier by ID
 */
const updateSupplierService = async (id, updateData) => {
  logger.debug(`updateSupplierService called with ID: ${id}`, updateData);
  try {
    // Prevent updating supplierID
    if (updateData.supplierID) {
      delete updateData.supplierID;
    }
    
    return await Supplier.findByIdAndUpdate(
      id, 
      { ...updateData, updatedAt: Date.now() }, 
      { new: true, runValidators: true }
    );
  } catch (error) {
    logger.error(`Error in updateSupplierService for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete supplier by ID
 */
const deleteSupplierService = async (id) => {
  logger.debug(`deleteSupplierService called with ID: ${id}`);
  try {
    return await Supplier.deleteOne({ _id: id });
  } catch (error) {
    logger.error(`Error in deleteSupplierService for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete all suppliers
 */
const deleteAllSuppliersService = async () => {
  logger.debug("deleteAllSuppliersService called");
  try {
    return await Supplier.deleteMany({});
  } catch (error) {
    logger.error("Error in deleteAllSuppliersService:", error);
    throw error;
  }
};

module.exports = {
  getAllSuppliersService,
  getSupplierByIdService,
  getSupplierBySupplierIDService,
  getSupplierByEmailService,
  searchSuppliersService,
  createSupplierService,
  updateSupplierService,
  deleteSupplierService,
  deleteAllSuppliersService,
};
