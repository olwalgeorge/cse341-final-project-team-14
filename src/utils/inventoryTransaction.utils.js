const InventoryTransaction = require("../models/transaction.model");
const asyncHandler = require("express-async-handler");

/**
 * Generate a unique transaction ID in the format IT-XXXXX
 * @returns {Promise<string>} - Generated transaction ID
 */
const generateTransactionId = asyncHandler(async () => {
  const prefix = "IT-";
  const paddedLength = 5;

  const lastTransaction = await InventoryTransaction.findOne(
    { transactionID: { $regex: `^${prefix}` } },
    { transactionID: 1 },
    { sort: { transactionID: -1 } }
  );

  let nextNumber = 1;
  if (lastTransaction) {
    const lastNumber = parseInt(lastTransaction.transactionID.slice(prefix.length), 10);
    nextNumber = lastNumber + 1;
  }

  const paddedNumber = nextNumber.toString().padStart(paddedLength, "0");
  return `${prefix}${paddedNumber}`;
});

/**
 * Transform inventory transaction document to API response format
 * @param {Object} transaction - Inventory transaction document from database
 * @returns {Object} - Transformed inventory transaction object
 */
const transformInventoryTransaction = (transaction) => {
  if (!transaction) return null;
  
  let productData = null;
  if (transaction.product) {
    if (typeof transaction.product === 'object' && transaction.product._id) {
      productData = {
        product_id: transaction.product._id,
        productID: transaction.product.productID || '',
        name: transaction.product.name || '',
        category: transaction.product.category || ''
      };
    } else {
      productData = transaction.product;
    }
  }
  
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
  
  let fromWarehouseData = null;
  if (transaction.fromWarehouse) {
    if (typeof transaction.fromWarehouse === 'object' && transaction.fromWarehouse._id) {
      fromWarehouseData = {
        warehouse_id: transaction.fromWarehouse._id,
        warehouseID: transaction.fromWarehouse.warehouseID || '',
        name: transaction.fromWarehouse.name || ''
      };
    } else {
      fromWarehouseData = transaction.fromWarehouse;
    }
  }
  
  let toWarehouseData = null;
  if (transaction.toWarehouse) {
    if (typeof transaction.toWarehouse === 'object' && transaction.toWarehouse._id) {
      toWarehouseData = {
        warehouse_id: transaction.toWarehouse._id,
        warehouseID: transaction.toWarehouse.warehouseID || '',
        name: transaction.toWarehouse.name || ''
      };
    } else {
      toWarehouseData = transaction.toWarehouse;
    }
  }
  
  return {
    transaction_id: transaction._id,
    transactionID: transaction.transactionID,
    inventory: transaction.inventory,
    product: productData,
    warehouse: warehouseData,
    transactionType: transaction.transactionType,
    quantityBefore: transaction.quantityBefore,
    quantityChange: transaction.quantityChange,
    quantityAfter: transaction.quantityAfter,
    reference: transaction.reference,
    fromWarehouse: fromWarehouseData,
    toWarehouse: toWarehouseData,
    performedBy: transaction.performedBy,
    transactionDate: transaction.transactionDate,
    notes: transaction.notes,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt
  };
};

module.exports = {
  generateTransactionId,
  transformInventoryTransaction
};
