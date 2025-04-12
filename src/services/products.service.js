const Product = require("../models/product.model.js");
const logger = require("../utils/logger.js");
const APIFeatures = require("../utils/apiFeatures.js");

/**
 * Get all products with optional filtering and pagination
 * @param {Object} filters - Query filters like category, minPrice, maxPrice, etc.
 * @returns {Promise<Object>} - Object containing products array and pagination info
 */
const getAllProductsService = async (filters = {}) => {
  logger.debug("getAllProductsService called with filters:", filters);
  
  try {
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build query based on filters
    const query = {};
    
    // Add category filter if provided
    if (filters.category) {
      query.category = filters.category;
    }
    
    // Add price range filters if provided
    if (filters.minPrice || filters.maxPrice) {
      query.sellingPrice = {};
      if (filters.minPrice) query.sellingPrice.$gte = parseFloat(filters.minPrice);
      if (filters.maxPrice) query.sellingPrice.$lte = parseFloat(filters.maxPrice);
    }
    
    // Add stock filter if provided
    if (filters.inStock === 'true') {
      query.stockQuantity = { $gt: 0 };
    } else if (filters.inStock === 'false') {
      query.stockQuantity = { $lte: 0 };
    }
    
    // Execute query with pagination
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count for pagination
    const total = await Product.countDocuments(query);
    
    // Return structured result with products array and pagination info
    return {
      products: products || [], // Ensure we always return an array, even if empty
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error("Error in getAllProductsService:", error);
    // Rethrow to be handled by the controller
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
    
    // Create case-insensitive query to handle different capitalizations
    const categoryRegex = new RegExp(`^${category}$`, 'i');
    
    // Get pagination parameters
    const pagination = APIFeatures.getPagination(query);
    
    // Get sort parameters with default sort by name
    const sort = APIFeatures.getSort(query, 'name');

    // Execute query with case-insensitive matching
    const products = await Product.find({ category: categoryRegex })
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit);

    logger.debug(`Found ${products.length} products in category: ${category}`);
    
    // Get total count for pagination
    const total = await Product.countDocuments({ category: categoryRegex });

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
      return null;
    }

    // Find the product by productID
    const product = await Product.findOne({ productID });
    
    if (!product) {
      logger.warn(`No product found with productID: ${productID}`);
      return null;
    }
    
    logger.debug(`Product found with productID: ${productID}`);
    return product;
  } catch (error) {
    logger.error(`Error in getProductByProductIdService for productID ${productID}:`, error);
    throw error;
  }
};

/**
 * Search products by text (searches name, description, category, and tags)
 */
const searchProductsService = async (term, query = {}) => {
  try {
    logger.debug(`searchProductsService called with term: ${term}`);
    
    if (!term) {
      logger.warn("Search called with empty term");
      return { products: [], pagination: { total: 0, page: 1, limit: 10, pages: 0 } };
    }
    
    // Get pagination parameters
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    // Create a case-insensitive regex for the search term
    const regex = new RegExp(term, "i");
    
    // Create a query that searches in name, description, category, and tags
    const searchQuery = {
      $or: [
        { name: regex },
        { description: regex },
        { category: regex },
        { tags: regex }  // This will match if any tag in the array matches the regex
      ]
    };
    
    // Execute the search query with pagination
    const products = await Product.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count for pagination
    const total = await Product.countDocuments(searchQuery);
    
    logger.debug(`Found ${products.length} products matching "${term}"`);
    
    return {
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
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
