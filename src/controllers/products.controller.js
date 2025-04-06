const sendResponse = require("../utils/response.js");
const asyncHandler = require("express-async-handler");
const logger = require("../utils/logger.js");
const createHttpError = require("http-errors");
const productService = require("../services/products.service.js");
const { transformProduct } = require("../utils/product.utils.js");

/**
 * @desc    Get all products
 * @route   GET /products
 * @access  Public
 */
const getAllProducts = asyncHandler(async (req, res, next) => {
    logger.info("getAllProducts called");
    try {
        const result = await productService.getAllProductsService(req.query);
        // Transform each product in the results
        const transformedProducts = result.products.map(product => transformProduct(product));
        
        sendResponse(res, 200, "Products retrieved successfully", {
            products: transformedProducts,
            pagination: result.pagination
        });
    } catch (error) {
        logger.error("Error retrieving all products:", error);
        next(createHttpError(500, "Failed to retrieve products", { message: error.message }));
    }
});

/**
 * @desc    Get product by product ID
 * @route   GET /products/productID/:productID
 * @access  Public
 */
const getProductByProductID = asyncHandler(async (req, res, next) => {
    logger.info(`getProductByProductID called with productID: ${req.params.productID}`);
    try {
        const product = await productService.getProductByProductIDService(req.params.productID);
        if (product) {
            const transformedProduct = transformProduct(product);
            sendResponse(res, 200, "Product retrieved successfully", transformedProduct);
        } else {
            return next(createHttpError(404, "Product not found"));
        }
    } catch (error) {
        logger.error(`Error retrieving product with productID: ${req.params.productID}`, error);
        next(createHttpError(500, "Failed to retrieve product", { message: error.message }));
    }
});

/**
 * @desc    Get product by MongoDB ID
 * @route   GET /products/:_id
 * @access  Public
 */
const getProductById = asyncHandler(async (req, res, next) => {
    logger.info(`getProductById called with ID: ${req.params._id}`);
    try {
        const product = await productService.getProductByIdService(req.params._id);
        if (product) {
            const transformedProduct = transformProduct(product);
            sendResponse(res, 200, "Product retrieved successfully", transformedProduct);
        } else {
            return next(createHttpError(404, "Product not found"));
        }
    } catch (error) {
        logger.error(`Error retrieving product with ID: ${req.params._id}`, error);
        if (error.name === "CastError" && error.kind === "ObjectId") {
            return next(createHttpError(400, "Invalid product ID format"));
        }
        next(createHttpError(500, "Failed to retrieve product", { message: error.message }));
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
        const product = await productService.createProductService(req.body);
        const transformedProduct = transformProduct(product);
        sendResponse(res, 201, "Product created successfully", transformedProduct);
    } catch (error) {
        logger.error("Error creating product:", error);
        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map((val) => val.message);
            return next(createHttpError(400, "Validation error", { message: errors.join(". ") }));
        }
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            const value = error.keyValue[field];
            return next(createHttpError(409, `Duplicate ${field}`, { message: `${field} '${value}' already exists` }));
        }
        next(createHttpError(500, "Failed to create product", { message: error.message }));
    }
});

/**
 * @desc    Update product by ID
 * @route   PUT /products/:_id
 * @access  Private
 */
const updateProductById = asyncHandler(async (req, res, next) => {
    logger.info(`updateProductById called with ID: ${req.params._id}`);
    logger.debug("Update data:", req.body);
    try {
        const product = await productService.updateProductService(req.params._id, req.body);
        if (product) {
            const transformedProduct = transformProduct(product);
            sendResponse(res, 200, "Product updated successfully", transformedProduct);
        } else {
            return next(createHttpError(404, "Product not found"));
        }
    } catch (error) {
        logger.error(`Error updating product with ID: ${req.params._id}`, error);
        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map((val) => val.message);
            return next(createHttpError(400, "Validation error", { message: errors.join(". ") }));
        }
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            const value = error.keyValue[field];
            return next(createHttpError(409, `Duplicate ${field}`, { message: `${field} '${value}' already exists` }));
        }
        if (error.name === "CastError" && error.kind === "ObjectId") {
            return next(createHttpError(400, "Invalid product ID format"));
        }
        next(createHttpError(500, "Failed to update product", { message: error.message }));
    }
});

