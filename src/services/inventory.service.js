const Inventory = require("../models/inventory.model");
const logger = require("../utils/logger");
const APIFeatures = require("../utils/apiFeatures");
const { generateInventoryId } = require("../utils/inventory.utils");

/**
 * Get all inventory items with filtering, pagination and sorting
 */
const getAllInventoryService = async (query = {}) => {
  logger.debug("getAllInventoryService called with query:", query);
  
  try {
    const customFilters = {
      product: 'product',
      warehouse: 'warehouse',
      stockStatus: 'stockStatus',
      minQuantity: {
        field: 'quantity',
        transform: (value) => ({ $gte: parseInt(value) })
      },
      maxQuantity: {
        field: 'quantity',
        transform: (value) => ({ $lte: parseInt(value) })
      },
      locationAisle: {
        field: 'location.aisle',
        transform: (value) => ({ $regex: value, $options: 'i' })
      },
      locationRack: {
        field: 'location.rack',
        transform: (value) => ({ $regex: value, $options: 'i' })
      },
      locationBin: {
        field: 'location.bin',
        transform: (value) => ({ $regex: value, $options: 'i' })
      },
      fromDate: {
        field: 'lastStockCheck',
        transform: (value) => ({ $gte: new Date(value) })
      },
      toDate: {
        field: 'lastStockCheck',
        transform: (value) => ({ $lte: new Date(value) })
      }
    };
    
    // Build filter using APIFeatures utility
    const filter = APIFeatures.buildFilter(query, customFilters);
    
    // Get pagination parameters
    const pagination = APIFeatures.getPagination(query);
    
    // Get sort parameters with default sort by inventoryID
    const sort = APIFeatures.getSort(query, 'inventoryID');

    // Execute query with pagination and sorting
    const inventory = await Inventory.find(filter)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate("product", "name description sellingPrice category sku productID")
      .populate("warehouse", "name warehouseID status");
    
    // Get total count for pagination
    const total = await Inventory.countDocuments(filter);
    
    return {
      inventory,
      pagination: APIFeatures.paginationResult(total, pagination)
    };
  } catch (error) {
    logger.error("Error in getAllInventoryService:", error);
    throw error;
  }
};

/**
 * Get inventory item by MongoDB ID
 */
const getInventoryByIdService = async (id) => {
  logger.debug(`getInventoryByIdService called with ID: ${id}`);
  
  return await Inventory.findById(id)
    .populate("product", "name productID sku category")
    .populate("warehouse", "name warehouseID");
};

/**
 * Get inventory item by inventory ID (IN-XXXXX format)
 */
const getInventoryByInventoryIDService = async (inventoryID) => {
  logger.debug(`getInventoryByInventoryIDService called with inventoryID: ${inventoryID}`);
  
  return await Inventory.findOne({ inventoryID })
    .populate("product", "name productID sku category")
    .populate("warehouse", "name warehouseID");
};

/**
 * Get inventory items by warehouse
 */
const getInventoryByWarehouseService = async (warehouseId, query = {}) => {
  logger.debug(`getInventoryByWarehouseService called with warehouse ID: ${warehouseId}`);
  
  // Get pagination parameters
  const pagination = APIFeatures.getPagination(query);
  
  // Get sort parameters with default sort by inventoryID
  const sort = APIFeatures.getSort(query, 'inventoryID');

  // Create the warehouse filter
  const filter = { warehouse: warehouseId };
  
  // Apply any additional filters from query if needed
  const additionalFilters = APIFeatures.buildFilter(query, {
    product: 'product',
    stockStatus: 'stockStatus',
    minQuantity: {
      field: 'quantity',
      transform: (value) => ({ $gte: parseInt(value) })
    },
    maxQuantity: {
      field: 'quantity',
      transform: (value) => ({ $lte: parseInt(value) })
    }
  });
  
  // Combine filters
  const combinedFilter = { ...filter, ...additionalFilters };

  // Execute query with pagination and sorting
  const inventory = await Inventory.find(combinedFilter)
    .sort(sort)
    .skip(pagination.skip)
    .limit(pagination.limit)
    .populate("product", "name description sellingPrice category sku productID")
    .populate("warehouse", "name warehouseID status");
  
  // Get total count for pagination
  const total = await Inventory.countDocuments(combinedFilter);
  
  return {
    inventory,
    pagination: APIFeatures.paginationResult(total, pagination)
  };
};

/**
 * Get inventory items by product
 */
