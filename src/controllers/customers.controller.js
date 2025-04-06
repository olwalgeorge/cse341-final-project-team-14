const sendResponse = require("../utils/response.js");
const asyncHandler = require("express-async-handler");
const logger = require("../utils/logger.js");
const createHttpError = require("http-errors");
const customerService = require("../services/customers.service.js");
const { transformCustomer } = require("../utils/customer.utils.js");

/**
 * @desc    Get all customers
 * @route   GET /customers
 * @access  Private
 */
const getAllCustomers = asyncHandler(async (req, res, next) => {
    logger.info("getAllCustomers called");
    try {
        const result = await customerService.getAllCustomersService(req.query);
        // Transform each customer in the results
        const transformedCustomers = result.customers.map(customer => transformCustomer(customer));
        
        sendResponse(res, 200, "Customers retrieved successfully", {
            customers: transformedCustomers,
            pagination: result.pagination
        });
    } catch (error) {
        logger.error("Error retrieving all customers:", error);
        next(createHttpError(500, "Failed to retrieve customers", { message: error.message }));
    }
});

/**
 * @desc    Get customer by customer ID
 * @route   GET /customers/customerID/:customerID
 * @access  Private
 */
const getCustomerByCustomerID = asyncHandler(async (req, res, next) => {
    logger.info(`getCustomerByCustomerID called with customerID: ${req.params.customerID}`);
    try {
        const customer = await customerService.getCustomerByCustomerIDService(req.params.customerID);
        if (customer) {
            const transformedCustomer = transformCustomer(customer);
            sendResponse(res, 200, "Customer retrieved successfully", transformedCustomer);
        } else {
            return next(createHttpError(404, "Customer not found"));
        }
    } catch (error) {
        logger.error(`Error retrieving customer with customerID: ${req.params.customerID}`, error);
        next(createHttpError(500, "Failed to retrieve customer", { message: error.message }));
    }
});

/**
 * @desc    Get customer by email
 * @route   GET /customers/email/:email
 * @access  Private
 */
const getCustomerByEmail = asyncHandler(async (req, res, next) => {
    logger.info(`getCustomerByEmail called with email: ${req.params.email}`);
    try {
        const customer = await customerService.getCustomerByEmailService(req.params.email);
        if (customer) {
            const transformedCustomer = transformCustomer(customer);
            sendResponse(res, 200, "Customer retrieved successfully", transformedCustomer);
        } else {
            return next(createHttpError(404, "Customer not found"));
        }
    } catch (error) {
        logger.error(`Error retrieving customer with email: ${req.params.email}`, error);
        next(createHttpError(500, "Failed to retrieve customer", { message: error.message }));
    }
});

/**
 * @desc    Get customer by MongoDB ID
 * @route   GET /customers/:_id
 * @access  Private
 */
const getCustomerById = asyncHandler(async (req, res, next) => {
    logger.info(`getCustomerById called with ID: ${req.params._id}`);
    try {
        const customer = await customerService.getCustomerByIdService(req.params._id);
        if (customer) {
            const transformedCustomer = transformCustomer(customer);
            sendResponse(res, 200, "Customer retrieved successfully", transformedCustomer);
        } else {
            return next(createHttpError(404, "Customer not found"));
        }
    } catch (error) {
        logger.error(`Error retrieving customer with ID: ${req.params._id}`, error);
        if (error.name === "CastError" && error.kind === "ObjectId") {
            return next(createHttpError(400, "Invalid customer ID format"));
        }
        next(createHttpError(500, "Failed to retrieve customer", { message: error.message }));
    }
});

/**
 * @desc    Create a new customer
 * @route   POST /customers
 * @access  Private
 */
