const Inventory = require("../models/inventory.model.js");
const logger = require("./logger.js");

/**
 * Transform inventory document to API response format
 * @param {Object} inventory - Inventory document from database
 * @returns {Object} - Transformed inventory object
 */
const transformInventory = (inventory) => {
  if (!inventory) return null;

  const transformed = {
    _id: inventory._id,
    inventoryID: inventory.inventoryID,
    product: inventory.product,
    warehouse: inventory.warehouse,
    quantity: inventory.quantity,
    minStockLevel: inventory.minStockLevel,
    maxStockLevel: inventory.maxStockLevel,
    stockStatus: inventory.stockStatus,
    location: inventory.location,
    lastStockCheck: inventory.lastStockCheck,
    notes: inventory.notes,
    createdAt: inventory.createdAt,
    updatedAt: inventory.updatedAt,
  };

  return transformed;
};

/**
 * Generate a unique inventory ID in the format IN-XXXXX
 * @returns {Promise<string>} - Generated inventory ID
 */
const generateInventoryId = async () => {
  try {
    // Find the highest existing inventory ID
    const lastInventory = await Inventory.findOne(
      { inventoryID: { $regex: /^IN-\d{5}$/ } },
      { inventoryID: 1 }
    )
      .sort({ inventoryID: -1 })
      .lean();

    let nextId = 1;
    if (lastInventory) {
      // Extract the number part and increment by 1
      const lastIdNumber = parseInt(lastInventory.inventoryID.split("-")[1]);
      nextId = lastIdNumber + 1;
    }

    // Format the ID to ensure it has 5 digits with leading zeros
    const formattedId = `IN-${nextId.toString().padStart(5, "0")}`;
    logger.debug(`Generated inventory ID: ${formattedId}`);
    return formattedId;
  } catch (error) {
    logger.error("Error generating inventory ID:", error);
    throw error;
  }
};

module.exports = {
  transformInventory,
  generateInventoryId,
};
