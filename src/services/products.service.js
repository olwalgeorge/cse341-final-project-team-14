const Product = require("../models/product.model.js");
const { generateProductId } = require("../utils/product.utils.js");


/**
 * Get all products with optional filtering and pagination
 */
const getAllProductsService = async (query = {}) => {
    // Create filter object
    const filter = {};
    
    // Apply category filter
    if (query.category) {
        filter.category = query.category;
    }
    
    // Apply price range filter
    if (query.minPrice || query.maxPrice) {
        filter.price = {};
        if (query.minPrice) filter.price.$gte = parseFloat(query.minPrice);
        if (query.maxPrice) filter.price.$lte = parseFloat(query.maxPrice);
    }
    
    // Apply stock filter
    if (query.inStock === 'true') {
        filter.quantity = { $gt: 0 };
    }
    
    // Pagination
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Sort options
    const sort = {};
    if (query.sort) {
        const sortFields = query.sort.split(',');
        sortFields.forEach(field => {
            if (field.startsWith('-')) {
                sort[field.substring(1)] = -1;
            } else {
                sort[field] = 1;
            }
        });
    } else {
        sort.createdAt = -1; // Default sort by newest
    }
    
    // Execute query
    const products = await Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('supplier', 'name');
    
    // Get total count for pagination
    const total = await Product.countDocuments(filter);
    
    return {
        products,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
};

/**
 * Get product by MongoDB ID
 */
const getProductByIdService = async (id) => {
    return await Product.findById(id).populate('supplier', 'name');
};

/**
 * Get product by product ID (PR-xxxxx format)
 */
const getProductByProductIDService = async (productID) => {
    return await Product.findOne({ productID }).populate('supplier', 'name');
};

/**
 * Create a new product
 */
const createProductService = async (productData) => {
    // Generate product ID if not provided
    if (!productData.productID) {
        productData.productID = await generateProductId();
    }
    
    const product = new Product(productData);
    return await product.save();
};

/**
 * Update a product by ID
 */
const updateProductService = async (id, updates) => {
    return await Product.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: Date.now() },
        { new: true, runValidators: true }
    ).populate('supplier', 'name');
};

/**
 * Delete a product by ID
 */
const deleteProductService = async (id) => {
    return await Product.deleteOne({ _id: id });
};

/**
 * Get products by category
 */
const getProductsByCategoryService = async (category) => {
    return await Product.find({ category }).populate('supplier', 'name');
};

/**
 * Get products by supplier ID
 */
const getProductsBySupplierService = async (supplierId) => {
    return await Product.find({ supplier: supplierId });
};

/**
 * Search products by text
 */
const searchProductsService = async (searchTerm) => {
    // Use MongoDB text index search
    return await Product.find(
        { $text: { $search: searchTerm } },
        { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" } })
    .limit(20)
    .populate('supplier', 'name');
};

module.exports = {
    getAllProductsService,
    getProductByIdService,
    getProductByProductIDService,
    createProductService,
    updateProductService,
    deleteProductService,
    getProductsByCategoryService,
    getProductsBySupplierService,
    searchProductsService
};