const createCustomer = asyncHandler(async (req, res, next) => {
    logger.info("createCustomer called");
    logger.debug("Request body:", req.body);
    try {
        const customer = await customerService.createCustomerService(req.body);
        const transformedCustomer = transformCustomer(customer);
        sendResponse(res, 201, "Customer created successfully", transformedCustomer);
    } catch (error) {
        logger.error("Error creating customer:", error);
        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map((val) => val.message);
            return next(createHttpError(400, "Validation error", { message: errors.join(". ") }));
        }
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            const value = error.keyValue[field];
            return next(createHttpError(409, `Duplicate ${field}`, { message: `${field} '${value}' already exists` }));
        }
        next(createHttpError(500, "Failed to create customer", { message: error.message }));
    }
});

/**
 * @desc    Update customer by ID
 * @route   PUT /customers/:_id
 * @access  Private
 */
const updateCustomerById = asyncHandler(async (req, res, next) => {
    logger.info(`updateCustomerById called with ID: ${req.params._id}`);
    logger.debug("Update data:", req.body);
    try {
        const customer = await customerService.updateCustomerService(req.params._id, req.body);
        if (customer) {
            const transformedCustomer = transformCustomer(customer);
            sendResponse(res, 200, "Customer updated successfully", transformedCustomer);
        } else {
            return next(createHttpError(404, "Customer not found"));
        }
    } catch (error) {
        logger.error(`Error updating customer with ID: ${req.params._id}`, error);
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
            return next(createHttpError(400, "Invalid customer ID format"));
        }
        next(createHttpError(500, "Failed to update customer", { message: error.message }));
    }
});

/**
 * @desc    Delete customer by ID
 * @route   DELETE /customers/:_id
 * @access  Private
 */
const deleteCustomerById = asyncHandler(async (req, res, next) => {
    logger.info(`deleteCustomerById called with ID: ${req.params._id}`);
    try {
        const result = await customerService.deleteCustomerService(req.params._id);
        if (result.deletedCount > 0) {
            sendResponse(res, 200, "Customer deleted successfully");
        } else {
            return next(createHttpError(404, "Customer not found"));
        }
    } catch (error) {
        logger.error(`Error deleting customer with ID: ${req.params._id}`, error);
        if (error.name === "CastError" && error.kind === "ObjectId") {
            return next(createHttpError(400, "Invalid customer ID format"));
        }
        next(createHttpError(500, "Failed to delete customer", { message: error.message }));
    }
});

/**
 * @desc    Search customers
 * @route   GET /customers/search
 * @access  Private
 */
const searchCustomers = asyncHandler(async (req, res, next) => {
    const searchTerm = req.query.term;
    logger.info(`searchCustomers called with term: ${searchTerm}`);
    
    if (!searchTerm) {
        return next(createHttpError(400, "Search term is required"));
    }
    
    try {
        const customers = await customerService.searchCustomersService(searchTerm);
        const transformedCustomers = customers.map(customer => transformCustomer(customer));
        sendResponse(res, 200, "Search results retrieved successfully", transformedCustomers);
    } catch (error) {
        logger.error(`Error searching customers with term: ${searchTerm}`, error);
        next(createHttpError(500, "Failed to search customers", { message: error.message }));
    }
});

/**
 * @desc    Delete all customers
 * @route   DELETE /customers
 * @access  Private
 */
const deleteAllCustomers = asyncHandler(async (req, res, next) => {
    logger.info("deleteAllCustomers called");
    try {
        const result = await customerService.deleteAllCustomersService();
        if (result.deletedCount > 0) {
            sendResponse(res, 200, `Successfully deleted ${result.deletedCount} customers`);
        } else {
            sendResponse(res, 200, "No customers to delete");
        }
    } catch (error) {
        logger.error("Error deleting all customers:", error);
        next(createHttpError(500, "Failed to delete all customers", { message: error.message }));
    }
});

module.exports = {
    getAllCustomers,   
    getCustomerByCustomerID,
    getCustomerById,
    getCustomerByEmail,
    createCustomer,
    updateCustomerById,
    deleteCustomerById,
    searchCustomers,
    deleteAllCustomers
};
