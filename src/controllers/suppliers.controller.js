const sendResponse = require("../utils/response.js");
const asyncHandler = require("express-async-handler");
const logger = require("../utils/logger.js");
const { ValidationError, DatabaseError } = require("../utils/errors.js");
const {
  getAllSuppliersService,
  getSupplierByIdService,
  getSupplierBySupplierIDService,
  getSupplierByEmailService,
  searchSuppliersService,
  createSupplierService,
  updateSupplierService,
  deleteSupplierService,
  deleteAllSuppliersService,
} = require("../services/suppliers.service.js");
const { transformSupplier } = require("../utils/supplier.utils.js");

/**
 * @desc    Get all suppliers
 * @route   GET /suppliers
 * @access  Private
 */
const getAllSuppliers = asyncHandler(async (req, res, next) => {
  logger.info("getAllSuppliers called");
  logger.debug("Query parameters:", req.query);
  
  try {
    const result = await getAllSuppliersService(req.query);
    
    if (!result.suppliers.length) {
      return sendResponse(res, 200, "No suppliers found", {
        suppliers: [],
        pagination: result.pagination
      });
    }
    
    const transformedSuppliers = result.suppliers.map(transformSupplier);
    sendResponse(
      res,
      200,
      "Suppliers retrieved successfully",
      { suppliers: transformedSuppliers, pagination: result.pagination }
    );
  } catch (error) {
    logger.error("Error retrieving suppliers:", error);
    next(error);
  }
});

/**
 * @desc    Get supplier by MongoDB ID
 * @route   GET /suppliers/:supplier_Id
 * @access  Private
 */
const getSupplierById = asyncHandler(async (req, res, next) => {
  const id = req.params.supplier_Id;
  logger.info(`getSupplierById called with ID: ${id}`);
  
  try {
    const supplier = await getSupplierByIdService(id);
    
    if (!supplier) {
      return next(new DatabaseError('notFound', 'Supplier', id));
    }
    
    const transformedSupplier = transformSupplier(supplier);
    sendResponse(
      res,
      200,
      "Supplier retrieved successfully",
      transformedSupplier
    );
  } catch (error) {
    logger.error(`Error retrieving supplier with ID: ${id}`, error);
    
    // Handle CastError for invalid ObjectId
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return next(new ValidationError('id', id, 'Invalid supplier ID format'));
    }
    
    next(error);
  }
});

/**
 * @desc    Get supplier by supplier ID (SP-XXXXX format)
 * @route   GET /suppliers/supplierID/:supplierID
 * @access  Private
 */
const getSupplierBySupplierID = asyncHandler(async (req, res, next) => {
  const supplierID = req.params.supplierID;
  logger.info(`getSupplierBySupplierID called with supplier ID: ${supplierID}`);
  
  try {
    // Validate supplier ID format
    if (!supplierID.match(/^SP-\d{5}$/)) {
      return next(new ValidationError(
        'supplierID', 
        supplierID, 
        'Supplier ID must be in the format SP-XXXXX where X is a digit'
      ));
    }
    
    const supplier = await getSupplierBySupplierIDService(supplierID);
    
    if (!supplier) {
      return next(new DatabaseError('notFound', 'Supplier', null, { supplierID }));
    }
    
    const transformedSupplier = transformSupplier(supplier);
    sendResponse(
      res,
      200,
      "Supplier retrieved successfully",
      transformedSupplier
    );
  } catch (error) {
    logger.error(`Error retrieving supplier with supplier ID: ${supplierID}`, error);
    next(error);
  }
});

/**
 * @desc    Get supplier by email
 * @route   GET /suppliers/email/:email
 * @access  Private
 */
const getSupplierByEmail = asyncHandler(async (req, res, next) => {
  const email = req.params.email;
  logger.info(`getSupplierByEmail called with email: ${email}`);
  
  try {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(new ValidationError('email', email, 'Invalid email format'));
    }
    
    const supplier = await getSupplierByEmailService(email);
    
    if (!supplier) {
      return next(new DatabaseError('notFound', 'Supplier', null, { email }));
    }
    
    const transformedSupplier = transformSupplier(supplier);
    sendResponse(
      res,
      200,
      "Supplier retrieved successfully",
      transformedSupplier
    );
  } catch (error) {
    logger.error(`Error retrieving supplier with email: ${email}`, error);
    next(error);
  }
});

/**
 * @desc    Search suppliers
 * @route   GET /suppliers/search
 * @access  Private
 */