const getInventoryByProductService = async (productId, query = {}) => {
  logger.debug(`getInventoryByProductService called with product ID: ${productId}`);
  
  try {
    // Get pagination parameters
    const pagination = APIFeatures.getPagination(query);
    
    // Get sort parameters with default sort by inventoryID
    const sort = APIFeatures.getSort(query, 'inventoryID');

    // Create the product filter
    const filter = { product: productId };
    
    // Apply any additional filters from query if needed
    const additionalFilters = APIFeatures.buildFilter(query, {
      warehouse: 'warehouse',
      stockStatus: 'stockStatus',
      minQuantity: {
        field: 'quantity',
        transform: (value) => ({ $gte: parseInt(value) })
      },
      maxQuantity: {
        field: 'quantity',
        transform: (value) => ({ $lte: parseInt(value) })
      }
    });
    
    // Combine filters
    const combinedFilter = { ...filter, ...additionalFilters };

    // Execute query with pagination and sorting
    const inventory = await Inventory.find(combinedFilter)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate("product", "name description sellingPrice category sku productID")
      .populate("warehouse", "name warehouseID status");
    
    // Get total count for pagination
    const total = await Inventory.countDocuments(combinedFilter);
    
    return {
      inventory,
      pagination: APIFeatures.paginationResult(total, pagination)
    };
  } catch (error) {
    logger.error(`Error in getInventoryByProductService for product ${productId}:`, error);
    throw error;
  }
};

/**
 * Get inventory items by stock status
 */
const getInventoryByStockStatusService = async (stockStatus, query = {}) => {
  logger.debug(`getInventoryByStockStatusService called with status: ${stockStatus}`);
  
  try {
    // Get pagination parameters
    const pagination = APIFeatures.getPagination(query);
    
    // Get sort parameters with default sort by inventoryID
    const sort = APIFeatures.getSort(query, 'inventoryID');

    // Create the stock status filter
    const filter = { stockStatus: stockStatus };
    
    // Apply any additional filters from query if needed
    const additionalFilters = APIFeatures.buildFilter(query, {
      product: 'product',
      warehouse: 'warehouse',
      minQuantity: {
        field: 'quantity',
        transform: (value) => ({ $gte: parseInt(value) })
      },
      maxQuantity: {
        field: 'quantity',
        transform: (value) => ({ $lte: parseInt(value) })
      }
    });
    
    // Combine filters
    const combinedFilter = { ...filter, ...additionalFilters };

    // Execute query with pagination and sorting
    const inventory = await Inventory.find(combinedFilter)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate("product", "name description sellingPrice category sku productID")
      .populate("warehouse", "name warehouseID status");
    
    // Get total count for pagination
    const total = await Inventory.countDocuments(combinedFilter);
    
    return {
      inventory,
      pagination: APIFeatures.paginationResult(total, pagination)
    };
  } catch (error) {
    logger.error(`Error in getInventoryByStockStatusService: ${error.message}`);
    throw error;
  }
};

/**
 * Get low stock inventory (quantity > 0 but below threshold)
 */
const getLowStockInventoryService = async (threshold = 10, query = {}) => {
  logger.debug(`getLowStockInventoryService called with threshold: ${threshold}`);
  
  // Get pagination parameters
  const pagination = APIFeatures.getPagination(query);
  
  // Get sort parameters with default sort by quantity
  const sort = APIFeatures.getSort(query, 'quantity');

  // Create the low stock filter
  const filter = { 
    quantity: { $gt: 0, $lte: threshold },
    stockStatus: 'Low Stock'
  };
  
  // Execute query with pagination and sorting
  const inventory = await Inventory.find(filter)
    .sort(sort)
    .skip(pagination.skip)
    .limit(pagination.limit)
    .populate("product", "name description sellingPrice category sku productID")
    .populate("warehouse", "name warehouseID status");
  
  // Get total count for pagination
  const total = await Inventory.countDocuments(filter);
  
  return {
    inventory,
    pagination: APIFeatures.paginationResult(total, pagination)
  };
};

/**
 * Get out of stock inventory
 */
const getOutOfStockInventoryService = async (query = {}) => {
  logger.debug("getOutOfStockInventoryService called");
  
  // Get pagination parameters
  const pagination = APIFeatures.getPagination(query);
  
  // Get sort parameters with default sort by inventoryID
  const sort = APIFeatures.getSort(query, 'inventoryID');

  // Create the out of stock filter
  const filter = { 
    quantity: 0,
    stockStatus: 'Out of Stock'
  };
  
  // Execute query with pagination and sorting
  const inventory = await Inventory.find(filter)
    .sort(sort)
    .skip(pagination.skip)
    .limit(pagination.limit)
    .populate("product", "name description sellingPrice category sku productID")
    .populate("warehouse", "name warehouseID status");
  
  // Get total count for pagination
  const total = await Inventory.countDocuments(filter);
  
  return {
    inventory,
    pagination: APIFeatures.paginationResult(total, pagination)
  };
};

