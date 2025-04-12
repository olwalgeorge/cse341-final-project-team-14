const sendResponse = require("../utils/response.js");
const asyncHandler = require("express-async-handler");
const logger = require("../utils/logger.js");
const { DatabaseError } = require("../utils/errors");
const {
  getAllSuppliersService,
  getSupplierByIdService,
  getSupplierBySupplierIDService,
  getSupplierByEmailService,
  createSupplierService,
  updateSupplierService,
  deleteSupplierService,
  deleteAllSuppliersService,
  searchSuppliersService,
} = require("../services/suppliers.service");
const { transformSupplier, generateSupplierId } = require("../utils/supplier.utils");

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
    const transformedSuppliers = result.suppliers.map(transformSupplier);
    
    sendResponse(
      res,
      200,
      "Suppliers retrieved successfully",
      {
        suppliers: transformedSuppliers,
        pagination: result.pagination
      }
    );
  } catch (error) {
    logger.error("Error retrieving all suppliers:", error);
    next(error);
  }
});

/**
 * @desc    Search suppliers
 * @route   GET /suppliers/search
 * @access  Private
 */
const searchSuppliers = asyncHandler(async (req, res, next) => {
  logger.info("searchSuppliers called");
  logger.debug("Search term:", req.query.term);
  try {
    if (!req.query.term) {
      return next(new Error("Search term is required"));
    }
    
    const result = await searchSuppliersService(req.query.term, req.query);
    const transformedSuppliers = result.suppliers.map(transformSupplier);
    
    sendResponse(
      res,
      200,
      "Suppliers search results",
      {
        suppliers: transformedSuppliers,
        pagination: result.pagination
      }
    );
  } catch (error) {
    logger.error("Error searching suppliers:", error);
    next(error);
  }
});

/**
 * @desc    Get supplier by ID
 * @route   GET /suppliers/:supplier_Id
 * @access  Private
 */
const getSupplierById = asyncHandler(async (req, res, next) => {
  logger.info(`getSupplierById called with ID: ${req.params.supplier_Id}`);
  try {
    const supplier = await getSupplierByIdService(req.params.supplier_Id);
    if (supplier) {
      const transformedSupplier = transformSupplier(supplier);
      sendResponse(
        res,
        200,
        "Supplier retrieved successfully",
        transformedSupplier
      );
    } else {
      return next(DatabaseError.notFound("Supplier"));
    }
  } catch (error) {
    logger.error(`Error retrieving supplier with ID: ${req.params.supplier_Id}`, error);
    next(error);
  }
});


/**
 * @desc    Get supplier by supplier ID (SP-XXXXX format)
 * @route   GET /suppliers/supplierID/:supplierID
 * @access  Private
 */
const getSupplierBySupplierID = asyncHandler(async (req, res, next) => {
  logger.info(
    `getSupplierBySupplierID called with supplier ID: ${req.params.supplierID}`
  );
  try {
    const supplier = await getSupplierBySupplierIDService(
      req.params.supplierID
    );
    if (supplier) {
      const transformedSupplier = transformSupplier(supplier);
      sendResponse(
        res,
        200,
        "Supplier retrieved successfully",
        transformedSupplier
      );
    } else {
      return next(DatabaseError.notFound("Supplier"));
    }
  } catch (error) {
    logger.error(
      `Error retrieving supplier with supplier ID: ${req.params.supplierID}`,
      error
    );
    next(error);
  }
});

/**
 * @desc    Get supplier by email
 * @route   GET /suppliers/email/:email
 * @access  Public
 */
const getSupplierByEmail = asyncHandler(async (req, res, next) => {
  logger.info(`getSupplierByEmail called with email: ${req.params.email}`);
  try {
    const supplier = await getSupplierByEmailService(req.params.email);
    if (supplier) {
      const transformedSupplier = transformSupplier(supplier);
      sendResponse(
        res,
        200,
        "Supplier retrieved successfully",
        transformedSupplier
      );
    } else {
      return next(DatabaseError.notFound("Supplier"));
    }
  } catch (error) {
    logger.error(`Error retrieving supplier with email: ${req.params.email}`, error);
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
  logger.debug("Request body:", req.body);
  try {
    // Generate a supplier ID and add it to the request body
    const supplierID = await generateSupplierId();
    const supplierData = { ...req.body, supplierID };
    logger.debug("Supplier data with generated ID:", supplierData);

    const supplier = await createSupplierService(supplierData);
    const transformedSupplier = transformSupplier(supplier);
    sendResponse(
      res,
      201,
      "Supplier created successfully",
      transformedSupplier
    );
  } catch (error) {
    logger.error("Error creating supplier:", error);
    next(error);
  }
});

/**
 * @desc    Update supplier by ID
 * @route   PUT /suppliers/:supplier_Id
 * @access  Private
 */
const updateSupplierById = asyncHandler(async (req, res, next) => {
  logger.info(`updateSupplierById called with ID: ${req.params.supplier_Id}`);
  logger.debug("Update data:", req.body);
  try {
    const supplier = await updateSupplierService(req.params.supplier_Id, req.body);
    if (supplier) {
      const transformedSupplier = transformSupplier(supplier);
      sendResponse(
        res,
        200,
        "Supplier updated successfully",
        transformedSupplier
      );
    } else {
      return next(DatabaseError.notFound("Supplier"));
    }
  } catch (error) {
    logger.error(`Error updating supplier with ID: ${req.params.supplier_Id}`, error);
    next(error);
  }
});

/**
 * @desc    Delete supplier by ID
 * @route   DELETE /suppliers/:supplier_Id
 * @access  Private
 */
const deleteSupplierById = asyncHandler(async (req, res, next) => {
  logger.info(`deleteSupplierById called with ID: ${req.params.supplier_Id}`);
  try {
    const result = await deleteSupplierService(req.params.supplier_Id);
    if (result.deletedCount > 0) {
      sendResponse(res, 200, "Supplier deleted successfully");
    } else {
      return next(DatabaseError.notFound("Supplier"));
    }
  } catch (error) {
    logger.error(`Error deleting supplier with ID: ${req.params.supplier_Id}`, error);
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
  createSupplier,
  updateSupplierById,
  deleteSupplierById,
  deleteAllSuppliers,
  searchSuppliers,
};
