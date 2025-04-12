const sendResponse = require("../utils/response.js");
const asyncHandler = require("express-async-handler");
const logger = require("../utils/logger.js");
const { DatabaseError, ValidationError } = require("../utils/errors");
const {
  getAllProductsService,
  getProductByIdService,
  getProductsByCategoryService,
  getProductByProductIDService,  
  createProductService,
  updateProductService,
  deleteProductService,
  deleteAllProductsService,
  searchProductsService,
  getProductsBySupplierService,
} = require("../services/products.service.js");
const { transformProduct, generateProductId } = require("../utils/product.utils.js");

/**
 * @desc    Get all products
 * @route   GET /products
 * @access  Public
 */
const getAllProducts = asyncHandler(async (req, res, next) => {
  logger.info("getAllProducts called");
  try {
    // Get query parameters for filtering
    const filters = req.query;
    logger.debug("Filters applied:", filters);

    // Call the service to get products
    const result = await getAllProductsService(filters);
    
    // Ensure result is properly structured with an array of products
    if (!result || !result.products || !Array.isArray(result.products)) {
      logger.error("Products data is not in expected format:", result);
      return next(DatabaseError.dataError("Products data is not in expected format"));
    }
    
    // Transform each product in the array
    const transformedProducts = result.products.map(transformProduct);

    sendResponse(res, 200, "Products retrieved successfully", {
      products: transformedProducts,
      pagination: result.pagination
    });
  } catch (error) {
    logger.error("Error retrieving all products:", error);
    next(error);
  }
});

/**
 * @desc    Get product by ID
 * @route   GET /products/:product_Id
 * @access  Public
 */
