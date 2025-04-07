const sendResponse = require("../utils/response.js");
const asyncHandler = require("express-async-handler");
const logger = require("../utils/logger.js");
const { DatabaseError } = require("../utils/errors");
const { 
    getAllCustomersService, 
    getCustomerByEmailService,
    getCustomerByIdService,
    getCustomerByCustomerIDService,
    createCustomerService,
    updateCustomerService,
    deleteCustomerService,
    deleteAllCustomersService
} = require("../services/customers.service");
const { transformCustomer } = require("../utils/customer.utils");

/**
 * @desc    Get all customers
 * @route   GET /customers
 * @access  Private
 */
const getAllCustomers = asyncHandler(async (req, res, next) => {
    logger.info("getAllCustomers called");
    try {
        const customers = await getAllCustomersService();
        const transformedCustomers = customers.map(transformCustomer);
        sendResponse(res, 200, "Customers retrieved successfully", transformedCustomers);
    } catch (error) {
        logger.error("Error retrieving all customers:", error);
        next(error);
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
        const customer = await getCustomerByEmailService(req.params.email);
        if (customer) {
            const transformedCustomer = transformCustomer(customer);
            sendResponse(res, 200, "Customer retrieved successfully", transformedCustomer);
        } else {
            return next(DatabaseError.notFound("Customer"));
        }
    } catch (error) {
        logger.error(`Error retrieving customer with email: ${req.params.email}`, error);
        next(error);
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
        const customer = await getCustomerByIdService(req.params._id);
        if (customer) {
            const transformedCustomer = transformCustomer(customer);
            sendResponse(res, 200, "Customer retrieved successfully", transformedCustomer);
        } else {
            return next(DatabaseError.notFound("Customer"));
        }
    } catch (error) {
        logger.error(`Error retrieving customer with ID: ${req.params._id}`, error);
        next(error);
    }
});

/**
 * @desc    Get customer by customer ID (CU-XXXXX format)
 * @route   GET /customers/customerID/:customerID
 * @access  Private
 */
const getCustomerByCustomerID = asyncHandler(async (req, res, next) => {
    logger.info(`getCustomerByCustomerID called with customer ID: ${req.params.customerID}`);
    try {
        const customer = await getCustomerByCustomerIDService(req.params.customerID);
        if (customer) {
            const transformedCustomer = transformCustomer(customer);
            sendResponse(res, 200, "Customer retrieved successfully", transformedCustomer);
        } else {
            return next(DatabaseError.notFound("Customer"));
        }
    } catch (error) {
        logger.error(`Error retrieving customer with customer ID: ${req.params.customerID}`, error);
        next(error);
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
        const customer = await createCustomerService(req.body);
        const transformedCustomer = transformCustomer(customer);
        sendResponse(res, 201, "Customer created successfully", transformedCustomer);
    } catch (error) {
        logger.error("Error creating customer:", error);
        next(error);
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
        const customer = await updateCustomerService(req.params._id, req.body);
        if (customer) {
            const transformedCustomer = transformCustomer(customer);
            sendResponse(res, 200, "Customer updated successfully", transformedCustomer);
        } else {
            return next(DatabaseError.notFound("Customer"));
        }
    } catch (error) {
        logger.error(`Error updating customer with ID: ${req.params._id}`, error);
        next(error);
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
        const result = await deleteCustomerService(req.params._id);
        if (result.deletedCount > 0) {
            sendResponse(res, 200, "Customer deleted successfully");
        } else {
            return next(DatabaseError.notFound("Customer"));
        }
    } catch (error) {
        logger.error(`Error deleting customer with ID: ${req.params._id}`, error);
        next(error);
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
        const result = await deleteAllCustomersService();
        sendResponse(res, 200, `${result.deletedCount} customers deleted successfully`);
    } catch (error) {
        logger.error("Error deleting all customers:", error);
        next(error);
    }
});

module.exports = {
    getAllCustomers,
    getCustomerByEmail,
    getCustomerById,
    getCustomerByCustomerID,
    createCustomer,
    updateCustomerById,
    deleteCustomerById,
    deleteAllCustomers
};
