
const Counter = require("../models/counter.model");
const { createLogger } = require("./logger");
const logger = createLogger("WarehouseUtils");

/**
 * Transform warehouse document to API response format
 * @param {Object} warehouse - Warehouse document from database
 * @returns {Object} - Transformed warehouse object
 */
const transformWarehouse = (warehouse) => {
  if (!warehouse) return null;

  const transformed = {
    id: warehouse._id,
    warehouseID: warehouse.warehouseID,
    name: warehouse.name,
    location: warehouse.location,
    status: warehouse.status,
    createdAt: warehouse.createdAt,
    updatedAt: warehouse.updatedAt,
  };

  return transformed;
};

/**
 * Generate a unique warehouse ID in the format WH-XXXXX
 * @returns {Promise<string>} - Generated warehouse ID
 */
const generateWarehouseId = async () => {
  logger.debug("Generating warehouseID");

  try {
    // Use the Counter.getNextId method
    const warehouseID = await Counter.getNextId("warehouseID", {
      prefix: "WH-",
      padLength: 5,
    });

    logger.debug(`Generated warehouseID: ${warehouseID}`);
    return warehouseID;
  } catch (error) {
    logger.error("Error generating warehouseID:", error);
    throw error;
  }
};

module.exports = {
  transformWarehouse,
  generateWarehouseId,
};
