const sendResponse = require("../utils/response.js");
const asyncHandler = require("express-async-handler");
const logger = require("../utils/logger.js");
const { DatabaseError } = require("../utils/errors");
const { 
    getAllSuppliersService,
    getSupplierByIdService,
    getSupplierByNameService,
    getSupplierBySupplierIDService,
    createSupplierService,
    updateSupplierService,
    deleteSupplierService,
    deleteAllSuppliersService
} = require("../services/suppliers.service");
const { transformSupplier } = require("../utils/supplier.utils");

/**
 * @desc    Get all suppliers
 * @route   GET /suppliers
 * @access  Private
 */
const getAllSuppliers = asyncHandler(async (req, res, next) => {
    logger.info("getAllSuppliers called");
    try {
        const suppliers = await getAllSuppliersService();
        const transformedSuppliers = suppliers.map(transformSupplier);
        sendResponse(res, 200, "Suppliers retrieved successfully", transformedSuppliers);
    } catch (error) {
        logger.error("Error retrieving all suppliers:", error);
        next(error);
    }
});

/**
 * @desc    Get supplier by ID
 * @route   GET /suppliers/:_id
 * @access  Private
 */
const getSupplierById = asyncHandler(async (req, res, next) => {
    logger.info(`getSupplierById called with ID: ${req.params._id}`);
    try {
        const supplier = await getSupplierByIdService(req.params._id);
        if (supplier) {
            const transformedSupplier = transformSupplier(supplier);
            sendResponse(res, 200, "Supplier retrieved successfully", transformedSupplier);
        } else {
            return next(DatabaseError.notFound("Supplier"));
        }
    } catch (error) {
        logger.error(`Error retrieving supplier with ID: ${req.params._id}`, error);
        next(error);
    }
});

/**
 * @desc    Get supplier by name
 * @route   GET /suppliers/name/:name
 * @access  Private
 */
const getSupplierByName = asyncHandler(async (req, res, next) => {
    logger.info(`getSupplierByName called with name: ${req.params.name}`);
    try {
        const supplier = await getSupplierByNameService(req.params.name);
        if (supplier) {
            const transformedSupplier = transformSupplier(supplier);
            sendResponse(res, 200, "Supplier retrieved successfully", transformedSupplier);
        } else {
            return next(DatabaseError.notFound("Supplier"));
        }
    } catch (error) {
        logger.error(`Error retrieving supplier with name: ${req.params.name}`, error);
        next(error);
    }
});

/**
 * @desc    Get supplier by supplier ID (SP-XXXXX format)
 * @route   GET /suppliers/supplierID/:supplierID
 * @access  Private
 */
const getSupplierBySupplierID = asyncHandler(async (req, res, next) => {
    logger.info(`getSupplierBySupplierID called with supplier ID: ${req.params.supplierID}`);
    try {
        const supplier = await getSupplierBySupplierIDService(req.params.supplierID);
        if (supplier) {
            const transformedSupplier = transformSupplier(supplier);
            sendResponse(res, 200, "Supplier retrieved successfully", transformedSupplier);
        } else {
            return next(DatabaseError.notFound("Supplier"));
        }
    } catch (error) {
        logger.error(`Error retrieving supplier with supplier ID: ${req.params.supplierID}`, error);
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
        const supplier = await createSupplierService(req.body);
        const transformedSupplier = transformSupplier(supplier);
        sendResponse(res, 201, "Supplier created successfully", transformedSupplier);
    } catch (error) {
        logger.error("Error creating supplier:", error);
        next(error);
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
        const supplier = await updateSupplierService(req.params._id, req.body);
        if (supplier) {
            const transformedSupplier = transformSupplier(supplier);
            sendResponse(res, 200, "Supplier updated successfully", transformedSupplier);
        } else {
            return next(DatabaseError.notFound("Supplier"));
        }
    } catch (error) {
        logger.error(`Error updating supplier with ID: ${req.params._id}`, error);
        next(error);
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
        const result = await deleteSupplierService(req.params._id);
        if (result.deletedCount > 0) {
            sendResponse(res, 200, "Supplier deleted successfully");
        } else {
            return next(DatabaseError.notFound("Supplier"));
        }
    } catch (error) {
        logger.error(`Error deleting supplier with ID: ${req.params._id}`, error);
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
        sendResponse(res, 200, `${result.deletedCount} suppliers deleted successfully`);
    } catch (error) {
        logger.error("Error deleting all suppliers:", error);
        next(error);
    }
});

module.exports = {
    getAllSuppliers,
    getSupplierById,
    getSupplierByName,
    getSupplierBySupplierID,
    createSupplier,
    updateSupplierById,
    deleteSupplierById,
    deleteAllSuppliers
};
