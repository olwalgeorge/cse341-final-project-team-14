
const Counter = require("../models/counter.model");
const { createLogger } = require("./logger");
const logger = createLogger("InventoryReturnUtils");


/**
 * Generate a unique return ID in the format RET-XXXXX
 * @returns {Promise<string>} - Generated return ID
 */
const generateReturnId = async () => {
  logger.debug("Generating returnID");
  
  try {
    // Use the Counter.getNextId method
    const returnID = await Counter.getNextId('returnID', { 
      prefix: 'RET-', 
      padLength: 5
    });
    
    logger.debug(`Generated returnID: ${returnID}`);
    return returnID;
  } catch (error) {
    logger.error("Error generating returnID:", error);
    throw error;
  }
};

/**
 * Transform inventory return document to API response format
 * @param {Object} inventoryReturn - Inventory return document from database
 * @returns {Object} - Transformed inventory return object
 */
const transformInventoryReturn = (inventoryReturn) => {
  if (!inventoryReturn) return null;
  
  // Transform warehouse
  let warehouseData = null;
  if (inventoryReturn.warehouse) {
    if (typeof inventoryReturn.warehouse === 'object' && inventoryReturn.warehouse._id) {
      warehouseData = {
        warehouse_id: inventoryReturn.warehouse._id,
        warehouseID: inventoryReturn.warehouse.warehouseID || '',
        name: inventoryReturn.warehouse.name || ''
      };
    } else {
      warehouseData = inventoryReturn.warehouse;
    }
  }
  
  // Transform items (products)
  let itemsData = [];
  if (inventoryReturn.items && inventoryReturn.items.length > 0) {
    itemsData = inventoryReturn.items.map(item => {
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
      
      return {
        product: productData,
        quantity: item.quantity,
        reason: item.reason,
        condition: item.condition,
        action: item.action,
        notes: item.notes
      };
    });
  }
  
  // Transform requestedBy user
  let requestedByData = null;
  if (inventoryReturn.requestedBy) {
    if (typeof inventoryReturn.requestedBy === 'object' && inventoryReturn.requestedBy._id) {
      requestedByData = {
        user_id: inventoryReturn.requestedBy._id,
        fullName: inventoryReturn.requestedBy.fullName || '',
        username: inventoryReturn.requestedBy.username || '',
        email: inventoryReturn.requestedBy.email || ''
      };
    } else {
      requestedByData = inventoryReturn.requestedBy;
    }
  }
  
  // Transform approvedBy user
  let approvedByData = null;
  if (inventoryReturn.approvedBy) {
    if (typeof inventoryReturn.approvedBy === 'object' && inventoryReturn.approvedBy._id) {
      approvedByData = {
        user_id: inventoryReturn.approvedBy._id,
        fullName: inventoryReturn.approvedBy.fullName || '',
        username: inventoryReturn.approvedBy.username || '',
        email: inventoryReturn.approvedBy.email || ''
      };
    } else {
      approvedByData = inventoryReturn.approvedBy;
    }
  }
  
  // Transform processedBy user
  let processedByData = null;
  if (inventoryReturn.processedBy) {
    if (typeof inventoryReturn.processedBy === 'object' && inventoryReturn.processedBy._id) {
      processedByData = {
        user_id: inventoryReturn.processedBy._id,
        fullName: inventoryReturn.processedBy.fullName || '',
        username: inventoryReturn.processedBy.username || '',
        email: inventoryReturn.processedBy.email || ''
      };
    } else {
      processedByData = inventoryReturn.processedBy;
    }
  }
  
  return {
    return_id: inventoryReturn._id,
    returnID: inventoryReturn.returnID,
    sourceType: inventoryReturn.sourceType,
    source: inventoryReturn.source,
    relatedDocument: inventoryReturn.relatedDocument,
    warehouse: warehouseData,
    items: itemsData,
    returnDate: inventoryReturn.returnDate,
    processedDate: inventoryReturn.processedDate,
    status: inventoryReturn.status,
    requestedBy: requestedByData,
    approvedBy: approvedByData,
    processedBy: processedByData,
    notes: inventoryReturn.notes,
    createdAt: inventoryReturn.createdAt,
    updatedAt: inventoryReturn.updatedAt,
    totalItems: inventoryReturn.items ? inventoryReturn.items.length : 0,
    totalQuantity: inventoryReturn.items ? 
      inventoryReturn.items.reduce((sum, item) => sum + item.quantity, 0) : 0
  };
};

/**
 * Transform return data for API response
 */
const transformReturn = (returnData) => {
  if (!returnData) return null;
  
  // Keep existing transformation logic if any, or implement a basic transform
  const transformed = {
    id: returnData._id,
    returnID: returnData.returnID,
    supplier: returnData.supplier,
    warehouse: returnData.warehouse,
    items: returnData.items,
    status: returnData.status,
    reason: returnData.reason,
    // Include other fields as needed
    createdAt: returnData.createdAt,
    updatedAt: returnData.updatedAt
  };
  
  return transformed;
};

module.exports = {
  generateReturnId,
  transformInventoryReturn,
  transformReturn
};
