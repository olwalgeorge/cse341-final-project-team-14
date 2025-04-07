const Purchase = require("../models/purchase.model.js");
const { generatePurchaseId } = require("../utils/purchase.utils.js");

/**
 * Get all purchases with optional filtering and pagination
 */
const getAllPurchasesService = async (query = {}) => {
  // Create filter object
  const filter = {};

  // Apply status filter
  if (query.status) {
    filter.status = query.status;
  }

  // Apply supplier filter
  if (query.supplier) {
    filter.supplier = query.supplier;
  }

  // Apply payment status filter
  if (query.paymentStatus) {
    filter.paymentStatus = query.paymentStatus;
  }

  // Apply date range filter
  if (query.fromDate || query.toDate) {
    filter.purchaseDate = {};
    if (query.fromDate) filter.purchaseDate.$gte = new Date(query.fromDate);
    if (query.toDate) filter.purchaseDate.$lte = new Date(query.toDate);
  }

  // Pagination
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  // Sort options
  const sort = {};
  if (query.sort) {
    const sortFields = query.sort.split(",");
    sortFields.forEach((field) => {
      if (field.startsWith("-")) {
        sort[field.substring(1)] = -1;
      } else {
        sort[field] = 1;
      }
    });
  } else {
    sort.purchaseDate = -1; // Default sort by newest purchases
  }

  // Execute query
  const purchases = await Purchase.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate("supplier", "name")
    .populate("items.product", "name");

  // Get total count for pagination
  const total = await Purchase.countDocuments(filter);

  return {
    purchases,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get purchase by purchase ID (PU-xxxxx format)
 */
const getPurchaseByPurchaseIDService = async (purchaseID) => {
  return await Purchase.findOne({ purchaseID: purchaseID })
    .populate("supplier", "name")
    .populate("items.product", "name");
};

/**
 * Get purchase by MongoDB ID
 */
const getPurchaseByIdService = async (id) => {
  return await Purchase.findById(id)
    .populate("supplier", "name")
    .populate("items.product", "name");
};

/**
 * Create a new purchase
 */
const createPurchaseService = async (purchaseData) => {
  // Generate purchase ID if not provided
  if (!purchaseData.purchaseID) {
    purchaseData.purchaseID = await generatePurchaseId();
  }

  const purchase = new Purchase(purchaseData);
  return await purchase.save();
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
    .populate("supplier", "name")
    .populate("items.product", "name");
};

/**
 * Delete a purchase by ID
 */
const deletePurchaseService = async (id) => {
  return await Purchase.deleteOne({ _id: id });
};

/**
 * Get purchases by supplier ID
 */
const getPurchasesBySupplierService = async (supplierId) => {
  return await Purchase.find({ supplier: supplierId })
    .populate("supplier", "name")
    .populate("items.product", "name");
};

/**
 * Get purchases by status
 */
const getPurchasesByStatusService = async (status) => {
  return await Purchase.find({ status: status })
    .populate("supplier", "name")
    .populate("items.product", "name");
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
  createPurchaseService,
  updatePurchaseService,
  deletePurchaseService,
  deleteAllPurchasesService,
  getPurchaseByPurchaseIDService,
  getPurchasesBySupplierService,
  getPurchasesByStatusService,
};
