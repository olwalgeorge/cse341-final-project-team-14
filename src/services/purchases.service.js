const Purchase = require("../models/purchase.model");
const Product = require("../models/product.model.js");
const APIFeatures = require("../utils/apiFeatures");
const { generatePurchaseId } = require("../utils/purchase.utils.js");
const logger = require("../utils/logger.js");

/**
 * Get all purchases with filtering, pagination and sorting
 */
const getAllPurchasesService = async (query = {}) => {
  logger.debug("getAllPurchasesService called with query:", query);
  
  try {
    // Define custom filters mapping
    const customFilters = {
      status: 'status',
      supplier: 'supplier',
      paymentStatus: 'paymentStatus',
      fromDate: {
        field: 'purchaseDate',
        transform: (value) => ({ $gte: new Date(value) })
      },
      toDate: {
        field: 'purchaseDate',
        transform: (value) => ({ $lte: new Date(value) })
      },
      minAmount: {
        field: 'totalAmount',
        transform: (value) => ({ $gte: parseFloat(value) })
      },
      maxAmount: {
        field: 'totalAmount',
        transform: (value) => ({ $lte: parseFloat(value) })
      }
    };
    
    // Build filter using APIFeatures utility
    const filter = APIFeatures.buildFilter(query, customFilters);
    
    // Get pagination parameters
    const pagination = APIFeatures.getPagination(query);
    
    // Get sort parameters with default sort by purchase date (newest first)
    const sort = APIFeatures.getSort(query, '-purchaseDate');

    // Execute query with pagination and sorting
    const purchases = await Purchase.find(filter)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate("supplier", "name supplierID contact")
      .populate("items.product", "name description costPrice category sku productID");
    
    // Get total count for pagination
    const total = await Purchase.countDocuments(filter);
    
    return {
      purchases,
      pagination: APIFeatures.paginationResult(total, pagination)
    };
  } catch (error) {
    logger.error("Error in getAllPurchasesService:", error);
    throw error;
  }
};

/**
 * Get purchase by purchase ID (PU-xxxxx format)
 */
const getPurchaseByPurchaseIDService = async (purchaseID) => {
  return await Purchase.findOne({ purchaseID: purchaseID })
    .populate("supplier", "name supplierID contact")
    .populate("items.product", "name description costPrice category sku productID");
};

/**
 * Get purchase by MongoDB ID
 */
const getPurchaseByIdService = async (id) => {
  return await Purchase.findById(id)
    .populate("supplier", "name supplierID contact")
    .populate("items.product", "name description costPrice category sku productID");
};

/**
 * Create a new purchase
 */
