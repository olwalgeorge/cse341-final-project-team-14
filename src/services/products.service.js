const Product = require("../models/product.model");
const logger = require("../utils/logger");
const APIFeatures = require("../utils/apiFeatures.js");

/**
 * Get all products with optional filtering, pagination, and sorting
 */
const getAllProductsService = async (query = {}) => {
  try {
    // Define custom filters mapping
    const customFilters = {
      category: 'category',
      supplier: 'supplier',
      minPrice: {
        field: 'sellingPrice',
        transform: (value) => ({ $gte: parseFloat(value) })
      },
      maxPrice: {
        field: 'sellingPrice',
        transform: (value) => ({ $lte: parseFloat(value) })
      },
      inStock: {
        field: 'inStock',
        transform: (value) => value === 'true'
      }
    };

    // Build filter using APIFeatures utility
    const filter = APIFeatures.buildFilter(query, customFilters);

    // Get pagination parameters
    const pagination = APIFeatures.getPagination(query);
    
    // Get sort parameters with default sort by name
    const sort = APIFeatures.getSort(query, 'name');

    // Execute query
    const products = await Product.find(filter)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit);

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    return {
      products,
      pagination: APIFeatures.paginationResult(total, pagination)
    };
  } catch (error) {
    logger.error("Error in getAllProductsService:", error);
    throw error;
  }
};

/**
 * Get product by ID
 */
const getProductByIdService = async (id) => {
  logger.debug(`getProductByIdService called with ID: ${id}`);
  return await Product.findById(id);
};

/**
 * Get products by category with pagination and sorting
 */
const getProductsByCategoryService = async (category, query = {}) => {
  try {
    logger.debug(`getProductsByCategoryService called with category: ${category}`);
    
    // Get pagination parameters
    const pagination = APIFeatures.getPagination(query);
    
    // Get sort parameters with default sort by name
    const sort = APIFeatures.getSort(query, 'name');

    // Execute query
    const products = await Product.find({ category: category })
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit);

    // Get total count for pagination
    const total = await Product.countDocuments({ category: category });

    return {
      products,
      pagination: APIFeatures.paginationResult(total, pagination)
    };
  } catch (error) {
    logger.error(`Error in getProductsByCategoryService for category ${category}:`, error);
    throw error;
  }
};

/**
 * Get product by product ID (PR-XXXXX format)
 */
const getProductByProductIDService = async (productID) => {
  logger.debug(`getProductByProductIDService called with product ID: ${productID}`);
  return await Product.findOne({ productID: productID });
};

/**
 * Search products by text (searches name, description, category)
 * with pagination and sorting
 */
const searchProductsService = async (term, query = {}) => {
  try {
    logger.debug(`searchProductsService called with term: ${term}`);
    
    // Get pagination parameters
    const pagination = APIFeatures.getPagination(query);

    // Execute text search query with text score sorting
    const products = await Product.find(
      { $text: { $search: term } },
      { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" } })
    .skip(pagination.skip)
    .limit(pagination.limit);

    // Get total count for pagination
    const total = await Product.countDocuments({ $text: { $search: term } });

    return {
      products,
      pagination: APIFeatures.paginationResult(total, pagination)
    };
  } catch (error) {
    logger.error(`Error in searchProductsService for term ${term}:`, error);
    throw error;
  }
};

/**
 * Get products by supplier ID with pagination and sorting
 */
const getProductsBySupplierService = async (supplierId, query = {}) => {
  try {
    logger.debug(`getProductsBySupplierService called with supplier ID: ${supplierId}`);
    
    // Get pagination parameters
    const pagination = APIFeatures.getPagination(query);
    
    // Get sort parameters with default sort by name
    const sort = APIFeatures.getSort(query, 'name');

    // Execute query
    const products = await Product.find({ supplier: supplierId })
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit);

    // Get total count for pagination
    const total = await Product.countDocuments({ supplier: supplierId });

    return {
      products,
      pagination: APIFeatures.paginationResult(total, pagination)
    };
  } catch (error) {
    logger.error(`Error in getProductsBySupplierService for supplier ${supplierId}:`, error);
    throw error;
  }
};

/**
 * Create a new product
 */
const createProductService = async (productData) => {
  logger.debug("createProductService called with data:", productData);
  const product = new Product(productData);
  return await product.save();
};

/**
 * Update product by ID
 */
const updateProductService = async (id, updateData) => {
  logger.debug(`updateProductService called with ID: ${id}`, updateData);
  return await Product.findByIdAndUpdate(
    id, 
    { ...updateData, updatedAt: Date.now() }, 
    { new: true, runValidators: true }
  );
};

/**
 * Delete product by ID
 */
const deleteProductService = async (id) => {
  logger.debug(`deleteProductService called with ID: ${id}`);
  return await Product.deleteOne({ _id: id });
};

/**
 * Delete all products
 */
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
