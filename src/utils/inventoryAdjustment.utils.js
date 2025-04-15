const Counter = require("../models/counter.model");
const { createLogger } = require("./logger");
const logger = createLogger("InventoryAdjustmentUtils");

/**
 * Generate a unique inventory adjustment ID in the format ADJ-XXXXX
 * @returns {Promise<string>} - Generated adjustment ID
 */
const generateAdjustmentId = async () => {
  logger.debug("Generating adjustmentID");
  
  try {
    // Use the Counter.getNextId method
    const adjustmentID = await Counter.getNextId('adjustmentID', { 
      prefix: 'ADJ-', 
      padLength: 5
    });
    
    logger.debug(`Generated adjustmentID: ${adjustmentID}`);
    return adjustmentID;
  } catch (error) {
    logger.error("Error generating adjustmentID:", error);
    throw error;
  }
};

/**
 * Transform inventory adjustment data for API response
 * @param {Object} adjustment - Inventory adjustment document from database
 * @returns {Object} - Transformed adjustment object
 */
const transformAdjustment = (adjustment) => {
  if (!adjustment) return null;
  
  // Transform warehouse data
  let warehouseData = null;
  if (adjustment.warehouse) {
    if (typeof adjustment.warehouse === 'object' && adjustment.warehouse._id) {
      warehouseData = {
        warehouse_id: adjustment.warehouse._id,
        warehouseID: adjustment.warehouse.warehouseID || '',
        name: adjustment.warehouse.name || ''
      };
    } else {
      warehouseData = adjustment.warehouse;
    }
  }
  
  // Transform items
  let itemsData = [];
  if (adjustment.items && Array.isArray(adjustment.items)) {
    itemsData = adjustment.items.map(item => {
      const itemInfo = { 
        quantity: item.quantity,
        previousQuantity: item.previousQuantity,
        newQuantity: item.newQuantity,
        reason: item.reason
      };
      
      // Handle product data
      if (item.product) {
        if (typeof item.product === 'object' && item.product._id) {
          itemInfo.product = {
            product_id: item.product._id,
            productID: item.product.productID || '',
            name: item.product.name || '',
            sku: item.product.sku || ''
          };
        } else {
          itemInfo.product = item.product;
        }
      }
      
      return itemInfo;
    });
  }
  
  return {
    adjustment_id: adjustment._id,
    adjustmentID: adjustment.adjustmentID,
    warehouse: warehouseData,
    items: itemsData,
    adjustmentDate: adjustment.adjustmentDate,
    reason: adjustment.reason,
    type: adjustment.type,
    performedBy: adjustment.performedBy,
    approvedBy: adjustment.approvedBy,
    notes: adjustment.notes,
    createdAt: adjustment.createdAt,
    updatedAt: adjustment.updatedAt
  };
};

module.exports = {
  generateAdjustmentId,
  transformAdjustment
};
