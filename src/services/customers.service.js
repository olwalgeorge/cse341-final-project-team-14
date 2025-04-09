const Customer = require("../models/customer.model");
const logger = require("../utils/logger");

// Get all customers
const getAllCustomersService = async () => {
  logger.debug("getAllCustomersService called");
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
  logger.debug(
    `getCustomerByCustomerIDService called with customerID: ${customerID}`
  );
  return await Customer.findOne({ customerID: customerID });
};

// Get customer by customer's MongoDB ID
const getCustomerByIdService = async (customer_Id) => {
  logger.debug(`getCustomerByIdService called with customer_Id: ${customer_Id}`);
  return await Customer.findById(customer_Id);
};

// Create a new customer
const createCustomerService = async (customerData) => {
  logger.debug("createCustomerService called with data:", customerData);
  const customer = new Customer(customerData);
  return await customer.save();
};

// Update customer by customer's MongoDB ID
const updateCustomerService = async (customer_Id, updateData) => {
  logger.debug(`updateCustomerService called with customer_Id: ${customer_Id}`, updateData);
  return await Customer.findByIdAndUpdate(customer_Id, updateData, { new: true });
};

// Delete customer by customer's MongoDB ID
const deleteCustomerService = async (customer_Id) => {
  logger.debug(`deleteCustomerService called with customer_Id: ${customer_Id}`);
  return await Customer.deleteOne({ _id: customer_Id });
};

// Delete all customers
const deleteAllCustomersService = async () => {
  logger.debug("deleteAllCustomersService called");
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
  deleteAllCustomersService,
};
