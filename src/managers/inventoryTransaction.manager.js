/**
 * Inventory Transaction Manager
 * 
 * This manager is responsible for coordinating all inventory transactions
 * and ensuring inventory is properly updated and tracked across the system.
 * It centralizes inventory update logic to maintain consistency.
 */

const mongoose = require('mongoose');
const Inventory = require('../models/inventory.model.js');
const InventoryTransaction = require('../models/transaction.model.js');
const { generateTransactionId } = require('../utils/inventoryTransaction.utils.js');
const logger = require('../utils/logger.js');

/**
 * Updates inventory quantity and creates a transaction record
 * @param {Object} transactionData - Data for the inventory transaction
 * @param {String} transactionData.transactionType - Type of transaction (Purchase, Sale, Transfer In, etc.)
 * @param {String} transactionData.product - Product ID
 * @param {String} transactionData.warehouse - Warehouse ID
 * @param {Number} transactionData.quantityChange - Change in quantity (positive for increase, negative for decrease)
 * @param {String} transactionData.performedBy - User ID of the person performing the transaction
 * @param {Object} [transactionData.reference] - Reference to source document (optional)
 * @param {String} [transactionData.fromWarehouse] - Source warehouse for transfers (optional)
 * @param {String} [transactionData.toWarehouse] - Destination warehouse for transfers (optional)
 * @param {String} [transactionData.notes] - Additional notes about the transaction (optional)
 * @returns {Promise<Object>} - Created transaction object
 */
