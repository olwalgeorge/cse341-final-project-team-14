const sendResponse = require("../utils/response.js");
const asyncHandler = require("express-async-handler");
const logger = require("../utils/logger.js");
const { ValidationError, DatabaseError } = require("../utils/errors.js");
const {
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
} = require("../services/products.service.js");
const { transformProduct } = require("../utils/product.utils.js");

/**
 * @desc    Get all products
 * @route   GET /products
 * @access  Public
 */
const getAllProducts = asyncHandler(async (req, res, next) => {
  logger.info("getAllProducts called");
  logger.debug("Query parameters:", req.query);
  
  try {
    const result = await getAllProductsService(req.query);
    
    if (!result.products.length) {
      return sendResponse(res, 200, "No products found", {
        products: [],
        pagination: result.pagination
      });
    }
    
    const transformedProducts = result.products.map(transformProduct);
    sendResponse(
      res,
      200,
      "Products retrieved successfully",
      { products: transformedProducts, pagination: result.pagination }
    );
  } catch (error) {
    logger.error("Error retrieving products:", error);
    next(error); // Pass to error middleware
  }
});

/**
 * @desc    Get product by MongoDB ID
 * @route   GET /products/:product_Id
 * @access  Public
 */
const getProductById = asyncHandler(async (req, res, next) => {
  const id = req.params.product_Id;
  logger.info(`getProductById called with ID: ${id}`);
  
  try {
    const product = await getProductByIdService(id);
    
    if (!product) {
      return next(new DatabaseError('notFound', 'Product', id));
    }
    
    const transformedProduct = transformProduct(product);
    sendResponse(
      res,
      200,
      "Product retrieved successfully",
      transformedProduct
    );
  } catch (error) {
    logger.error(`Error retrieving product with ID: ${id}`, error);
    next(error); // Let the error middleware handle it
  }
});

/**
 * @desc    Get products by category
 * @route   GET /products/category/:category
 * @access  Public
 */
const getProductsByCategory = asyncHandler(async (req, res, next) => {
  const category = req.params.category;
  logger.info(`getProductsByCategory called with category: ${category}`);
  logger.debug("Query parameters:", req.query);
  
  try {
    const result = await getProductsByCategoryService(category, req.query);
    
    if (!result.products.length) {
      return sendResponse(res, 200, `No products found in category: ${category}`, {
        products: [],
        pagination: result.pagination
      });
    }
    
    const transformedProducts = result.products.map(transformProduct);
    sendResponse(
      res,
      200,
      `Products in category "${category}" retrieved successfully`,
      { products: transformedProducts, pagination: result.pagination }
    );
  } catch (error) {
    logger.error(`Error retrieving products for category ${category}:`, error);
    next(error);
  }
});

/**
 * @desc    Get products by supplier
 * @route   GET /products/supplier/:supplierId
 * @access  Public
 */
const getProductsBySupplier = asyncHandler(async (req, res, next) => {
  const supplierId = req.params.supplierId;
  logger.info(`getProductsBySupplier called with supplier ID: ${supplierId}`);
  logger.debug("Query parameters:", req.query);
  
  try {
    const result = await getProductsBySupplierService(supplierId, req.query);
    
    if (!result.products.length) {
      return sendResponse(res, 200, `No products found for supplier ID: ${supplierId}`, {
        products: [],
        pagination: result.pagination
      });
    }
    
    const transformedProducts = result.products.map(transformProduct);
    sendResponse(
      res,
      200,
      `Products for supplier ID "${supplierId}" retrieved successfully`,
      { products: transformedProducts, pagination: result.pagination }
    );
  } catch (error) {
    logger.error(`Error retrieving products for supplier ${supplierId}:`, error);
    next(error);
  }
});

/**
 * @desc    Get product by product ID (PR-XXXXX format)
 * @route   GET /products/productID/:productID
 * @access  Public
 */
const getProductByProductID = asyncHandler(async (req, res, next) => {
  const productID = req.params.productID;
  logger.info(`getProductByProductID called with product ID: ${productID}`);
  
  try {
    // Validate product ID format
    if (!productID.match(/^PR-\d{5}$/)) {
      return next(new ValidationError(
        'productID', 
        productID, 
        'Product ID must be in the format PR-XXXXX where X is a digit'
      ));
    }
    
    const product = await getProductByProductIDService(productID);
    
    if (!product) {
      return next(new DatabaseError('notFound', 'Product', null, { productID }));
    }
    
    const transformedProduct = transformProduct(product);
    sendResponse(
      res,
      200,
      "Product retrieved successfully",
      transformedProduct
    );
  } catch (error) {
    logger.error(`Error retrieving product with product ID: ${productID}`, error);
    next(error);
  }
});

