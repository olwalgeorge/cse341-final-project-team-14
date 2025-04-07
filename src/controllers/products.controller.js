const sendResponse = require("../utils/response.js");
const asyncHandler = require("express-async-handler");
const logger = require("../utils/logger.js");
const { DatabaseError } = require("../utils/errors");
const { 
    getAllProductsService, 
    getProductByIdService, 
    getProductsByCategoryService,
    createProductService,
    updateProductService,
    deleteProductService,
    deleteAllProductsService
} = require("../services/products.service");
const { transformProduct } = require("../utils/product.utils");

/**
 * @desc    Get all products
 * @route   GET /products
 * @access  Private
 */
const getAllProducts = asyncHandler(async (req, res, next) => {
    logger.info("getAllProducts called");
    try {
        const products = await getAllProductsService();
        const transformedProducts = products.map(transformProduct);
        sendResponse(res, 200, "Products retrieved successfully", transformedProducts);
    } catch (error) {
        logger.error("Error retrieving all products:", error);
        next(error);
    }
});

/**
 * @desc    Get product by ID
 * @route   GET /products/:_id
 * @access  Private
 */
const getProductById = asyncHandler(async (req, res, next) => {
    logger.info(`getProductById called with ID: ${req.params._id}`);
    try {
        const product = await getProductByIdService(req.params._id);
        if (product) {
            const transformedProduct = transformProduct(product);
            sendResponse(res, 200, "Product retrieved successfully", transformedProduct);
        } else {
            return next(DatabaseError.notFound("Product"));
        }
    } catch (error) {
        logger.error(`Error retrieving product with ID: ${req.params._id}`, error);
        next(error);
    }
});

/**
 * @desc    Get products by category
 * @route   GET /products/category/:category
 * @access  Private
 */
const getProductsByCategory = asyncHandler(async (req, res, next) => {
    logger.info(`getProductsByCategory called with category: ${req.params.category}`);
    try {
        const products = await getProductsByCategoryService(req.params.category);
        if (products && products.length > 0) {
            const transformedProducts = products.map(transformProduct);
            sendResponse(res, 200, "Products retrieved successfully", transformedProducts);
        } else {
            return next(DatabaseError.notFound("Products in category"));
        }
    } catch (error) {
        logger.error(`Error retrieving products in category: ${req.params.category}`, error);
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
        const product = await createProductService(req.body);
        const transformedProduct = transformProduct(product);
        sendResponse(res, 201, "Product created successfully", transformedProduct);
    } catch (error) {
        logger.error("Error creating product:", error);
        next(error);
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
        const product = await updateProductService(req.params._id, req.body);
        if (product) {
            const transformedProduct = transformProduct(product);
            sendResponse(res, 200, "Product updated successfully", transformedProduct);
        } else {
            return next(DatabaseError.notFound("Product"));
        }
    } catch (error) {
        logger.error(`Error updating product with ID: ${req.params._id}`, error);
        next(error);
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
        const result = await deleteProductService(req.params._id);
        if (result.deletedCount > 0) {
            sendResponse(res, 200, "Product deleted successfully");
        } else {
            return next(DatabaseError.notFound("Product"));
        }
    } catch (error) {
        logger.error(`Error deleting product with ID: ${req.params._id}`, error);
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
        sendResponse(res, 200, `${result.deletedCount} products deleted successfully`);
    } catch (error) {
        logger.error("Error deleting all products:", error);
        next(error);
    }
});

module.exports = {
    getAllProducts,
    getProductById,
    getProductsByCategory,
    createProduct,
    updateProductById,
    deleteProductById,
    deleteAllProducts
};
