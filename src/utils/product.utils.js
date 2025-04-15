const Counter = require("../models/counter.model");
const { createLogger } = require("../utils/logger.js");
const logger = createLogger("ProductUtils");

/**
 * Transform product data for API response
 */
const transformProduct = (product) => {
  if (!product) {
    logger.warn("Attempted to transform a null or undefined product");
    return null;
  }

  // Keep existing transformation logic if any, or implement a basic transform
  const transformed = {
    id: product._id,
    productID: product.productID,
    name: product.name,
    description: product.description,
    category: product.category,
    price: product.price,
    cost: product.cost,
    supplier: product.supplier,
    sku: product.sku,
    inStock: product.inStock,
    // Include other fields as needed
    createdAt: product.createdAt,
    updatedAt: product.updatedAt
  };

  return transformed;
};

/**
 * Generate unique product ID (PR-XXXXX format)
 */
const generateProductId = async () => {
  logger.debug("Generating productID");

  try {
    // Use the Counter.getNextId method
    const productID = await Counter.getNextId('productID', { 
      prefix: 'PR-', 
      padLength: 5
    });

    logger.debug(`Generated productID: ${productID}`);
    return productID;
  } catch (error) {
    logger.error("Error generating productID:", error);
    throw error;
  }
};

module.exports = {
  transformProduct,
  generateProductId
};
