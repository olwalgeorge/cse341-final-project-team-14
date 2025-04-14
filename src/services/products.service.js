const Product = require("../models/product.model");
const logger = require("../utils/logger");
const APIFeatures = require("../utils/apiFeatures.js");
const { ValidationError } = require("../utils/errors.js");

/**
 * Get all products with optional filtering, pagination, and sorting
 */
const getAllProductsService = async (query = {}) => {
  logger.debug("getAllProductsService called with query:", query);
  
  try {
    // Define custom filters mapping
    const customFilters = {
      name: {
        field: 'name',
        transform: (value) => ({ $regex: value, $options: 'i' })
      },
      category: {
        field: 'category',
        transform: (value) => ({ $regex: value, $options: 'i' })
      },
      supplier: 'supplier',
      sku: 'sku',
      tag: {
        field: 'tags',
        transform: (value) => ({ $in: [new RegExp(value, 'i')] })
      },
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

    // Execute query with pagination and sorting
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
  try {
    return await Product.findById(id);
  } catch (error) {
    logger.error(`Error in getProductByIdService for ID ${id}:`, error);
    
    // Convert Mongoose CastError to ValidationError for invalid IDs
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      throw new ValidationError('id', id, 'Invalid product ID format');
    }
    
    throw error;
  }
};

/**
 * Get products by category with pagination and sorting
 */
const getProductsByCategoryService = async (category, query = {}) => {
  logger.debug(`getProductsByCategoryService called for category: ${category}`);
  
  try {
    // Get pagination parameters
    const pagination = APIFeatures.getPagination(query);
    
    // Get sort parameters with default sort by name
    const sort = APIFeatures.getSort(query, 'name');

    const filter = { 
      category: { $regex: category, $options: 'i' } 
    };
    
    // Apply any additional filters from query
    const customFilters = {
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
    
    const additionalFilters = APIFeatures.buildFilter(query, customFilters);
    Object.assign(filter, additionalFilters);

    // Execute query with pagination and sorting
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
    logger.error(`Error in getProductsByCategoryService for category ${category}:`, error);
    throw error;
  }
};

/**
 * Get product by product ID (PR-XXXXX format)
 * @param {string} productID - The product ID in PR-XXXXX format
 * @returns {Promise<Object|null>} - The product object or null if not found
 */
const getProductByProductIDService = async (productID) => {
  logger.debug(`getProductByProductIDService called with productID: ${productID}`);
  
  try {
    // Check if the productID matches the expected format (PR-XXXXX)
    if (!productID || !productID.match(/^PR-\d{5}$/)) {
      logger.warn(`Invalid productID format: ${productID}`);
      throw new ValidationError('productID', productID, 'Product ID must be in the format PR-XXXXX where X is a digit');
    }

    // Find the product by productID
    const product = await Product.findOne({ productID });
    
    if (!product) {
      logger.warn(`No product found with productID: ${productID}`);
      return null; // Let controller handle the "not found" case
    }
    
    logger.debug(`Product found with productID: ${productID}`);
    return product;
  } catch (error) {
    logger.error(`Error in getProductByProductIdService for productID ${productID}:`, error);
    throw error;
  }
};

/**
 * Search products by term
 */
const searchProductsService = async (searchTerm, query = {}) => {
  logger.debug(`searchProductsService called with term: ${searchTerm}`);
  
  try {
    // Get pagination parameters
    const pagination = APIFeatures.getPagination(query);
    
    // Get sort parameters with default sort by name
    const sort = APIFeatures.getSort(query, 'name');

    // Create text search criteria
    const searchCriteria = {
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { category: { $regex: searchTerm, $options: 'i' } },
        { sku: { $regex: searchTerm, $options: 'i' } },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } }
      ]
    };

    // Execute search query with pagination and sorting
    const products = await Product.find(searchCriteria)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit);
    
    // Get total count for pagination
    const total = await Product.countDocuments(searchCriteria);
    
    return {
      products,
      pagination: APIFeatures.paginationResult(total, pagination)
    };
  } catch (error) {
    logger.error("Error in searchProductsService:", error);
    throw error;
  }
};

/**
 * Get products by supplier with pagination and sorting
 */
const getProductsBySupplierService = async (supplierId, query = {}) => {
  logger.debug(`getProductsBySupplierService called for supplier: ${supplierId}`);
  
  try {
    // Get pagination parameters
    const pagination = APIFeatures.getPagination(query);
    
    // Get sort parameters with default sort by name
    const sort = APIFeatures.getSort(query, 'name');

    const filter = { supplier: supplierId };
    
    // Apply any additional filters from query
    const customFilters = {
      category: {
        field: 'category',
        transform: (value) => ({ $regex: value, $options: 'i' })
      },
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
    
    const additionalFilters = APIFeatures.buildFilter(query, customFilters);
    Object.assign(filter, additionalFilters);

    // Execute query with pagination and sorting
    const products = await Product.find(filter)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate('supplier', 'name contact.email');
    
    // Get total count for pagination
    const total = await Product.countDocuments(filter);
    
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
  try {
    const product = new Product(productData);
    return await product.save();
  } catch (error) {
    logger.error("Error in createProductService:", error);
    
    // Let the error middleware handle specific database errors
    throw error;
  }
};

/**
 * Update product by ID
 */
const updateProductService = async (id, updateData) => {
  logger.debug(`updateProductService called with ID: ${id}`, updateData);
  try {
    return await Product.findByIdAndUpdate(
      id, 
      { ...updateData, updatedAt: Date.now() }, 
      { new: true, runValidators: true }
    );
  } catch (error) {
    logger.error(`Error in updateProductService for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete product by ID
 */
const deleteProductService = async (id) => {
  logger.debug(`deleteProductService called with ID: ${id}`);
  try {
    return await Product.deleteOne({ _id: id });
  } catch (error) {
    logger.error(`Error in deleteProductService for ID ${id}:`, error);
    
    // Convert Mongoose CastError to ValidationError for invalid IDs
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      throw new ValidationError('id', id, 'Invalid product ID format');
    }
    
    throw error;
  }
};

/**
 * Delete all products
 */
const deleteAllProductsService = async () => {
  logger.debug("deleteAllProductsService called");
  try {
    return await Product.deleteMany({});
  } catch (error) {
    logger.error("Error in deleteAllProductsService:", error);
    throw error;
  }
};

module.exports = {
  getAllProductsService,
  getProductByIdService,
  getProductByProductIDService,
  getProductsByCategoryService,
  getProductsBySupplierService,
  searchProductsService,
  createProductService,
  updateProductService,
  deleteProductService,
  deleteAllProductsService,
};
