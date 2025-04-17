const Counter = require("../models/counter.model");
const { createLogger } = require("./logger");
const logger = createLogger("InventoryTransferUtils");

/**
 * Generate a unique inventory transfer ID in the format TR-XXXXX
 * @returns {Promise<string>} - Generated transfer ID
 */
const generateTransferId = async () => {
  logger.debug("Generating transferID");
  
  try {
    // Use the Counter.getNextId method
    const transferID = await Counter.getNextId('transferID', { 
      prefix: 'TR-', 
      padLength: 5
    });
    
    logger.debug(`Generated transferID: ${transferID}`);
    return transferID;
  } catch (error) {
    logger.error("Error generating transferID:", error);
    throw error;
  }
};

/**
 * Transform inventory transfer data for API response
 * @param {Object} transfer - Inventory transfer document from database
 * @returns {Object} - Transformed transfer object
 */
const transformTransfer = (transfer) => {
  if (!transfer) return null;
  
  // Transform source warehouse
  let sourceWarehouseData = null;
  if (transfer.sourceWarehouse) {
    if (typeof transfer.sourceWarehouse === 'object' && transfer.sourceWarehouse._id) {
      sourceWarehouseData = {
        warehouse_id: transfer.sourceWarehouse._id,
        warehouseID: transfer.sourceWarehouse.warehouseID || '',
        name: transfer.sourceWarehouse.name || ''
      };
    } else {
      sourceWarehouseData = transfer.sourceWarehouse;
    }
  }
  
  // Transform destination warehouse
  let destinationWarehouseData = null;
  if (transfer.destinationWarehouse) {
    if (typeof transfer.destinationWarehouse === 'object' && transfer.destinationWarehouse._id) {
      destinationWarehouseData = {
        warehouse_id: transfer.destinationWarehouse._id,
        warehouseID: transfer.destinationWarehouse.warehouseID || '',
        name: transfer.destinationWarehouse.name || ''
      };
    } else {
      destinationWarehouseData = transfer.destinationWarehouse;
    }
  }
  
  // Transform items
  let itemsData = [];
  if (transfer.items && Array.isArray(transfer.items)) {
    itemsData = transfer.items.map(item => {
      const itemInfo = { quantity: item.quantity };
      
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
    transfer_id: transfer._id,
    transferID: transfer.transferID,
    sourceWarehouse: sourceWarehouseData,
    destinationWarehouse: destinationWarehouseData,
    items: itemsData,
    transferDate: transfer.transferDate,
    status: transfer.status,
    initiatedBy: transfer.initiatedBy,
    approvedBy: transfer.approvedBy,
    completedBy: transfer.completedBy,
    notes: transfer.notes,
    createdAt: transfer.createdAt,
    updatedAt: transfer.updatedAt
  };
};

module.exports = {
  generateTransferId,
  transformTransfer
};