const updateInventory = async (transactionData) => {
  const session = await mongoose.startSession();
  let createdTransaction;

  try {
    await session.withTransaction(async () => {
      // Find or create inventory record
      let inventory = await Inventory.findOne({
        product: transactionData.product,
        warehouse: transactionData.warehouse
      }).session(session);

      if (!inventory && transactionData.quantityChange > 0) {
        // Create new inventory record if it doesn't exist and we're adding stock
        inventory = await Inventory.create([{
          inventoryID: `IN-${Math.floor(10000 + Math.random() * 90000)}`, // Generate a unique ID
          product: transactionData.product,
          warehouse: transactionData.warehouse,
          quantity: 0,
          minStockLevel: 10,
          maxStockLevel: 100
        }], { session });
        inventory = inventory[0]; // Unwrap from array
      } else if (!inventory) {
        throw new Error(`No inventory record found for product ${transactionData.product} in warehouse ${transactionData.warehouse}`);
      }

      // Verify we have enough stock for negative quantity changes
      if (transactionData.quantityChange < 0 && inventory.quantity + transactionData.quantityChange < 0) {
        throw new Error(`Insufficient quantity available for product ${transactionData.product}. Available: ${inventory.quantity}, Requested change: ${transactionData.quantityChange}`);
      }

      // Complete transaction data with inventory information
      const completeTransactionData = {
        ...transactionData,
        inventory: inventory._id,
        transactionID: await generateTransactionId(),
        quantityBefore: inventory.quantity,
        quantityAfter: inventory.quantity + transactionData.quantityChange
      };

      // Create transaction record
      [createdTransaction] = await InventoryTransaction.create([completeTransactionData], { session });

      // Update inventory quantity
      inventory.quantity += transactionData.quantityChange;
      inventory.lastStockCheck = new Date();
      await inventory.save({ session });

      // Return the fully populated transaction
      createdTransaction = await InventoryTransaction.findById(createdTransaction._id)
        .session(session)
        .populate("product", "name productID sku category")
        .populate("warehouse", "name warehouseID")
        .populate("fromWarehouse", "name warehouseID")
        .populate("toWarehouse", "name warehouseID")
        .populate("performedBy", "fullName email username");
    });

    return createdTransaction;
  } catch (error) {
    logger.error("Error in inventory transaction manager updateInventory:", error);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Process a purchase transaction, increasing inventory
 * @param {Object} purchaseData - Data for the purchase
 * @param {String} purchaseData.product - Product ID
 * @param {String} purchaseData.warehouse - Warehouse ID
 * @param {Number} purchaseData.quantity - Quantity purchased
 * @param {String} purchaseData.performedBy - User ID
 * @param {Object} purchaseData.reference - Reference to purchase document
 * @returns {Promise<Object>} - Created transaction
 */
const processPurchase = async (purchaseData) => {
  return await updateInventory({
    transactionType: "Purchase",
    product: purchaseData.product,
    warehouse: purchaseData.warehouse,
    quantityChange: purchaseData.quantity,
    performedBy: purchaseData.performedBy,
    reference: purchaseData.reference,
    notes: purchaseData.notes || "Stock received from supplier"
  });
};

/**
 * Process a sale transaction, decreasing inventory
 * @param {Object} saleData - Data for the sale
 * @param {String} saleData.product - Product ID
 * @param {String} saleData.warehouse - Warehouse ID
 * @param {Number} saleData.quantity - Quantity sold
 * @param {String} saleData.performedBy - User ID
 * @param {Object} saleData.reference - Reference to order document
 * @returns {Promise<Object>} - Created transaction
 */
const processSale = async (saleData) => {
  return await updateInventory({
    transactionType: "Sale",
    product: saleData.product,
    warehouse: saleData.warehouse,
    quantityChange: -saleData.quantity, // Negative for sales
    performedBy: saleData.performedBy,
    reference: saleData.reference,
    notes: saleData.notes || "Stock sold to customer"
  });
};

/**
 * Process an inventory adjustment
 * @param {Object} adjustmentData - Data for the adjustment
 * @param {String} adjustmentData.product - Product ID
 * @param {String} adjustmentData.warehouse - Warehouse ID
 * @param {Number} adjustmentData.quantityBefore - Original quantity
 * @param {Number} adjustmentData.quantityAfter - New quantity after adjustment
 * @param {String} adjustmentData.performedBy - User ID
 * @param {Object} adjustmentData.reference - Reference to adjustment document
 * @returns {Promise<Object>} - Created transaction
 */
const processAdjustment = async (adjustmentData) => {
  const quantityChange = adjustmentData.quantityAfter - adjustmentData.quantityBefore;
  return await updateInventory({
    transactionType: "Adjustment",
    product: adjustmentData.product,
    warehouse: adjustmentData.warehouse,
    quantityChange: quantityChange,
    performedBy: adjustmentData.performedBy,
    reference: adjustmentData.reference,
    notes: adjustmentData.notes || `Inventory adjusted by ${quantityChange} units`
  });
};

/**
 * Process inventory transfer out (source warehouse)
 * @param {Object} transferData - Data for the transfer
 * @param {String} transferData.product - Product ID
 * @param {String} transferData.fromWarehouse - Source warehouse ID
 * @param {String} transferData.toWarehouse - Destination warehouse ID
 * @param {Number} transferData.quantity - Quantity to transfer
 * @param {String} transferData.performedBy - User ID
 * @param {Object} transferData.reference - Reference to transfer document
 * @returns {Promise<Object>} - Created transaction
 */
const processTransferOut = async (transferData) => {
  return await updateInventory({
    transactionType: "Transfer Out",
    product: transferData.product,
    warehouse: transferData.fromWarehouse,
    quantityChange: -transferData.quantity, // Negative for transfers out
    fromWarehouse: transferData.fromWarehouse,
    toWarehouse: transferData.toWarehouse,
    performedBy: transferData.performedBy,
    reference: transferData.reference,
    notes: transferData.notes || `Transfer out to warehouse ${transferData.toWarehouse}`
  });
};

/**
 * Process inventory transfer in (destination warehouse)
 * @param {Object} transferData - Data for the transfer
 * @param {String} transferData.product - Product ID
 * @param {String} transferData.fromWarehouse - Source warehouse ID
 * @param {String} transferData.toWarehouse - Destination warehouse ID
 * @param {Number} transferData.quantity - Quantity to transfer
 * @param {String} transferData.performedBy - User ID
 * @param {Object} transferData.reference - Reference to transfer document
 * @returns {Promise<Object>} - Created transaction
 */
const processTransferIn = async (transferData) => {
  return await updateInventory({
    transactionType: "Transfer In",
    product: transferData.product,
    warehouse: transferData.toWarehouse,
    quantityChange: transferData.quantity, // Positive for transfers in
    fromWarehouse: transferData.fromWarehouse,
    toWarehouse: transferData.toWarehouse,
    performedBy: transferData.performedBy,
    reference: transferData.reference,
    notes: transferData.notes || `Transfer in from warehouse ${transferData.fromWarehouse}`
  });
};

/**
 * Process inventory return to stock
 * @param {Object} returnData - Data for the return
 * @param {String} returnData.product - Product ID
 * @param {String} returnData.warehouse - Warehouse ID
 * @param {Number} returnData.quantity - Quantity returned
 * @param {String} returnData.performedBy - User ID
 * @param {Object} returnData.reference - Reference to return document
 * @returns {Promise<Object>} - Created transaction
 */
const processReturn = async (returnData) => {
  return await updateInventory({
    transactionType: "Return",
    product: returnData.product,
    warehouse: returnData.warehouse,
    quantityChange: returnData.quantity, // Positive for returns to stock
    performedBy: returnData.performedBy,
    reference: returnData.reference,
    notes: returnData.notes || "Product returned to inventory"
  });
};

/**
 * Record damaged inventory, decreasing available quantity
 * @param {Object} damageData - Data for the damage record
 * @param {String} damageData.product - Product ID
 * @param {String} damageData.warehouse - Warehouse ID
 * @param {Number} damageData.quantity - Quantity damaged
 * @param {String} damageData.performedBy - User ID
 * @returns {Promise<Object>} - Created transaction
 */
const recordDamage = async (damageData) => {
  return await updateInventory({
    transactionType: "Damaged",
    product: damageData.product,
    warehouse: damageData.warehouse,
    quantityChange: -damageData.quantity, // Negative for damaged items
    performedBy: damageData.performedBy,
    notes: damageData.notes || "Product damaged and removed from inventory"
  });
};

/**
 * Record expired inventory, decreasing available quantity
 * @param {Object} expiryData - Data for the expiry record
 * @param {String} expiryData.product - Product ID
 * @param {String} expiryData.warehouse - Warehouse ID
 * @param {Number} expiryData.quantity - Quantity expired
 * @param {String} expiryData.performedBy - User ID
 * @returns {Promise<Object>} - Created transaction
 */
const recordExpiry = async (expiryData) => {
  return await updateInventory({
    transactionType: "Expired",
    product: expiryData.product,
    warehouse: expiryData.warehouse,
    quantityChange: -expiryData.quantity, // Negative for expired items
    performedBy: expiryData.performedBy,
    notes: expiryData.notes || "Product expired and removed from inventory"
  });
};

/**
 * Get current stock level for a product in a specific warehouse
 * @param {String} productId - Product ID
 * @param {String} warehouseId - Warehouse ID
 * @returns {Promise<Object>} - Inventory information
 */
const getStockLevel = async (productId, warehouseId) => {
  const inventory = await Inventory.findOne({
    product: productId,
    warehouse: warehouseId
  })
    .populate("product", "name productID sku category")
    .populate("warehouse", "name warehouseID");

  return inventory;
};

/**
 * Get products that are at or below their minimum stock level
 * @returns {Promise<Array>} - List of inventory items with low stock
 */
const getLowStockItems = async () => {
  return await Inventory.find({
    $or: [
      { stockStatus: "Low Stock" },
      { stockStatus: "Out of Stock" }
    ]
  })
    .populate("product", "name productID sku category")
    .populate("warehouse", "name warehouseID")
    .sort({ warehouse: 1, quantity: 1 });
};

/**
 * Get product inventory across all warehouses
 * @param {String} productId - Product ID
 * @returns {Promise<Array>} - Inventory records for the product in all warehouses
 */
const getProductInventory = async (productId) => {
  return await Inventory.find({
    product: productId
  })
    .populate("warehouse", "name warehouseID location")
    .sort("warehouse");
};

/**
 * Get all inventory in a warehouse
 * @param {String} warehouseId - Warehouse ID
 * @returns {Promise<Array>} - Inventory records in the warehouse
 */
const getWarehouseInventory = async (warehouseId) => {
  return await Inventory.find({
    warehouse: warehouseId
  })
    .populate("product", "name productID sku category")
    .sort("product.name");
};

module.exports = {
  updateInventory,
  processPurchase,
  processSale,
  processAdjustment,
  processTransferOut,
  processTransferIn,
  processReturn,
  recordDamage,
  recordExpiry,
  getStockLevel,
  getLowStockItems,
  getProductInventory,
  getWarehouseInventory
};