/**
 * @desc    Search products
 * @route   GET /products/search
 * @access  Public
 */
const searchProducts = asyncHandler(async (req, res, next) => {
  const searchTerm = req.query.term;
  logger.info(`searchProducts called with term: ${searchTerm}`);
  
  try {
    if (!searchTerm) {
      return next(new ValidationError('term', searchTerm, 'Search term is required'));
    }
    
    const result = await searchProductsService(searchTerm, req.query);
    
    if (!result.products.length) {
      return sendResponse(res, 200, "No products found matching search criteria", {
        products: [],
        pagination: result.pagination
      });
    }
    
    const transformedProducts = result.products.map(transformProduct);
    sendResponse(
      res,
      200,
      "Products retrieved successfully",
      { products: transformedProducts, pagination: result.pagination }
    );
  } catch (error) {
    logger.error(`Error searching products with term: ${searchTerm}`, error);
    next(error);
  }
});

/**
 * @desc    Create a new product
 * @route   POST /products
 * @access  Private
 */
const createProduct = asyncHandler(async (req, res, next) => {
  logger.info("createProduct called");
  logger.debug("Product data:", req.body);
  
  try {
    const product = await createProductService(req.body);
    const transformedProduct = transformProduct(product);
    sendResponse(res, 201, "Product created successfully", transformedProduct);
  } catch (error) {
    logger.error("Error creating product:", error);
    
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const firstErrorKey = Object.keys(error.errors)[0];
      const firstError = error.errors[firstErrorKey];
      
      return next(new ValidationError(
        firstErrorKey,
        firstError.value,
        firstError.message
      ));
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      
      return next(new DatabaseError(
        'duplicate',
        'Product',
        null,
        { field, value }
      ));
    }
    
    next(error);
  }
});

/**
 * @desc    Update product by ID
 * @route   PUT /products/:product_Id
 * @access  Private
 */
const updateProductById = asyncHandler(async (req, res, next) => {
  const id = req.params.product_Id;
  logger.info(`updateProduct called with ID: ${id}`);
  logger.debug("Update data:", req.body);
  
  try {
    const product = await updateProductService(id, req.body);
    
    if (!product) {
      return next(new DatabaseError('notFound', 'Product', id));
    }
    
    const transformedProduct = transformProduct(product);
    sendResponse(
      res,
      200,
      "Product updated successfully",
      transformedProduct
    );
  } catch (error) {
    logger.error(`Error updating product with ID: ${id}`, error);
    
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const firstErrorKey = Object.keys(error.errors)[0];
      const firstError = error.errors[firstErrorKey];
      
      return next(new ValidationError(
        firstErrorKey,
        firstError.value,
        firstError.message
      ));
    }
    
    // Handle CastError for invalid ObjectId
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return next(new ValidationError('id', id, 'Invalid product ID format'));
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      
      return next(new DatabaseError(
        'duplicate',
        'Product',
        null,
        { field, value }
      ));
    }
    
    next(error);
  }
});

/**
 * @desc    Delete product by ID
 * @route   DELETE /products/:product_Id
 * @access  Private
 */
const deleteProductById = asyncHandler(async (req, res, next) => {
  const id = req.params.product_Id;
  logger.info(`deleteProduct called with ID: ${id}`);
  
  try {
    const result = await deleteProductService(id);
    
    if (result.deletedCount === 0) {
      return next(new DatabaseError('notFound', 'Product', id));
    }
    
    sendResponse(res, 200, "Product deleted successfully");
  } catch (error) {
    logger.error(`Error deleting product with ID: ${id}`, error);
    
    // Handle CastError for invalid ObjectId
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return next(new ValidationError('id', id, 'Invalid product ID format'));
    }
    
    next(error);
  }
});

/**
 * @desc    Delete all products
 * @route   DELETE /products
 * @access  Private
 */
const deleteAllProducts = asyncHandler(async (req, res, next) => {
  logger.info("deleteAllProducts called");
  
  try {
    const result = await deleteAllProductsService();
    sendResponse(
      res,
      200,
      `${result.deletedCount} products deleted successfully`
    );
  } catch (error) {
    logger.error("Error deleting all products:", error);
    next(error);
  }
});

module.exports = {
  getAllProducts,
  getProductById,
  getProductByProductID,
  getProductsByCategory,
  getProductsBySupplier,
  searchProducts,
  createProduct,
  updateProductById,
  deleteProductById,
  deleteAllProducts,
};
