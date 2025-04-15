const Counter = require("../models/counter.model");
const { createLogger } = require("./logger");
const logger = createLogger("InventoryTransactionUtils");

/**
 * Generate a unique inventory transaction ID in the format IT-XXXXX
 * @returns {Promise<string>} - Generated transaction ID
 */
const generateTransactionId = async () => {
  logger.debug("Generating transactionID");
  
  try {
    // Use the Counter.getNextId method
    const transactionID = await Counter.getNextId('transactionID', { 
      prefix: 'IT-', 
      padLength: 5
    });
    
    logger.debug(`Generated transactionID: ${transactionID}`);
    return transactionID;
  } catch (error) {
    logger.error("Error generating transactionID:", error);
    throw error;
  }
};

/**
 * Transform inventory transaction data for API response
 * @param {Object} transaction - Inventory transaction document from database
 * @returns {Object} - Transformed transaction object
 */
const transformTransaction = (transaction) => {
  if (!transaction) return null;
  
  // Transform warehouse data
  let warehouseData = null;
  if (transaction.warehouse) {
    if (typeof transaction.warehouse === 'object' && transaction.warehouse._id) {
      warehouseData = {
        warehouse_id: transaction.warehouse._id,
        warehouseID: transaction.warehouse.warehouseID || '',
        name: transaction.warehouse.name || ''
      };
    } else {
      warehouseData = transaction.warehouse;
    }
  }
  
  // Transform product data
  let productData = null;
  if (transaction.product) {
    if (typeof transaction.product === 'object' && transaction.product._id) {
      productData = {
        product_id: transaction.product._id,
        productID: transaction.product.productID || '',
        name: transaction.product.name || '',
        sku: transaction.product.sku || ''
      };
    } else {
      productData = transaction.product;
    }
  }
  
  return {
    transaction_id: transaction._id,
    transactionID: transaction.transactionID,
    warehouse: warehouseData,
    product: productData,
    type: transaction.type,
    quantity: transaction.quantity,
    previousQuantity: transaction.previousQuantity,
    newQuantity: transaction.newQuantity,
    referenceType: transaction.referenceType,
    referenceId: transaction.referenceId,
    date: transaction.date,
    performedBy: transaction.performedBy,
    notes: transaction.notes,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt
  };
};

module.exports = {
  generateTransactionId,
  transformTransaction
};
