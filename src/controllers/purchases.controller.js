const sendResponse = require("../utils/response.js");
const asyncHandler = require("express-async-handler");
const logger = require("../utils/logger.js");
const createHttpError = require("http-errors");
const purchaseService = require("../services/purchases.service.js");
const { transformPurchase } = require("../utils/purchase.utils.js");

/**
 * @desc    Get all purchases
 * @route   GET /purchases
 * @access  Private
 */
const getAllPurchases = asyncHandler(async (req, res, next) => {
    logger.info("getAllPurchases called");
    try {
        const result = await purchaseService.getAllPurchasesService(req.query);
        // Transform each purchase in the results
        const transformedPurchases = result.purchases.map(purchase => transformPurchase(purchase));
        
        sendResponse(res, 200, "Purchases retrieved successfully", {
            purchases: transformedPurchases,
            pagination: result.pagination
        });
    } catch (error) {
        logger.error("Error retrieving all purchases:", error);
        next(createHttpError(500, "Failed to retrieve purchases", { message: error.message }));
    }
});

/**
 * @desc    Get purchase by purchase ID
 * @route   GET /purchases/purchaseID/:purchaseID
 * @access  Private
 */
const getPurchaseByPurchaseID = asyncHandler(async (req, res, next) => {
    logger.info(`getPurchaseByPurchaseID called with purchaseID: ${req.params.purchaseID}`);
    try {
        const purchase = await purchaseService.getPurchaseByPurchaseIDService(req.params.purchaseID);
        if (purchase) {
            const transformedPurchase = transformPurchase(purchase);
            sendResponse(res, 200, "Purchase retrieved successfully", transformedPurchase);
        } else {
            return next(createHttpError(404, "Purchase not found"));
        }
    } catch (error) {
        logger.error(`Error retrieving purchase with purchaseID: ${req.params.purchaseID}`, error);
        next(createHttpError(500, "Failed to retrieve purchase", { message: error.message }));
    }
});

/**
 * @desc    Get purchase by MongoDB ID
 * @route   GET /purchases/:_id
 * @access  Private
 */
const getPurchaseById = asyncHandler(async (req, res, next) => {
    logger.info(`getPurchaseById called with ID: ${req.params._id}`);
    try {
        const purchase = await purchaseService.getPurchaseByIdService(req.params._id);
        if (purchase) {
            const transformedPurchase = transformPurchase(purchase);
            sendResponse(res, 200, "Purchase retrieved successfully", transformedPurchase);
        } else {
            return next(createHttpError(404, "Purchase not found"));
        }
    } catch (error) {
        logger.error(`Error retrieving purchase with ID: ${req.params._id}`, error);
        if (error.name === "CastError" && error.kind === "ObjectId") {
            return next(createHttpError(400, "Invalid purchase ID format"));
        }
        next(createHttpError(500, "Failed to retrieve purchase", { message: error.message }));
    }
});

/**
 * @desc    Create a new purchase
 * @route   POST /purchases
 * @access  Private
 */
const createPurchase = asyncHandler(async (req, res, next) => {
    logger.info("createPurchase called");
    logger.debug("Request body:", req.body);
    try {
        const purchase = await purchaseService.createPurchaseService(req.body);
        const transformedPurchase = transformPurchase(purchase);
        sendResponse(res, 201, "Purchase created successfully", transformedPurchase);
    } catch (error) {
        logger.error("Error creating purchase:", error);
        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map((val) => val.message);
            return next(createHttpError(400, "Validation error", { message: errors.join(". ") }));
        }
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            const value = error.keyValue[field];
            return next(createHttpError(409, `Duplicate ${field}`, { message: `${field} '${value}' already exists` }));
        }
        next(createHttpError(500, "Failed to create purchase", { message: error.message }));
    }
});

/**
 * @desc    Update purchase by ID
 * @route   PUT /purchases/:_id
 * @access  Private
 */
