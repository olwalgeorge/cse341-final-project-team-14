const Counter = require("../models/counter.model");
const { createLogger } = require("./logger");
const logger = createLogger("SupplierUtils");

/**
 * Generate a unique supplier ID in the format SUP-XXXXX
 * @returns {Promise<string>} - Generated supplier ID
 */
const generateSupplierId = async () => {
  logger.debug("Generating supplierID");
  
  try {
    // Use the Counter.getNextId method
    const supplierID = await Counter.getNextId('supplierID', { 
      prefix: 'SUP-', 
      padLength: 5
    });
    
    logger.debug(`Generated supplierID: ${supplierID}`);
    return supplierID;
  } catch (error) {
    logger.error("Error generating supplierID:", error);
    throw error;
  }
};

/**
 * Transform supplier data for API response
 * @param {Object} supplier - Supplier document from database
 * @returns {Object} - Transformed supplier object
 */
const transformSupplier = (supplier) => {
  if (!supplier) return null;
  
  return {
    supplier_id: supplier._id,
    supplierID: supplier.supplierID,
    name: supplier.name,
    contactPerson: supplier.contactPerson,
    email: supplier.email,
    phone: supplier.phone,
    address: supplier.address,
    products: supplier.products,
    status: supplier.status,
    createdAt: supplier.createdAt,
    updatedAt: supplier.updatedAt
  };
};

module.exports = {
  generateSupplierId,
  transformSupplier
};
