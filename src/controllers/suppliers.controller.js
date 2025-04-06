const sendResponse = require("../utils/response.js");
const asyncHandler = require("express-async-handler");
const logger = require("../utils/logger.js");
const createHttpError = require("http-errors");
const supplierService = require("../services/suppliers.service.js");
const { transformSupplier } = require("../utils/supplier.utils.js");

/**
 * @desc    Get all suppliers
 * @route   GET /suppliers
 * @access  Public
 */
const getAllSuppliers = asyncHandler(async (req, res, next) => {
    logger.info("getAllSuppliers called");
    try {
        const result = await supplierService.getAllSuppliersService(req.query);
        // Transform each supplier in the results
        const transformedSuppliers = result.suppliers.map(supplier => transformSupplier(supplier));
        
        sendResponse(res, 200, "Suppliers retrieved successfully", {
            suppliers: transformedSuppliers,
            pagination: result.pagination
        });
    } catch (error) {
        logger.error("Error retrieving all suppliers:", error);
        next(createHttpError(500, "Failed to retrieve suppliers", { message: error.message }));
    }
});

/**
 * @desc    Get supplier by supplier ID
 * @route   GET /suppliers/supplierID/:supplierID
 * @access  Public
 */
const getSupplierBySupplierID = asyncHandler(async (req, res, next) => {
    logger.info(`getSupplierBySupplierID called with supplierID: ${req.params.supplierID}`);
    try {
        const supplier = await supplierService.getSupplierBySupplierIDService(req.params.supplierID);
        if (supplier) {
            const transformedSupplier = transformSupplier(supplier);
            sendResponse(res, 200, "Supplier retrieved successfully", transformedSupplier);
        } else {
            return next(createHttpError(404, "Supplier not found"));
        }
    } catch (error) {
        logger.error(`Error retrieving supplier with supplierID: ${req.params.supplierID}`, error);
        next(createHttpError(500, "Failed to retrieve supplier", { message: error.message }));
    }
});

/**
 * @desc    Get supplier by MongoDB ID
 * @route   GET /suppliers/:_id
 * @access  Public
 */
const getSupplierById = asyncHandler(async (req, res, next) => {
    logger.info(`getSupplierById called with ID: ${req.params._id}`);
    try {
        const supplier = await supplierService.getSupplierByIdService(req.params._id);
        if (supplier) {
            const transformedSupplier = transformSupplier(supplier);
            sendResponse(res, 200, "Supplier retrieved successfully", transformedSupplier);
        } else {
            return next(createHttpError(404, "Supplier not found"));
        }
    } catch (error) {
        logger.error(`Error retrieving supplier with ID: ${req.params._id}`, error);
        if (error.name === "CastError" && error.kind === "ObjectId") {
            return next(createHttpError(400, "Invalid supplier ID format"));
        }
        next(createHttpError(500, "Failed to retrieve supplier", { message: error.message }));
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
        const supplier = await supplierService.createSupplierService(req.body);
        const transformedSupplier = transformSupplier(supplier);
        sendResponse(res, 201, "Supplier created successfully", transformedSupplier);
    } catch (error) {
        logger.error("Error creating supplier:", error);
        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map((val) => val.message);
            return next(createHttpError(400, "Validation error", { message: errors.join(". ") }));
        }
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            const value = error.keyValue[field];
            return next(createHttpError(409, `Duplicate ${field}`, { message: `${field} '${value}' already exists` }));
        }
        next(createHttpError(500, "Failed to create supplier", { message: error.message }));
    }
});

/**
 * @desc    Update supplier by ID
 * @route   PUT /suppliers/:_id
 * @access  Private
 */
const updateSupplierById = asyncHandler(async (req, res, next) => {
    logger.info(`updateSupplierById called with ID: ${req.params._id}`);
    logger.debug("Update data:", req.body);
    try {
        const supplier = await supplierService.updateSupplierService(req.params._id, req.body);
        if (supplier) {
            const transformedSupplier = transformSupplier(supplier);
            sendResponse(res, 200, "Supplier updated successfully", transformedSupplier);
        } else {
            return next(createHttpError(404, "Supplier not found"));
        }
    } catch (error) {
        logger.error(`Error updating supplier with ID: ${req.params._id}`, error);
        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map((val) => val.message);
            return next(createHttpError(400, "Validation error", { message: errors.join(". ") }));
        }
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            const value = error.keyValue[field];
            return next(createHttpError(409, `Duplicate ${field}`, { message: `${field} '${value}' already exists` }));
        }
        if (error.name === "CastError" && error.kind === "ObjectId") {
            return next(createHttpError(400, "Invalid supplier ID format"));
        }
        next(createHttpError(500, "Failed to update supplier", { message: error.message }));
    }
});

/**
 * @desc    Delete supplier by ID
 * @route   DELETE /suppliers/:_id
 * @access  Private
 */
const deleteSupplierById = asyncHandler(async (req, res, next) => {
    logger.info(`deleteSupplierById called with ID: ${req.params._id}`);
    try {
        const result = await supplierService.deleteSupplierService(req.params._id);
        if (result.deletedCount > 0) {
            sendResponse(res, 200, "Supplier deleted successfully");
        } else {
            return next(createHttpError(404, "Supplier not found"));
        }
    } catch (error) {
        logger.error(`Error deleting supplier with ID: ${req.params._id}`, error);
        if (error.name === "CastError" && error.kind === "ObjectId") {
            return next(createHttpError(400, "Invalid supplier ID format"));
        }
        next(createHttpError(500, "Failed to delete supplier", { message: error.message }));
    }
});

/**
 * @desc    Search suppliers
 * @route   GET /suppliers/search
 * @access  Public
 */
const searchSuppliers = asyncHandler(async (req, res, next) => {
    const searchTerm = req.query.term;
    logger.info(`searchSuppliers called with term: ${searchTerm}`);
    
    if (!searchTerm) {
        return next(createHttpError(400, "Search term is required"));
    }
    
    try {
        const suppliers = await supplierService.searchSuppliersService(searchTerm);
        const transformedSuppliers = suppliers.map(supplier => transformSupplier(supplier));
        sendResponse(res, 200, "Search results retrieved successfully", transformedSuppliers);
    } catch (error) {
        logger.error(`Error searching suppliers with term: ${searchTerm}`, error);
        next(createHttpError(500, "Failed to search suppliers", { message: error.message }));
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
        const result = await supplierService.deleteAllSuppliersService();
        if (result.deletedCount > 0) {
            sendResponse(res, 200, `Successfully deleted ${result.deletedCount} suppliers`);
        } else {
            sendResponse(res, 200, "No suppliers to delete");
        }
    } catch (error) {
        logger.error("Error deleting all suppliers:", error);
        next(createHttpError(500, "Failed to delete all suppliers", { message: error.message }));
    }
});

module.exports = {
    getAllSuppliers,   
    getSupplierBySupplierID,
    getSupplierById,
    createSupplier,
    updateSupplierById,
    deleteSupplierById,
    searchSuppliers,
    deleteAllSuppliers
};