const updatePurchaseById = asyncHandler(async (req, res, next) => {
    logger.info(`updatePurchaseById called with ID: ${req.params._id}`);
    logger.debug("Update data:", req.body);
    try {
        const purchase = await purchaseService.updatePurchaseService(req.params._id, req.body);
        if (purchase) {
            const transformedPurchase = transformPurchase(purchase);
            sendResponse(res, 200, "Purchase updated successfully", transformedPurchase);
        } else {
            return next(createHttpError(404, "Purchase not found"));
        }
    } catch (error) {
        logger.error(`Error updating purchase with ID: ${req.params._id}`, error);
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
            return next(createHttpError(400, "Invalid purchase ID format"));
        }
        next(createHttpError(500, "Failed to update purchase", { message: error.message }));
    }
});

/**
 * @desc    Delete purchase by ID
 * @route   DELETE /purchases/:_id
 * @access  Private
 */
const deletePurchaseById = asyncHandler(async (req, res, next) => {
    logger.info(`deletePurchaseById called with ID: ${req.params._id}`);
    try {
        const result = await purchaseService.deletePurchaseService(req.params._id);
        if (result.deletedCount > 0) {
            sendResponse(res, 200, "Purchase deleted successfully");
        } else {
            return next(createHttpError(404, "Purchase not found"));
        }
    } catch (error) {
        logger.error(`Error deleting purchase with ID: ${req.params._id}`, error);
        if (error.name === "CastError" && error.kind === "ObjectId") {
            return next(createHttpError(400, "Invalid purchase ID format"));
        }
        next(createHttpError(500, "Failed to delete purchase", { message: error.message }));
    }
});

/**
 * @desc    Get purchases by supplier
 * @route   GET /purchases/supplier/:supplierId
 * @access  Private
 */
const getPurchasesBySupplier = asyncHandler(async (req, res, next) => {
    logger.info(`getPurchasesBySupplier called with supplier ID: ${req.params.supplierId}`);
    try {
        const purchases = await purchaseService.getPurchasesBySupplierService(req.params.supplierId);
        if (purchases && purchases.length > 0) {
            const transformedPurchases = purchases.map(purchase => transformPurchase(purchase));
            sendResponse(res, 200, "Purchases retrieved successfully", transformedPurchases);
        } else {
            sendResponse(res, 200, "No purchases found for this supplier", []);
        }
    } catch (error) {
        logger.error(`Error retrieving purchases with supplier ID: ${req.params.supplierId}`, error);
        if (error.name === "CastError" && error.kind === "ObjectId") {
            return next(createHttpError(400, "Invalid supplier ID format"));
        }
        next(createHttpError(500, "Failed to retrieve purchases", { message: error.message }));
    }
});

/**
 * @desc    Get purchases by status
 * @route   GET /purchases/status/:status
 * @access  Private
 */
const getPurchasesByStatus = asyncHandler(async (req, res, next) => {
    logger.info(`getPurchasesByStatus called with status: ${req.params.status}`);
    try {
        const purchases = await purchaseService.getPurchasesByStatusService(req.params.status);
        if (purchases && purchases.length > 0) {
            const transformedPurchases = purchases.map(purchase => transformPurchase(purchase));
            sendResponse(res, 200, "Purchases retrieved successfully", transformedPurchases);
        } else {
            sendResponse(res, 200, "No purchases found with this status", []);
        }
    } catch (error) {
        logger.error(`Error retrieving purchases with status: ${req.params.status}`, error);
        next(createHttpError(500, "Failed to retrieve purchases", { message: error.message }));
    }
});

/**
 * @desc    Delete all purchases
 * @route   DELETE /purchases
 * @access  Private
 */
const deleteAllPurchases = asyncHandler(async (req, res, next) => {
    logger.info("deleteAllPurchases called");
    try {
        const result = await purchaseService.deleteAllPurchasesService();
        if (result.deletedCount > 0) {
            sendResponse(res, 200, `Successfully deleted ${result.deletedCount} purchases`);
        } else {
            sendResponse(res, 200, "No purchases to delete");
        }
    } catch (error) {
        logger.error("Error deleting all purchases:", error);
        next(createHttpError(500, "Failed to delete all purchases", { message: error.message }));
    }
});

module.exports = {
    getAllPurchases,   
    getPurchaseByPurchaseID,
    getPurchaseById,
    createPurchase,
    updatePurchaseById,
    deletePurchaseById,
    getPurchasesBySupplier,
    getPurchasesByStatus,
    deleteAllPurchases
};
