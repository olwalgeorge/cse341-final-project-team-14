const InventoryTransfer = require("../models/inventoryTransfer.model");
const asyncHandler = require("express-async-handler");

/**
 * Generate a unique transfer ID in the format TR-XXXXX
 * @returns {Promise<string>} - Generated transfer ID
 */
const generateTransferId = asyncHandler(async () => {
  const prefix = "TR-";
  const paddedLength = 5;

  const lastTransfer = await InventoryTransfer.findOne(
    { transferID: { $regex: `^${prefix}` } },
    { transferID: 1 },
    { sort: { transferID: -1 } }
  );

  let nextNumber = 1;
  if (lastTransfer) {
    const lastNumber = parseInt(lastTransfer.transferID.slice(prefix.length), 10);
    nextNumber = lastNumber + 1;
  }

  const paddedNumber = nextNumber.toString().padStart(paddedLength, "0");
  return `${prefix}${paddedNumber}`;
});

/**
 * Transform inventory transfer document to API response format
 * @param {Object} inventoryTransfer - Inventory transfer document from database
 * @returns {Object} - Transformed inventory transfer object
 */
const transformInventoryTransfer = (inventoryTransfer) => {
  if (!inventoryTransfer) return null;
  
  // Transform fromWarehouse
  let fromWarehouseData = null;
  if (inventoryTransfer.fromWarehouse) {
    if (typeof inventoryTransfer.fromWarehouse === 'object' && inventoryTransfer.fromWarehouse._id) {
      fromWarehouseData = {
        warehouse_id: inventoryTransfer.fromWarehouse._id,
        warehouseID: inventoryTransfer.fromWarehouse.warehouseID || '',
        name: inventoryTransfer.fromWarehouse.name || ''
      };
    } else {
      fromWarehouseData = inventoryTransfer.fromWarehouse;
    }
  }
  
  // Transform toWarehouse
  let toWarehouseData = null;
  if (inventoryTransfer.toWarehouse) {
    if (typeof inventoryTransfer.toWarehouse === 'object' && inventoryTransfer.toWarehouse._id) {
      toWarehouseData = {
        warehouse_id: inventoryTransfer.toWarehouse._id,
        warehouseID: inventoryTransfer.toWarehouse.warehouseID || '',
        name: inventoryTransfer.toWarehouse.name || ''
      };
    } else {
      toWarehouseData = inventoryTransfer.toWarehouse;
    }
  }
  
  // Transform items (products)
  let itemsData = [];
  if (inventoryTransfer.items && inventoryTransfer.items.length > 0) {
    itemsData = inventoryTransfer.items.map(item => {
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
        receivedQuantity: item.receivedQuantity || 0,
        notes: item.notes
      };
    });
  }
  
  // Transform requestedBy user
  let requestedByData = null;
  if (inventoryTransfer.requestedBy) {
    if (typeof inventoryTransfer.requestedBy === 'object' && inventoryTransfer.requestedBy._id) {
      requestedByData = {
        user_id: inventoryTransfer.requestedBy._id,
        fullName: inventoryTransfer.requestedBy.fullName || '',
        username: inventoryTransfer.requestedBy.username || '',
        email: inventoryTransfer.requestedBy.email || ''
      };
    } else {
      requestedByData = inventoryTransfer.requestedBy;
    }
  }
  
  // Transform approvedBy user
  let approvedByData = null;
  if (inventoryTransfer.approvedBy) {
    if (typeof inventoryTransfer.approvedBy === 'object' && inventoryTransfer.approvedBy._id) {
      approvedByData = {
        user_id: inventoryTransfer.approvedBy._id,
        fullName: inventoryTransfer.approvedBy.fullName || '',
        username: inventoryTransfer.approvedBy.username || '',
        email: inventoryTransfer.approvedBy.email || ''
      };
    } else {
      approvedByData = inventoryTransfer.approvedBy;
    }
  }
  
  // Transform receivedBy user
  let receivedByData = null;
  if (inventoryTransfer.receivedBy) {
    if (typeof inventoryTransfer.receivedBy === 'object' && inventoryTransfer.receivedBy._id) {
      receivedByData = {
        user_id: inventoryTransfer.receivedBy._id,
        fullName: inventoryTransfer.receivedBy.fullName || '',
        username: inventoryTransfer.receivedBy.username || '',
        email: inventoryTransfer.receivedBy.email || ''
      };
    } else {
      receivedByData = inventoryTransfer.receivedBy;
    }
  }
  
  // Calculate completion percentage
  const totalQuantity = inventoryTransfer.items ? 
    inventoryTransfer.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  
  const totalReceived = inventoryTransfer.items ? 
    inventoryTransfer.items.reduce((sum, item) => sum + (item.receivedQuantity || 0), 0) : 0;
  
  const completionPercentage = totalQuantity > 0 ? 
    Math.round((totalReceived / totalQuantity) * 100) : 0;
  
  return {
    transfer_id: inventoryTransfer._id,
    transferID: inventoryTransfer.transferID,
    fromWarehouse: fromWarehouseData,
    toWarehouse: toWarehouseData,
    items: itemsData,
    requestDate: inventoryTransfer.requestDate,
    expectedDeliveryDate: inventoryTransfer.expectedDeliveryDate,
    completionDate: inventoryTransfer.completionDate,
    status: inventoryTransfer.status,
    requestedBy: requestedByData,
    approvedBy: approvedByData,
    receivedBy: receivedByData,
    transportInfo: inventoryTransfer.transportInfo,
    notes: inventoryTransfer.notes,
    createdAt: inventoryTransfer.createdAt,
    updatedAt: inventoryTransfer.updatedAt,
    totalItems: inventoryTransfer.items ? inventoryTransfer.items.length : 0,
    totalQuantity: totalQuantity,
    totalReceivedQuantity: totalReceived,
    completionPercentage: completionPercentage
  };
};

module.exports = {
  generateTransferId,
  transformInventoryTransfer
};