const createPurchaseService = async (purchaseData) => {
  // Generate purchase ID if not provided
  if (!purchaseData.purchaseID) {
    purchaseData.purchaseID = await generatePurchaseId();
  }

  // If supplier is provided as just an ID, fetch supplier details
  if (purchaseData.supplier && typeof purchaseData.supplier === 'string') {
    const Supplier = require('../models/supplier.model');
    const supplierData = await Supplier.findById(purchaseData.supplier);
    
    if (!supplierData) {
      throw new Error('Supplier not found');
    }
  }

  // Set prices from product costPrice if not provided
  if (purchaseData.items && Array.isArray(purchaseData.items)) {
    for (let i = 0; i < purchaseData.items.length; i++) {
      const item = purchaseData.items[i];
      
      // If price is not specified, fetch it from product costPrice
      if (!item.price || item.price === 0) {
        try {
          const product = await Product.findById(item.product);
          if (product) {
            purchaseData.items[i].price = product.costPrice;
          } else {
            throw new Error(`Product with ID ${item.product} not found`);
          }
        } catch (error) {
          throw new Error(`Error setting product price: ${error.message}`);
        }
      }
    }
  }

  // Calculate totalAmount if not provided
  if (!purchaseData.totalAmount && purchaseData.items && Array.isArray(purchaseData.items)) {
    purchaseData.totalAmount = purchaseData.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  const purchase = new Purchase(purchaseData);
  const savedPurchase = await purchase.save();
  
  // Populate the product details before returning
  return await Purchase.findById(savedPurchase._id)
    .populate("supplier", "name supplierID contact")
    .populate("items.product", "name description costPrice category sku productID");
};

/**
 * Update a purchase by ID
 */
const updatePurchaseService = async (id, updates) => {
  return await Purchase.findByIdAndUpdate(
    id,
    { ...updates, updatedAt: Date.now() },
    { new: true, runValidators: true }
  )
    .populate("supplier", "name supplierID contact")
    .populate("items.product", "name description costPrice category sku productID");
};

/**
 * Delete a purchase by ID
 */
const deletePurchaseService = async (id) => {
  return await Purchase.deleteOne({ _id: id });
};

/**
 * Get purchases by supplier
 */
const getPurchasesBySupplierService = async (supplierId, query = {}) => {
  logger.debug(`getPurchasesBySupplierService called with supplier ID: ${supplierId}`);
  
  try {
    // Get pagination parameters
    const pagination = APIFeatures.getPagination(query);
    
    // Get sort parameters with default sort by purchase date (newest first)
    const sort = APIFeatures.getSort(query, '-purchaseDate');

    // Create the supplier filter
    const filter = { supplier: supplierId };
    
    // Apply any additional filters from query if needed
    const additionalFilters = APIFeatures.buildFilter(query, {
      status: 'status',
      paymentStatus: 'paymentStatus',
      fromDate: {
        field: 'purchaseDate',
        transform: (value) => ({ $gte: new Date(value) })
      },
      toDate: {
        field: 'purchaseDate',
        transform: (value) => ({ $lte: new Date(value) })
      }
    });
    
    // Combine filters
    const combinedFilter = { ...filter, ...additionalFilters };

    // Execute query with pagination and sorting
    const purchases = await Purchase.find(combinedFilter)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate("supplier", "name supplierID contact")
      .populate("items.product", "name description costPrice category sku productID");
    
    // Get total count for pagination
    const total = await Purchase.countDocuments(combinedFilter);
    
    return {
      purchases,
      pagination: APIFeatures.paginationResult(total, pagination)
    };
  } catch (error) {
    logger.error(`Error in getPurchasesBySupplierService: ${error.message}`);
    throw error;
  }
};

/**
 * Get purchases by status
 */
const getPurchasesByStatusService = async (status, query = {}) => {
  logger.debug(`getPurchasesByStatusService called with status: ${status}`);
  
  try {
    // Get pagination parameters
    const pagination = APIFeatures.getPagination(query);
    
    // Get sort parameters with default sort by purchase date (newest first)
    const sort = APIFeatures.getSort(query, '-purchaseDate');

    // Create the status filter
    const filter = { status: status };
    
    // Apply any additional filters from query if needed
    const additionalFilters = APIFeatures.buildFilter(query, {
      supplier: 'supplier',
      paymentStatus: 'paymentStatus',
      fromDate: {
        field: 'purchaseDate',
        transform: (value) => ({ $gte: new Date(value) })
      },
      toDate: {
        field: 'purchaseDate',
        transform: (value) => ({ $lte: new Date(value) })
      }
    });
    
    // Combine filters
    const combinedFilter = { ...filter, ...additionalFilters };

    // Execute query with pagination and sorting
    const purchases = await Purchase.find(combinedFilter)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate("supplier", "name supplierID contact")
      .populate("items.product", "name description costPrice category sku productID");
    
    // Get total count for pagination
    const total = await Purchase.countDocuments(combinedFilter);
    
    return {
      purchases,
      pagination: APIFeatures.paginationResult(total, pagination)
    };
  } catch (error) {
    logger.error(`Error in getPurchasesByStatusService: ${error.message}`);
    throw error;
  }
};

/**
 * Delete all purchases - use with caution
 */
const deleteAllPurchasesService = async () => {
  return await Purchase.deleteMany({});
};

module.exports = {
  getAllPurchasesService,
  getPurchaseByIdService,
  getPurchaseByPurchaseIDService,
  createPurchaseService,
  updatePurchaseService,
  deletePurchaseService,
  deleteAllPurchasesService,
  getPurchasesBySupplierService,
  getPurchasesByStatusService,
};