const searchSuppliers = asyncHandler(async (req, res, next) => {
  const searchTerm = req.query.term;
  logger.info(`searchSuppliers called with term: ${searchTerm}`);
  
  try {
    if (!searchTerm) {
      return next(new ValidationError('term', searchTerm, 'Search term is required'));
    }
    
    const result = await searchSuppliersService(searchTerm, req.query);
    
    if (!result.suppliers.length) {
      return sendResponse(res, 200, "No suppliers found matching search criteria", {
        suppliers: [],
        pagination: result.pagination
      });
    }
    
    const transformedSuppliers = result.suppliers.map(transformSupplier);
    sendResponse(
      res,
      200,
      "Suppliers retrieved successfully",
      { suppliers: transformedSuppliers, pagination: result.pagination }
    );
  } catch (error) {
    logger.error(`Error searching suppliers with term: ${searchTerm}`, error);
    next(error);
  }
});

/**
 * @desc    Create a new supplier
 * @route   POST /suppliers
 * @access  Private
 */
const createSupplier = asyncHandler(async (req, res, next) => {
  logger.info("createSupplier called");
  logger.debug("Supplier data:", req.body);
  
  try {
    // Ensure we're not using any user-provided supplierID to force generation
    const supplierData = { ...req.body };
    delete supplierData.supplierID;
    
    const supplier = await createSupplierService(supplierData);
    const transformedSupplier = transformSupplier(supplier);
    sendResponse(res, 201, "Supplier created successfully", transformedSupplier);
  } catch (error) {
    logger.error("Error creating supplier:", error);
    
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const firstErrorKey = Object.keys(error.errors)[0];
      const firstError = error.errors[firstErrorKey];
      
      return next(new ValidationError(
        firstErrorKey,
        firstError.value,
        firstError.message
      ));
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      
      return next(new DatabaseError(
        'duplicate',
        'Supplier',
        null,
        { field, value }
      ));
    }
    
    next(error);
  }
});

/**
 * @desc    Update supplier by ID
 * @route   PUT /suppliers/:supplier_Id
 * @access  Private
 */
const updateSupplierById = asyncHandler(async (req, res, next) => {
  const id = req.params.supplier_Id;
  logger.info(`updateSupplier called with ID: ${id}`);
  logger.debug("Update data:", req.body);
  
  try {
    // Prevent updating the supplierID
    if (req.body.supplierID) {
      delete req.body.supplierID;
    }
    
    const supplier = await updateSupplierService(id, req.body);
    
    if (!supplier) {
      return next(new DatabaseError('notFound', 'Supplier', id));
    }
    
    const transformedSupplier = transformSupplier(supplier);
    sendResponse(
      res,
      200,
      "Supplier updated successfully",
      transformedSupplier
    );
  } catch (error) {
    logger.error(`Error updating supplier with ID: ${id}`, error);
    
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const firstErrorKey = Object.keys(error.errors)[0];
      const firstError = error.errors[firstErrorKey];
      
      return next(new ValidationError(
        firstErrorKey,
        firstError.value,
        firstError.message
      ));
    }
    
    // Handle CastError for invalid ObjectId
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return next(new ValidationError('id', id, 'Invalid supplier ID format'));
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      
      return next(new DatabaseError(
        'duplicate',
        'Supplier',
        null,
        { field, value }
      ));
    }
    
    next(error);
  }
});

/**
 * @desc    Delete supplier by ID
 * @route   DELETE /suppliers/:supplier_Id
 * @access  Private
 */
const deleteSupplierById = asyncHandler(async (req, res, next) => {
  const id = req.params.supplier_Id;
  logger.info(`deleteSupplier called with ID: ${id}`);
  
  try {
    const result = await deleteSupplierService(id);
    
    if (result.deletedCount === 0) {
      return next(new DatabaseError('notFound', 'Supplier', id));
    }
    
    sendResponse(res, 200, "Supplier deleted successfully");
  } catch (error) {
    logger.error(`Error deleting supplier with ID: ${id}`, error);
    
    // Handle CastError for invalid ObjectId
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return next(new ValidationError('id', id, 'Invalid supplier ID format'));
    }
    
    next(error);
  }
});

/**
 * @desc    Delete all suppliers
 * @route   DELETE /suppliers
 * @access  Private
 */
const deleteAllSuppliers = asyncHandler(async (req, res, next) => {
  logger.info("deleteAllSuppliers called");
  
  try {
    const result = await deleteAllSuppliersService();
    sendResponse(
      res,
      200,
      `${result.deletedCount} suppliers deleted successfully`
    );
  } catch (error) {
    logger.error("Error deleting all suppliers:", error);
    next(error);
  }
});

module.exports = {
  getAllSuppliers,
  getSupplierById,
  getSupplierBySupplierID,
  getSupplierByEmail,
  searchSuppliers,
  createSupplier,
  updateSupplierById,
  deleteSupplierById,
  deleteAllSuppliers,
};
