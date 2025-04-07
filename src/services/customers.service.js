const Customer = require('../models/customer.model');
const logger = require('../utils/logger');

// Get all customers
const getAllCustomersService = async () => {
    logger.debug('getAllCustomersService called');
    return await Customer.find({});
};

// Get customer by email
const getCustomerByEmailService = async (email) => {
    logger.debug(`getCustomerByEmailService called with email: ${email}`);
    return await Customer.findOne({ email: email });
};

/**
 * Get customer by customer ID (CU-XXXXX format)
 */
const getCustomerByCustomerIDService = async (customerID) => {
    logger.debug(`getCustomerByCustomerIDService called with customer ID: ${customerID}`);
    return await Customer.findOne({ customerID: customerID });
};

// Get customer by ID
const getCustomerByIdService = async (id) => {
    logger.debug(`getCustomerByIdService called with ID: ${id}`);
    return await Customer.findById(id);
};

// Create a new customer
const createCustomerService = async (customerData) => {
    logger.debug('createCustomerService called with data:', customerData);
    const customer = new Customer(customerData);
    return await customer.save();
};

// Update customer by ID
const updateCustomerService = async (id, updateData) => {
    logger.debug(`updateCustomerService called with ID: ${id}`, updateData);
    return await Customer.findByIdAndUpdate(id, updateData, { new: true });
};

// Delete customer by ID
const deleteCustomerService = async (id) => {
    logger.debug(`deleteCustomerService called with ID: ${id}`);
    return await Customer.deleteOne({ _id: id });
};

// Delete all customers
const deleteAllCustomersService = async () => {
    logger.debug('deleteAllCustomersService called');
    return await Customer.deleteMany({});
};

module.exports = {
    getAllCustomersService,
    getCustomerByEmailService,
    getCustomerByCustomerIDService,
    getCustomerByIdService,
    createCustomerService,
    updateCustomerService,
    deleteCustomerService,
    deleteAllCustomersService
};
