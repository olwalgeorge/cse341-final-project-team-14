const InventoryAdjustment = require("../models/inventoryAdjustment.model");
const asyncHandler = require("express-async-handler");

/**
 * Generate a unique adjustment ID in the format ADJ-XXXXX
 * @returns {Promise<string>} - Generated adjustment ID
 */
const generateAdjustmentId = asyncHandler(async () => {
  const prefix = "ADJ-";
  const paddedLength = 5;

  const lastAdjustment = await InventoryAdjustment.findOne(
    { adjustmentID: { $regex: `^${prefix}` } },
    { adjustmentID: 1 },
    { sort: { adjustmentID: -1 } }
  );

  let nextNumber = 1;
  if (lastAdjustment) {
    const lastNumber = parseInt(lastAdjustment.adjustmentID.slice(prefix.length), 10);
    nextNumber = lastNumber + 1;
  }

  const paddedNumber = nextNumber.toString().padStart(paddedLength, "0");
  return `${prefix}${paddedNumber}`;
});

/**
 * Transform inventory adjustment document to API response format
 * @param {Object} inventoryAdjustment - Inventory adjustment document from database
 * @returns {Object} - Transformed inventory adjustment object
 */
const transformInventoryAdjustment = (inventoryAdjustment) => {
  if (!inventoryAdjustment) return null;
  
  // Transform warehouse
  let warehouseData = null;
  if (inventoryAdjustment.warehouse) {
    if (typeof inventoryAdjustment.warehouse === 'object' && inventoryAdjustment.warehouse._id) {
      warehouseData = {
        warehouse_id: inventoryAdjustment.warehouse._id,
        warehouseID: inventoryAdjustment.warehouse.warehouseID || '',
        name: inventoryAdjustment.warehouse.name || ''
      };
    } else {
      warehouseData = inventoryAdjustment.warehouse;
    }
  }
  
  // Transform items (products)
  let itemsData = [];
  if (inventoryAdjustment.items && inventoryAdjustment.items.length > 0) {
    itemsData = inventoryAdjustment.items.map(item => {
      let productData = null;
      if (item.product) {
        if (typeof item.product === 'object' && item.product._id) {
          productData = {
            product_id: item.product._id,
            productID: item.product.productID || '',
            name: item.product.name || '',
            category: item.product.category || ''
          };
        } else {
          productData = item.product;
        }
      }
      
      // Calculate quantity change if needed
      const quantityChange = item.quantityAfter - item.quantityBefore;
      
      return {
        product: productData,
        quantityBefore: item.quantityBefore,
        quantityAfter: item.quantityAfter,
        quantityChange: quantityChange,
        reason: item.reason
      };
    });
  }
  
  // Transform performedBy user
  let performedByData = null;
  if (inventoryAdjustment.performedBy) {
    if (typeof inventoryAdjustment.performedBy === 'object' && inventoryAdjustment.performedBy._id) {
      performedByData = {
        user_id: inventoryAdjustment.performedBy._id,
        fullName: inventoryAdjustment.performedBy.fullName || '',
        username: inventoryAdjustment.performedBy.username || '',
        email: inventoryAdjustment.performedBy.email || ''
      };
    } else {
      performedByData = inventoryAdjustment.performedBy;
    }
  }
  
  // Transform approvedBy user
  let approvedByData = null;
  if (inventoryAdjustment.approvedBy) {
    if (typeof inventoryAdjustment.approvedBy === 'object' && inventoryAdjustment.approvedBy._id) {
      approvedByData = {
        user_id: inventoryAdjustment.approvedBy._id,
        fullName: inventoryAdjustment.approvedBy.fullName || '',
        username: inventoryAdjustment.approvedBy.username || '',
        email: inventoryAdjustment.approvedBy.email || ''
      };
    } else {
      approvedByData = inventoryAdjustment.approvedBy;
    }
  }
  
  // Calculate total net change in quantity
  const totalQuantityChange = inventoryAdjustment.items ? 
    inventoryAdjustment.items.reduce((sum, item) => sum + (item.quantityAfter - item.quantityBefore), 0) : 0;
  
  return {
    adjustment_id: inventoryAdjustment._id,
    adjustmentID: inventoryAdjustment.adjustmentID,
    warehouse: warehouseData,
    reason: inventoryAdjustment.reason,
    description: inventoryAdjustment.description,
    items: itemsData,
    adjustmentDate: inventoryAdjustment.adjustmentDate,
    status: inventoryAdjustment.status,
    performedBy: performedByData,
    approvedBy: approvedByData,
    createdAt: inventoryAdjustment.createdAt,
    updatedAt: inventoryAdjustment.updatedAt,
    totalItems: inventoryAdjustment.items ? inventoryAdjustment.items.length : 0,
    totalQuantityChange: totalQuantityChange
  };
};

module.exports = {
  generateAdjustmentId,
  transformInventoryAdjustment
};
