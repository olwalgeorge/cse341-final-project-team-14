const Product = require("../models/product.model");
const logger = require("../utils/logger");

// Get all products
const getAllProductsService = async () => {
  logger.debug("getAllProductsService called");
  return await Product.find({});
};

// Get product by ID
const getProductByIdService = async (id) => {
  logger.debug(`getProductByIdService called with ID: ${id}`);
  return await Product.findById(id);
};

// Get products by category
const getProductsByCategoryService = async (category) => {
  logger.debug(
    `getProductsByCategoryService called with category: ${category}`
  );
  return await Product.find({ category: category });
};

// Get product by product ID (PR-XXXXX format)
const getProductByProductIDService = async (productID) => {
  logger.debug(
    `getProductByProductIDService called with product ID: ${productID}`
  );
  return await Product.findOne({ productID: productID });
};

/**
 * Search products by text (searches name, description, category)
 */
const searchProductsService = async (term) => {
  logger.debug(`searchProductsService called with term: ${term}`);
  return await Product.find(
    { $text: { $search: term } },
    { score: { $meta: "textScore" } }
  ).sort({ score: { $meta: "textScore" } });
};

/**
 * Get products by supplier ID
 */
const getProductsBySupplierService = async (supplierId) => {
  logger.debug(
    `getProductsBySupplierService called with supplier ID: ${supplierId}`
  );
  return await Product.find({ supplier: supplierId });
};

// Create a new product
const createProductService = async (productData) => {
  logger.debug("createProductService called with data:", productData);
  const product = new Product(productData);
  return await product.save();
};

// Update product by ID
const updateProductService = async (id, updateData) => {
  logger.debug(`updateProductService called with ID: ${id}`, updateData);
  return await Product.findByIdAndUpdate(id, updateData, { new: true });
};

// Delete product by ID
const deleteProductService = async (id) => {
  logger.debug(`deleteProductService called with ID: ${id}`);
  return await Product.deleteOne({ _id: id });
};

// Delete all products
const deleteAllProductsService = async () => {
  logger.debug("deleteAllProductsService called");
  return await Product.deleteMany({});
};

module.exports = {
  getAllProductsService,
  getProductByIdService,
  getProductsByCategoryService,
  getProductByProductIDService,
  getProductsBySupplierService,
  searchProductsService,
  createProductService,
  updateProductService,
  deleteProductService,
  deleteAllProductsService,
};
