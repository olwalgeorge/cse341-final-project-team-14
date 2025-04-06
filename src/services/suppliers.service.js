const Supplier = require("../models/supplier.model.js");
const { generateSupplierId } = require("../utils/supplier.utils.js");

/**
 * Get all suppliers with optional filtering and pagination
 */
const getAllSuppliersService = async (query = {}) => {
    // Create filter object
    const filter = {};
    
    // Apply name search filter
    if (query.name) {
        filter.name = { $regex: query.name, $options: 'i' };
    }
    
    // Apply country filter
    if (query.country) {
        filter['address.country'] = { $regex: query.country, $options: 'i' };
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
        sort.name = 1; // Default sort by name
    }
    
    // Execute query
    const suppliers = await Supplier.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit);
    
    // Get total count for pagination
    const total = await Supplier.countDocuments(filter);
    
    return {
        suppliers,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
};

/**
 * Get supplier by supplier ID (SP-xxxxx format)
 */
const getSupplierBySupplierIDService = async (supplierID) => {
    return await Supplier.findOne({ supplierID: supplierID });
};

/**
 * Get supplier by MongoDB ID
 */
const getSupplierByIdService = async (id) => {
    return await Supplier.findById(id);
};

/**
 * Create a new supplier
 */
const createSupplierService = async (supplierData) => {
    // Generate supplier ID if not provided
    if (!supplierData.supplierID) {
        supplierData.supplierID = await generateSupplierId();
    }
    
    const supplier = new Supplier(supplierData);
    return await supplier.save();
};

/**
 * Update a supplier by ID
 */
const updateSupplierService = async (id, updates) => {
    return await Supplier.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: Date.now() },
        { new: true, runValidators: true }
    );
};

/**
 * Delete a supplier by ID
 */
const deleteSupplierService = async (id) => {
    return await Supplier.deleteOne({ _id: id });
};

/**
 * Search suppliers by name
 */
const searchSuppliersService = async (searchTerm) => {
    return await Supplier.find(
        { name: { $regex: searchTerm, $options: 'i' } }
    )
    .limit(20);
};

/**
 * Delete all suppliers - use with caution
 */
const deleteAllSuppliersService = async () => {
    return await Supplier.deleteMany({});
};

module.exports = {
    getAllSuppliersService,
    getSupplierBySupplierIDService,
    getSupplierByIdService,
    createSupplierService,
    updateSupplierService,
    deleteSupplierService,
    searchSuppliersService,
    deleteAllSuppliersService
};
