// Description: Utility functions for inventory management, including transforming inventory data and generating unique inventory IDs.
const Counter = require("../models/counter.model");
const { createLogger} = require("./logger");
const logger = createLogger("InventoryUtils");

/**
 * Transform inventory data for API response
 */
const transformInventory = (inventory) => {
  if (!inventory) return null;
  
  const transformed = {
    inventory_id: inventory._id,
    inventoryID: inventory.inventoryID,
    product: inventory.product,
    warehouse: inventory.warehouse,
    quantity: inventory.quantity,
    stockStatus: inventory.stockStatus,
    location: inventory.location,
    reorderPoint: inventory.reorderPoint,
    lastStockCheck: inventory.lastStockCheck,
    lastAdjustmentDate: inventory.lastAdjustmentDate,
    lastAdjustmentReason: inventory.lastAdjustmentReason,
    createdAt: inventory.createdAt,
    updatedAt: inventory.updatedAt
  };
  
  return transformed;
};

/**
 * Generate unique inventory ID (IN-XXXXX format)
 */
const generateInventoryId = async () => {
  logger.debug("Generating inventoryID");
  
  try {
    // Use the new Counter.getNextId method
    const inventoryID = await Counter.getNextId('inventoryID', { 
      prefix: 'IN-', 
      padLength: 5
    });
    
    logger.debug(`Generated inventoryID: ${inventoryID}`);
    return inventoryID;
  } catch (error) {
    logger.error("Error generating inventoryID:", error);
    throw error;
  }
};

module.exports = {
  transformInventory,
  generateInventoryId
};