/**
 * @desc    Delete product by ID
 * @route   DELETE /products/:_id
 * @access  Private
 */
const deleteProductById = asyncHandler(async (req, res, next) => {
    logger.info(`deleteProductById called with ID: ${req.params._id}`);
    try {
        const result = await productService.deleteProductService(req.params._id);
        if (result.deletedCount > 0) {
            sendResponse(res, 200, "Product deleted successfully");
        } else {
            return next(createHttpError(404, "Product not found"));
        }
    } catch (error) {
        logger.error(`Error deleting product with ID: ${req.params._id}`, error);
        if (error.name === "CastError" && error.kind === "ObjectId") {
            return next(createHttpError(400, "Invalid product ID format"));
        }
        next(createHttpError(500, "Failed to delete product", { message: error.message }));
    }
});

/**
 * @desc    Get products by category
 * @route   GET /products/category/:category
 * @access  Public
 */
const getProductsByCategory = asyncHandler(async (req, res, next) => {
    logger.info(`getProductsByCategory called with category: ${req.params.category}`);
    try {
        const products = await productService.getProductsByCategoryService(req.params.category);
        if (products && products.length > 0) {
            const transformedProducts = products.map(product => transformProduct(product));
            sendResponse(res, 200, "Products retrieved successfully", transformedProducts);
        } else {
            sendResponse(res, 200, "No products found for this category", []);
        }
    } catch (error) {
        logger.error(`Error retrieving products with category: ${req.params.category}`, error);
        next(createHttpError(500, "Failed to retrieve products", { message: error.message }));
    }
});

/**
 * @desc    Get products by supplier
 * @route   GET /products/supplier/:supplierId
 * @access  Public
 */
const getProductsBySupplier = asyncHandler(async (req, res, next) => {
    logger.info(`getProductsBySupplier called with supplier ID: ${req.params.supplierId}`);
    try {
        const products = await productService.getProductsBySupplierService(req.params.supplierId);
        if (products && products.length > 0) {
            const transformedProducts = products.map(product => transformProduct(product));
            sendResponse(res, 200, "Products retrieved successfully", transformedProducts);
        } else {
            sendResponse(res, 200, "No products found for this supplier", []);
        }
    } catch (error) {
        logger.error(`Error retrieving products with supplier ID: ${req.params.supplierId}`, error);
        if (error.name === "CastError" && error.kind === "ObjectId") {
            return next(createHttpError(400, "Invalid supplier ID format"));
        }
        next(createHttpError(500, "Failed to retrieve products", { message: error.message }));
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
    
    if (!searchTerm) {
        return next(createHttpError(400, "Search term is required"));
    }
    
    try {
        const products = await productService.searchProductsService(searchTerm);
        const transformedProducts = products.map(product => transformProduct(product));
        sendResponse(res, 200, "Search results retrieved successfully", transformedProducts);
    } catch (error) {
        logger.error(`Error searching products with term: ${searchTerm}`, error);
        next(createHttpError(500, "Failed to search products", { message: error.message }));
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
        const result = await productService.deleteAllProductsService();
        if (result.deletedCount > 0) {
            sendResponse(res, 200, `Successfully deleted ${result.deletedCount} products`);
        } else {
            sendResponse(res, 200, "No products to delete");
        }
    } catch (error) {
        logger.error("Error deleting all products:", error);
        next(createHttpError(500, "Failed to delete all products", { message: error.message }));
    }
});

module.exports = {
    getAllProducts,   
    getProductByProductID,
    getProductById,
    createProduct,
    updateProductById,
    deleteProductById,
    getProductsByCategory,
    getProductsBySupplier,
    searchProducts,
    deleteAllProducts
};
