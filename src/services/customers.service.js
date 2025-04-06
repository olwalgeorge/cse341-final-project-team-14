const Customer = require("../models/customer.model.js");
const { generateCustomerId } = require("../utils/customer.utils.js");

/**
 * Get all customers with optional filtering and pagination
 */
const getAllCustomersService = async (query = {}) => {
    // Create filter object
    const filter = {};
    
    // Apply name search filter
    if (query.name) {
        filter.name = { $regex: query.name, $options: 'i' };
    }
    
    // Apply email filter
    if (query.email) {
        filter.email = { $regex: query.email, $options: 'i' };
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
    const customers = await Customer.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit);
    
    // Get total count for pagination
    const total = await Customer.countDocuments(filter);
    
    return {
        customers,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
};

/**
 * Get customer by customer ID (CU-xxxxx format)
 */
const getCustomerByCustomerIDService = async (customerID) => {
    return await Customer.findOne({ customerID: customerID });
};

/**
 * Get customer by MongoDB ID
 */
const getCustomerByIdService = async (id) => {
    return await Customer.findById(id);
};

/**
 * Get customer by email
 */
const getCustomerByEmailService = async (email) => {
    return await Customer.findOne({ email: email });
};

/**
 * Create a new customer
 */
const createCustomerService = async (customerData) => {
    // Generate customer ID if not provided
    if (!customerData.customerID) {
        customerData.customerID = await generateCustomerId();
    }
    
    const customer = new Customer(customerData);
    return await customer.save();
};

/**
 * Update a customer by ID
 */
const updateCustomerService = async (id, updates) => {
    return await Customer.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: Date.now() },
        { new: true, runValidators: true }
    );
};

/**
 * Delete a customer by ID
 */
const deleteCustomerService = async (id) => {
    return await Customer.deleteOne({ _id: id });
};

/**
 * Search customers by name or email
 */
const searchCustomersService = async (searchTerm) => {
    return await Customer.find({
        $or: [
            { name: { $regex: searchTerm, $options: 'i' } },
            { email: { $regex: searchTerm, $options: 'i' } }
        ]
    }).limit(20);
};

/**
 * Delete all customers - use with caution
 */
const deleteAllCustomersService = async () => {
    return await Customer.deleteMany({});
};

module.exports = {
    getAllCustomersService,
    getCustomerByCustomerIDService,
    getCustomerByIdService,
    getCustomerByEmailService,
    createCustomerService,
    updateCustomerService,
    deleteCustomerService,
    searchCustomersService,
    deleteAllCustomersService
};
