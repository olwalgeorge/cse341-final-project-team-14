const sendResponse = require("../utils/response.js");
const asyncHandler = require("express-async-handler");
const logger = require("../utils/logger.js");
const { DatabaseError } = require("../utils/errors");
const {
  getAllPurchasesService,
  getPurchaseByIdService,
  createPurchaseService,
  updatePurchaseService,
  deletePurchaseService,
  deleteAllPurchasesService,
  getPurchaseByPurchaseIDService,
  getPurchasesBySupplierService,
  getPurchasesByStatusService,
} = require("../services/purchases.service");
const { transformPurchase } = require("../utils/purchase.utils");

/**
 * @desc    Get all purchases
 * @route   GET /purchases
 * @access  Private
 */
const getAllPurchases = asyncHandler(async (req, res, next) => {
  logger.info("getAllPurchases called");
  try {
    const purchases = await getAllPurchasesService();
    const transformedPurchases = purchases.map(transformPurchase);
    sendResponse(
      res,
      200,
      "Purchases retrieved successfully",
      transformedPurchases
    );
  } catch (error) {
    logger.error("Error retrieving all purchases:", error);
    next(error);
  }
});

/**
 * @desc    Get purchase by ID
 * @route   GET /purchases/:_id
 * @access  Private
 */
const getPurchaseById = asyncHandler(async (req, res, next) => {
  logger.info(`getPurchaseById called with ID: ${req.params._id}`);
  try {
    const purchase = await getPurchaseByIdService(req.params._id);
    if (purchase) {
      const transformedPurchase = transformPurchase(purchase);
      sendResponse(
        res,
        200,
        "Purchase retrieved successfully",
        transformedPurchase
      );
    } else {
      return next(DatabaseError.notFound("Purchase"));
    }
  } catch (error) {
    logger.error(`Error retrieving purchase with ID: ${req.params._id}`, error);
    next(error);
  }
});

/**
 * @desc    Get purchase by purchase ID (PU-XXXXX format)
 * @route   GET /purchases/purchaseID/:purchaseID
 * @access  Private
 */
const getPurchaseByPurchaseID = asyncHandler(async (req, res, next) => {
  logger.info(
    `getPurchaseByPurchaseID called with purchase ID: ${req.params.purchaseID}`
  );
  try {
    const purchase = await getPurchaseByPurchaseIDService(
      req.params.purchaseID
    );
    if (purchase) {
      const transformedPurchase = transformPurchase(purchase);
      sendResponse(
        res,
        200,
        "Purchase retrieved successfully",
        transformedPurchase
      );
    } else {
      return next(DatabaseError.notFound("Purchase"));
    }
  } catch (error) {
    logger.error(
      `Error retrieving purchase with purchase ID: ${req.params.purchaseID}`,
      error
    );
    next(error);
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
    const purchase = await createPurchaseService(req.body);
    const transformedPurchase = transformPurchase(purchase);
    sendResponse(
      res,
      201,
      "Purchase created successfully",
      transformedPurchase
    );
  } catch (error) {
    logger.error("Error creating purchase:", error);
    next(error);
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
    const purchase = await updatePurchaseService(req.params._id, req.body);
    if (purchase) {
      const transformedPurchase = transformPurchase(purchase);
      sendResponse(
        res,
        200,
        "Purchase updated successfully",
        transformedPurchase
      );
    } else {
      return next(DatabaseError.notFound("Purchase"));
    }
  } catch (error) {
    logger.error(`Error updating purchase with ID: ${req.params._id}`, error);
    next(error);
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
    const result = await deletePurchaseService(req.params._id);
    if (result.deletedCount > 0) {
      sendResponse(res, 200, "Purchase deleted successfully");
    } else {
      return next(DatabaseError.notFound("Purchase"));
    }
  } catch (error) {
    logger.error(`Error deleting purchase with ID: ${req.params._id}`, error);
    next(error);
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
    const result = await deleteAllPurchasesService();
    sendResponse(
      res,
      200,
      `${result.deletedCount} purchases deleted successfully`
    );
  } catch (error) {
    logger.error("Error deleting all purchases:", error);
    next(error);
  }
});

/**
 * @desc    Get purchases by supplier
 * @route   GET /purchases/supplier/:supplierId
 * @access  Public
 */
const getPurchasesBySupplier = asyncHandler(async (req, res, next) => {
  logger.info(
    `getPurchasesBySupplier called with supplier ID: ${req.params.supplierId}`
  );
  try {
    const purchases = await getPurchasesBySupplierService(
      req.params.supplierId
    );
    if (purchases && purchases.length > 0) {
      const transformedPurchases = purchases.map(transformPurchase);
      sendResponse(
        res,
        200,
        "Purchases retrieved successfully",
        transformedPurchases
      );
    } else {
      // Return empty array instead of 404 for empty results
      sendResponse(res, 200, "No purchases found for this supplier", []);
    }
  } catch (error) {
    logger.error(
      `Error retrieving purchases for supplier: ${req.params.supplierId}`,
      error
    );
    next(error);
  }
});

/**
 * @desc    Get purchases by status
 * @route   GET /purchases/status/:status
 * @access  Public
 */
const getPurchasesByStatus = asyncHandler(async (req, res, next) => {
  logger.info(`getPurchasesByStatus called with status: ${req.params.status}`);
  try {
    const purchases = await getPurchasesByStatusService(req.params.status);
    if (purchases && purchases.length > 0) {
      const transformedPurchases = purchases.map(transformPurchase);
      sendResponse(
        res,
        200,
        "Purchases retrieved successfully",
        transformedPurchases
      );
    } else {
      // Return empty array instead of 404 for empty results
      sendResponse(res, 200, "No purchases found with this status", []);
    }
  } catch (error) {
    logger.error(
      `Error retrieving purchases with status: ${req.params.status}`,
      error
    );
    next(error);
  }
});

module.exports = {
  getAllPurchases,
  getPurchaseById,
  getPurchaseByPurchaseID,
  createPurchase,
  updatePurchaseById,
  deletePurchaseById,
  deleteAllPurchases,
  getPurchasesBySupplier,
  getPurchasesByStatus,
};