/**
 * Search inventory items
 */
const searchInventoryService = async (searchTerm, query = {}) => {
  logger.debug(`searchInventoryService called with term: ${searchTerm}`);
  
  // Get pagination parameters
  const pagination = APIFeatures.getPagination(query);
  
  // Get sort parameters with default sort
  const sort = APIFeatures.getSort(query, 'inventoryID');

  // Create search criteria
  const Product = require("../models/product.model");
  const Warehouse = require("../models/warehouse.model");
  
  // Find products that match the search term
  const products = await Product.find({
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { sku: { $regex: searchTerm, $options: 'i' } },
      { productID: { $regex: searchTerm, $options: 'i' } },
      { category: { $regex: searchTerm, $options: 'i' } }
    ]
  }).select('_id');
  
  // Find warehouses that match the search term
  const warehouses = await Warehouse.find({
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { warehouseID: { $regex: searchTerm, $options: 'i' } }
    ]
  }).select('_id');
  
  // Build search filter
  const filter = {
    $or: [
      { inventoryID: { $regex: searchTerm, $options: 'i' } },
      { "location.aisle": { $regex: searchTerm, $options: 'i' } },
      { "location.rack": { $regex: searchTerm, $options: 'i' } },
      { "location.bin": { $regex: searchTerm, $options: 'i' } },
      { product: { $in: products.map(p => p._id) } },
      { warehouse: { $in: warehouses.map(w => w._id) } }
    ]
  };
  
  // Execute query with pagination and sorting
  const inventory = await Inventory.find(filter)
    .sort(sort)
    .skip(pagination.skip)
    .limit(pagination.limit)
    .populate("product", "name description sellingPrice category sku productID")
    .populate("warehouse", "name warehouseID status");
  
  // Get total count for pagination
  const total = await Inventory.countDocuments(filter);
  
  return {
    inventory,
    pagination: APIFeatures.paginationResult(total, pagination)
  };
};

/**
 * Create or update inventory item
 */
const createOrUpdateInventoryService = async (inventoryData) => {
  logger.debug("createOrUpdateInventoryService called with data:", inventoryData);
  
  // Generate inventory ID if not provided
  if (!inventoryData.inventoryID) {
    inventoryData.inventoryID = await generateInventoryId();
    logger.debug(`Generated inventoryID: ${inventoryData.inventoryID}`);
  }
  
  // Check if inventory item exists for this product/warehouse combo
  let inventory = await Inventory.findOne({
    product: inventoryData.product,
    warehouse: inventoryData.warehouse
  });
  
  if (inventory) {
    // Update existing inventory
    Object.keys(inventoryData).forEach(key => {
      if (key !== 'product' && key !== 'warehouse') {
        inventory[key] = inventoryData[key];
      }
    });
    
    inventory.updatedAt = Date.now();
    await inventory.save();
  } else {
    // Create new inventory
    inventory = new Inventory(inventoryData);
    await inventory.save();
  }
  
  // Return populated inventory
  return await Inventory.findById(inventory._id)
    .populate("product", "name productID sku category")
    .populate("warehouse", "name warehouseID");
};

/**
 * Update inventory quantities and handle stock status changes
 */
const adjustInventoryService = async (adjustmentData) => {
  logger.debug("adjustInventoryService called with data:", adjustmentData);
  
  // Find the inventory item
  const inventory = await Inventory.findOne({
    product: adjustmentData.product,
    warehouse: adjustmentData.warehouse
  });
  
  if (!inventory) {
    return null; // Controller will handle the error
  }
  
  // Calculate new quantity
  const currentQuantity = inventory.quantity || 0;
  const adjustmentQuantity = parseInt(adjustmentData.adjustmentQuantity);
  const newQuantity = currentQuantity + adjustmentQuantity;
  
  // Update inventory quantity
  inventory.quantity = newQuantity;
  
  // Update stock status based on newQuantity and reorder point
  const reorderLevel = inventory.reorderPoint || 10;
  if (newQuantity === 0) {
    inventory.stockStatus = 'Out of Stock';
  } else if (newQuantity <= reorderLevel) {
    inventory.stockStatus = 'Low Stock';
  } else {
    inventory.stockStatus = 'In Stock';
  }
  
  // Record adjustment info
  inventory.lastAdjustmentDate = Date.now();
  inventory.lastAdjustmentReason = adjustmentData.reason;
  
  if (adjustmentData.adjustedBy) {
    inventory.lastUpdatedBy = adjustmentData.adjustedBy;
  }
  
  inventory.updatedAt = Date.now();
  await inventory.save();
  
  // Return the updated inventory
  return await Inventory.findById(inventory._id)
    .populate("product", "name productID sku category")
    .populate("warehouse", "name warehouseID");
};

