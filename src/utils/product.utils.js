const Product = require("../models/product.model.js");
const logger = require("../utils/logger.js");

/**
 * Transform a product object to a cleaner format for API responses
 * @param {Object} product - The product object from the database
 * @returns {Object} - Transformed product object
 */
const transformProduct = (product) => {
  // Return null if product is null or undefined
  if (!product) {
    logger.warn("Attempted to transform a null or undefined product");
    return null;
  }

  // Create a transformed product object
  return {
    product_id: product._id,
    productID: product.productID,
    name: product.name,
    description: product.description,
    category: product.category,
    sku: product.sku,
    costPrice: product.costPrice,
    sellingPrice: product.sellingPrice,
    stockQuantity: product.stockQuantity || 0,
    tags: product.tags || [],
    unit: product.unit,
    supplier: product.supplier,
    images: product.images || [],
    isActive: product.isActive !== false, // Default to true if not specified
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
};

/**
 * Generate a unique product ID in the format PR-XXXXX
 * @returns {Promise<string>} - Generated product ID
 */
const generateProductId = async () => {
  try {
    const prefix = "PR-";
    const paddedLength = 5;

    // Find the highest existing ID
    const lastProduct = await Product.findOne(
      { productID: { $regex: `^${prefix}` } },
      { productID: 1 }
    )
      .sort({ productID: -1 })
      .lean();

    let nextId = 1;
    if (lastProduct) {
      // Extract the number part and increment by 1
      const lastIdNumber = parseInt(lastProduct.productID.split("-")[1]);
      nextId = lastIdNumber + 1;
    }

    // Format the ID to ensure it has 5 digits with leading zeros
    const formattedId = `${prefix}${nextId.toString().padStart(paddedLength, "0")}`;
    logger.debug(`Generated product ID: ${formattedId}`);
    return formattedId;
  } catch (error) {
    logger.error("Error generating product ID:", error);
    throw error;
  }
};

module.exports = {
  transformProduct,
  generateProductId,
};
