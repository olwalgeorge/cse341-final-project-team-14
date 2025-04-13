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
const { transformPurchase, generatePurchaseId } = require("../utils/purchase.utils");

/**
 * @desc    Get all purchases
 * @route   GET /purchases
 * @access  Private
 */
const getAllPurchases = asyncHandler(async (req, res, next) => {
  logger.info("getAllPurchases called");
  logger.debug("Query parameters:", req.query);
  try {
    const result = await getAllPurchasesService(req.query);
    
    // Transform purchases for API response
    const transformedPurchases = result.purchases.map(transformPurchase);
    
    sendResponse(
      res,
      200,
      "Purchases retrieved successfully",
      {
        purchases: transformedPurchases,
        pagination: result.pagination
      }
    );
  } catch (error) {
    logger.error("Error retrieving all purchases:", error);
    next(error);
  }
});

/**
 * @desc    Get purchase by ID
 * @route   GET /purchases/:purchase_Id
 * @access  Private
 */
const getPurchaseById = asyncHandler(async (req, res, next) => {
  logger.info(`getPurchaseById called with ID: ${req.params.purchase_Id}`);
  try {
    const purchase = await getPurchaseByIdService(req.params.purchase_Id);
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
    logger.error(`Error retrieving purchase with ID: ${req.params.purchase_Id}`, error);
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
    // Generate purchaseID if not provided
    if (!req.body.purchaseID) {
      const purchaseID = await generatePurchaseId();
      logger.debug(`Generated purchaseID: ${purchaseID}`);
      req.body.purchaseID = purchaseID;
    }
    
    // For each product in items, verify it exists
    if (req.body.items && Array.isArray(req.body.items)) {
      const Product = require("../models/product.model");
      for (const item of req.body.items) {
        const product = await Product.findById(item.product);
        if (!product) {
          return next(DatabaseError.notFound(`Product with ID ${item.product}`));
        }
      }
    }
    
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
 * @route   PUT /purchases/:purchase_Id
 * @access  Private
 */
const updatePurchaseById = asyncHandler(async (req, res, next) => {
  logger.info(`updatePurchaseById called with ID: ${req.params.purchase_Id}`);
  logger.debug("Update data:", req.body);
  try {
    // Verify products exist if they're being updated
    if (req.body.items && Array.isArray(req.body.items)) {
      const Product = require("../models/product.model");
      for (const item of req.body.items) {
        const product = await Product.findById(item.product);
        if (!product) {
          return next(DatabaseError.notFound(`Product with ID ${item.product}`));
        }
      }
    }
    
    // Pass the user ID from the request to track who updated the purchase
    const purchase = await updatePurchaseService(
      req.params.purchase_Id, 
      req.body,
      req.user?._id
    );
    
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
    logger.error(`Error updating purchase with ID: ${req.params.purchase_Id}`, error);
    next(error);
  }
});

/**
 * @desc    Delete purchase by ID
 * @route   DELETE /purchases/:purchase_Id
 * @access  Private
 */
const deletePurchaseById = asyncHandler(async (req, res, next) => {
  logger.info(`deletePurchaseById called with ID: ${req.params.purchase_Id}`);
  try {
    const result = await deletePurchaseService(req.params.purchase_Id);
    if (result.deletedCount > 0) {
      sendResponse(res, 200, "Purchase deleted successfully");
    } else {
      return next(DatabaseError.notFound("Purchase"));
    }
  } catch (error) {
    logger.error(`Error deleting purchase with ID: ${req.params.purchase_Id}`, error);
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
 * @access  Private
 */
const getPurchasesBySupplier = asyncHandler(async (req, res, next) => {
  logger.info(`getPurchasesBySupplier called with supplier ID: ${req.params.supplierId}`);
  try {
    const result = await getPurchasesBySupplierService(req.params.supplierId, req.query);
    
    if (!result.purchases.length) {
      return sendResponse(res, 200, "No purchases found for this supplier", {
        purchases: [],
        pagination: result.pagination
      });
    }
    
    const transformedPurchases = result.purchases.map(transformPurchase);
    sendResponse(
      res,
      200,
      "Purchases retrieved successfully",
      {
        purchases: transformedPurchases,
        pagination: result.pagination
      }
    );
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
 * @access  Private
 */
const getPurchasesByStatus = asyncHandler(async (req, res, next) => {
  logger.info(`getPurchasesByStatus called with status: ${req.params.status}`);
  try {
    const result = await getPurchasesByStatusService(req.params.status, req.query);
    
    if (!result.purchases.length) {
      return sendResponse(res, 200, `No purchases found with status: ${req.params.status}`, {
        purchases: [],
        pagination: result.pagination
      });
    }
    
    const transformedPurchases = result.purchases.map(transformPurchase);
    sendResponse(
      res,
      200,
      "Purchases retrieved successfully",
      {
        purchases: transformedPurchases,
        pagination: result.pagination
      }
    );
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