/**
 * Transfer inventory between warehouses
 */
const transferInventoryService = async (transferData) => {
  logger.debug("transferInventoryService called with data:", transferData);
  
  // Find source inventory
  const sourceInventory = await Inventory.findOne({
    product: transferData.product,
    warehouse: transferData.sourceWarehouse
  });
  
  if (!sourceInventory) {
    return null; // Controller will handle not found error
  }
  
  // Calculate transfer amount
  const transferQuantity = parseInt(transferData.quantity);
  
  // Find or create destination inventory
  let destinationInventory = await Inventory.findOne({
    product: transferData.product,
    warehouse: transferData.destinationWarehouse
  });
  
  // Create destination inventory if it doesn't exist
  if (!destinationInventory) {
    destinationInventory = new Inventory({
      product: transferData.product,
      warehouse: transferData.destinationWarehouse,
      quantity: 0,
      stockStatus: 'Out of Stock',
      inventoryID: await generateInventoryId() // Generate ID for new inventory
    });
  }
  
  // Update source inventory
  sourceInventory.quantity -= transferQuantity;
  
  // Update stock status based on new quantity
  const sourceReorderLevel = sourceInventory.reorderPoint || 10;
  if (sourceInventory.quantity === 0) {
    sourceInventory.stockStatus = 'Out of Stock';
  } else if (sourceInventory.quantity <= sourceReorderLevel) {
    sourceInventory.stockStatus = 'Low Stock';
  } else {
    sourceInventory.stockStatus = 'In Stock';
  }
  
  sourceInventory.lastAdjustmentDate = Date.now();
  sourceInventory.lastAdjustmentReason = `Transfer to ${transferData.destinationWarehouse}`;
  
  if (transferData.transferredBy) {
    sourceInventory.lastUpdatedBy = transferData.transferredBy;
  }
  
  sourceInventory.updatedAt = Date.now();
  
  // Update destination inventory
  destinationInventory.quantity += transferQuantity;
  
  // Update stock status based on new quantity
  const destReorderLevel = destinationInventory.reorderPoint || 10;
  if (destinationInventory.quantity === 0) {
    destinationInventory.stockStatus = 'Out of Stock';
  } else if (destinationInventory.quantity <= destReorderLevel) {
    destinationInventory.stockStatus = 'Low Stock';
  } else {
    destinationInventory.stockStatus = 'In Stock';
  }
  
  destinationInventory.lastAdjustmentDate = Date.now();
  destinationInventory.lastAdjustmentReason = `Transfer from ${transferData.sourceWarehouse}`;
  
  if (transferData.transferredBy) {
    destinationInventory.lastUpdatedBy = transferData.transferredBy;
  }
  
  destinationInventory.updatedAt = Date.now();
  
  // Save both inventories
  await sourceInventory.save();
  await destinationInventory.save();
  
  // Return both updated inventories
  return {
    sourceInventory: await Inventory.findById(sourceInventory._id)
      .populate("product", "name productID sku category")
      .populate("warehouse", "name warehouseID"),
    destinationInventory: await Inventory.findById(destinationInventory._id)
      .populate("product", "name productID sku category")
      .populate("warehouse", "name warehouseID")
  };
};

/**
 * Delete inventory by ID
 */
const deleteInventoryService = async (id) => {
  logger.debug(`deleteInventoryService called with ID: ${id}`);
  return await Inventory.deleteOne({ _id: id });
};

/**
 * Delete all inventory
 */
const deleteAllInventoryService = async () => {
  logger.debug("deleteAllInventoryService called");
  return await Inventory.deleteMany({});
};

module.exports = {
  getAllInventoryService,
  getInventoryByIdService,
  getInventoryByInventoryIDService,
  getInventoryByWarehouseService,
  getInventoryByProductService,
  getInventoryByStockStatusService,
  getLowStockInventoryService,
  getOutOfStockInventoryService,
  searchInventoryService,
  createOrUpdateInventoryService,
  adjustInventoryService,
  transferInventoryService,
  deleteInventoryService,
  deleteAllInventoryService
};