const getProductById = asyncHandler(async (req, res, next) => {
  logger.info(`getProductById called with ID: ${req.params.product_Id}`);
  try {
    const product = await getProductByIdService(req.params.product_Id);
    if (product) {
      const transformedProduct = transformProduct(product);
      sendResponse(
        res,
        200,
        "Product retrieved successfully",
        transformedProduct
      );
    } else {
      return next(DatabaseError.notFound("Product"));
    }
  } catch (error) {
    logger.error(`Error retrieving product with ID: ${req.params.product_Id}`, error);
    next(error);
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
  
  try {
    // Pass query parameters for pagination and sorting
    const result = await getProductsByCategoryService(category, req.query);
    
    if (!result || !result.products || result.products.length === 0) {
      logger.warn(`No products found in category: ${category}`);
      return next(DatabaseError.notFound(`Products in category '${category}'`));
    }
    
    // Transform each product
    const transformedProducts = result.products.map(transformProduct);
    
    sendResponse(
      res,
      200,
      `Found ${transformedProducts.length} products in category '${category}'`,
      {
        products: transformedProducts,
        pagination: result.pagination
      }
    );
  } catch (error) {
    logger.error(
      `Error retrieving products in category: ${category}`,
      error
    );
    next(error);
  }
});

/**
 * @desc    Get product by product ID (PR-XXXXX format)
 * @route   GET /products/productID/:productID
 * @access  Public
 */
const getProductByProductID = asyncHandler(async (req, res, next) => {
  logger.info(
    `getProductByProductId called with product ID: ${req.params.productID}`
  );
  try {
    const product = await getProductByProductIDService(req.params.productID);
    if (product) {
      const transformedProduct = transformProduct(product);
      sendResponse(
        res,
        200,
        "Product retrieved successfully",
        transformedProduct
      );
    } else {
      return next(DatabaseError.notFound("Product"));
    }
  } catch (error) {
    logger.error(
      `Error retrieving product with product ID: ${req.params.productID}`,
      error
    );
    next(error);
  }
});

/**
 * @desc    Search products by text
 * @route   GET /products/search
 * @access  Public
 */
const searchProducts = asyncHandler(async (req, res, next) => {
  const term = req.query.term;
  logger.info(`searchProducts called with term: ${term}`);
  
  if (!term) {
    logger.warn("Search attempted without search term");
    return next(ValidationError.badRequest("Search term is required"));
  }

  try {
    // Pass both search term and query parameters for pagination
    const result = await searchProductsService(term, req.query);
    
    if (!result || !result.products) {
      logger.error("Search returned invalid result structure");
      return next(DatabaseError.dataError("Search result is not in expected format"));
    }
    
    if (result.products.length === 0) {
      logger.info(`No products found for search term: ${term}`);
      return sendResponse(res, 200, "No products found matching your search", {
        products: [],
        pagination: result.pagination
      });
    }
    
    // Transform each product
    const transformedProducts = result.products.map(transformProduct);
    
    sendResponse(
      res,
      200,
      `Found ${transformedProducts.length} products matching "${term}"`,
      {
        products: transformedProducts,
        pagination: result.pagination
      }
    );
  } catch (error) {
    logger.error(`Error searching products for term: ${term}`, error);
    next(error);
  }
});

/**
 * @desc    Get products by supplier
 * @route   GET /products/supplier/:supplierId
 * @access  Public
 */
const getProductsBySupplier = asyncHandler(async (req, res, next) => {
  logger.info(
    `getProductsBySupplier called with supplier ID: ${req.params.supplierId}`
  );
  try {
    // Pass both supplierId and query parameters for filtering/pagination
    const result = await getProductsBySupplierService(req.params.supplierId, req.query);
    
    // The service now returns a structured object with products and pagination
    if (!result || !result.products) {
      logger.error("Supplier products returned invalid result structure");
      return next(DatabaseError.dataError("Result is not in expected format"));
    }
    
    // Even if no products are found, return a 200 OK with empty array
    const transformedProducts = result.products.map(transformProduct);
    
    const message = result.products.length > 0 
      ? "Products for supplier retrieved successfully" 
      : "No products found for this supplier";
    
    sendResponse(
      res,
      200,
      message,
      {
        products: transformedProducts,
        pagination: result.pagination
      }
    );
  } catch (error) {
    logger.error(
      `Error retrieving products for supplier: ${req.params.supplierId}`,
      error
    );
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
  logger.debug("Request body:", req.body);
  try {
    // Generate productID for the new product
    const productID = await generateProductId();
    
    // Add productID to request body
    const productData = {
      ...req.body,
      productID
    };
    
    const product = await createProductService(productData);
    const transformedProduct = transformProduct(product);
    sendResponse(res, 201, "Product created successfully", transformedProduct);
  } catch (error) {
    logger.error("Error creating product:", error);
    next(error);
  }
});

/**
 * @desc    Update product by ID
 * @route   PUT /products/:product_Id
 * @access  Private
 */
const updateProductById = asyncHandler(async (req, res, next) => {
  logger.info(`updateProduct called with ID: ${req.params.product_Id}`);
  logger.debug("Update data:", req.body);
  try {
    const product = await updateProductService(req.params.product_Id, req.body);
    if (product) {
      const transformedProduct = transformProduct(product);
      sendResponse(
        res,
        200,
        "Product updated successfully",
        transformedProduct
      );
    } else {
      return next(DatabaseError.notFound("Product"));
    }
  } catch (error) {
    logger.error(`Error updating product with ID: ${req.params.product_Id}`, error);
    next(error);
  }
});

/**
 * @desc    Delete product by ID
 * @route   DELETE /products/:product_Id
 * @access  Private
 */
const deleteProductById = asyncHandler(async (req, res, next) => {
  logger.info(`deleteProduct called with ID: ${req.params.product_Id}`);
  try {
    const result = await deleteProductService(req.params.product_Id);
    if (result.deletedCount > 0) {
      sendResponse(res, 200, "Product deleted successfully");
    } else {
      return next(DatabaseError.notFound("Product"));
    }
  } catch (error) {
    logger.error(`Error deleting product with ID: ${req.params.product_Id}`, error);
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
