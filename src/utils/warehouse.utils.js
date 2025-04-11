const Warehouse = require("../models/warehouse.model.js");
const logger = require("./logger.js");

/**
 * Transform warehouse document to API response format
 * @param {Object} warehouse - Warehouse document from database
 * @returns {Object} - Transformed warehouse object
 */
const transformWarehouse = (warehouse) => {
  if (!warehouse) return null;

  const transformed = {
    _id: warehouse._id,
    warehouseID: warehouse.warehouseID,
    name: warehouse.name,
    description: warehouse.description,
    capacity: warehouse.capacity,
    capacityUnit: warehouse.capacityUnit,
    status: warehouse.status,
    contact: warehouse.contact,
    address: warehouse.address,
    manager: warehouse.manager,
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
  try {
    // Find the highest existing warehouse ID
    const lastWarehouse = await Warehouse.findOne(
      { warehouseID: { $regex: /^WH-\d{5}$/ } },
      { warehouseID: 1 }
    )
      .sort({ warehouseID: -1 })
      .lean();

    let nextId = 1;
    if (lastWarehouse) {
      // Extract the number part and increment by 1
      const lastIdNumber = parseInt(lastWarehouse.warehouseID.split("-")[1]);
      nextId = lastIdNumber + 1;
    }

    // Format the ID to ensure it has 5 digits with leading zeros
    const formattedId = `WH-${nextId.toString().padStart(5, "0")}`;
    logger.debug(`Generated warehouse ID: ${formattedId}`);
    return formattedId;
  } catch (error) {
    logger.error("Error generating warehouse ID:", error);
    throw error;
  }
};

module.exports = {
  transformWarehouse,
  generateWarehouseId,
};
