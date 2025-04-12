const Supplier = require("../models/supplier.model");
const logger = require("../utils/logger");
const APIFeatures = require("../utils/apiFeatures");

// Get all suppliers with filtering, pagination, and sorting
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
      phone: 'contact.phone',
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

// Search suppliers by term
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
        { 'contact.email': { $regex: searchTerm, $options: 'i' } },
        { 'address.city': { $regex: searchTerm, $options: 'i' } },
        { 'address.state': { $regex: searchTerm, $options: 'i' } },
        { 'address.country': { $regex: searchTerm, $options: 'i' } }
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
    logger.error("Error in searchSuppliersService:", error);
    throw error;
  }
};

// Get supplier by ID
const getSupplierByIdService = async (id) => {
  logger.debug(`getSupplierByIdService called with ID: ${id}`);
  return await Supplier.findById(id);
};

// Get supplier by email
const getSupplierByEmailService = async (email) => {
  logger.debug(`getSupplierByEmailService called with email: ${email}`);
  return await Supplier.findOne({ 'contact.email': email });
};

// Get supplier by supplier ID (SP-XXXXX format)
const getSupplierBySupplierIDService = async (supplierID) => {
  logger.debug(`getSupplierBySupplierIDService called with supplier ID: ${supplierID}`);
  return await Supplier.findOne({ supplierID: supplierID });
};

/**
 * Create a new supplier
 * @param {Object} supplierData - The supplier data
 * @returns {Promise<Object>} - The created supplier
 */
const createSupplierService = async (supplierData) => {
  logger.debug("createSupplierService called with data:", supplierData);
  
  // Ensure we're using the correct field name consistently
  if (!supplierData.supplierID) {
    throw new Error("supplierID is required");
  }
  
  const supplier = new Supplier(supplierData);
  return await supplier.save();
};

// Update supplier by ID
const updateSupplierService = async (id, updateData) => {
  logger.debug(`updateSupplierService called with ID: ${id}`, updateData);
  return await Supplier.findByIdAndUpdate(id, updateData, { new: true });
};

// Delete supplier by ID
const deleteSupplierService = async (id) => {
  logger.debug(`deleteSupplierService called with ID: ${id}`);
  return await Supplier.deleteOne({ _id: id });
};

// Delete all suppliers
const deleteAllSuppliersService = async () => {
  logger.debug("deleteAllSuppliersService called");
  return await Supplier.deleteMany({});
};

module.exports = {
  getAllSuppliersService,
  getSupplierByIdService,
  getSupplierBySupplierIDService,
  getSupplierByEmailService,
  createSupplierService,
  updateSupplierService,
  deleteSupplierService,
  deleteAllSuppliersService,
  searchSuppliersService
};
