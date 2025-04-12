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
  deleteAllCustomersService,
} = require("../services/customers.service");
const { transformCustomer, generateCustomerId } = require("../utils/customer.utils");

/**
 * @desc    Get all customers
 * @route   GET /customers
 * @access  Private
 */
const getAllCustomers = asyncHandler(async (req, res, next) => {
  logger.info("getAllCustomers called");
  logger.debug("Query parameters:", req.query);
  try {
    const result = await getAllCustomersService(req.query);
    // Transform customers before sending response
    const transformedCustomers = result.customers.map(transformCustomer);
    
    sendResponse(
      res,
      200,
      "Customers retrieved successfully",
      {
        customers: transformedCustomers,
        pagination: result.pagination
      }
    );
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
      sendResponse(
        res,
        200,
        "Customer retrieved successfully",
        transformedCustomer
      );
    } else {
      return next(DatabaseError.notFound("Customer"));
    }
  } catch (error) {
    logger.error(
      `Error retrieving customer with email: ${req.params.email}`,
      error
    );
    next(error);
  }
});

/**
 * @desc    Get customer by customer's MongoDB ID
 * @route   GET /customers/:customer_Id
 * @access  Private
 */
const getCustomerById = asyncHandler(async (req, res, next) => {
  logger.info(`getCustomerById called with customer_Id: ${req.params.customer_Id}`);
  try {
    const customer = await getCustomerByIdService(req.params.customer_Id);
    if (customer) {
      const transformedCustomer = transformCustomer(customer);
      sendResponse(
        res,
        200,
        "Customer retrieved successfully",
        transformedCustomer
      );
    } else {
      return next(DatabaseError.notFound("Customer"));
    }
  } catch (error) {
    logger.error(`Error retrieving customer with customer_Id: ${req.params.customer_Id}`, error);
    next(error);
  }
});

/**
 * @desc    Get customer by customer ID (CU-XXXXX format)
 * @route   GET /customers/customerID/:customerID
 * @access  Private
 */
const getCustomerByCustomerID = asyncHandler(async (req, res, next) => {
  logger.info(
    `getCustomerByCustomerID called with customerID: ${req.params.customerID}`
  );
  try {
    const customer = await getCustomerByCustomerIDService(
      req.params.customerID
    );
    if (customer) {
      const transformedCustomer = transformCustomer(customer);
      sendResponse(
        res,
        200,
        "Customer retrieved successfully",
        transformedCustomer
      );
    } else {
      return next(DatabaseError.notFound("Customer"));
    }
  } catch (error) {
    logger.error(
      `Error retrieving customer with customerID: ${req.params.customerID}`,
      error
    );
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
    // Generate a unique customerID before saving
    const customerID = await generateCustomerId();
    const customerData = {
      ...req.body,
      customerID: customerID
    };
    
    logger.debug(`Generated customerID: ${customerID}`);
    const customer = await createCustomerService(customerData);
    const transformedCustomer = transformCustomer(customer);
    sendResponse(
      res,
      201,
      "Customer created successfully",
      transformedCustomer
    );
  } catch (error) {
    logger.error("Error creating customer:", error);
    next(error);
  }
});

/**
 * @desc    Update customer by customer's MongoDB ID
 * @route   PUT /customers/:customer_Id
 * @access  Private
 */
const updateCustomerById = asyncHandler(async (req, res, next) => {
  logger.info(`updateCustomerById called with customer_Id: ${req.params.customer_Id}`);
  logger.debug("Update data:", req.body);
  try {
    const customer = await updateCustomerService(req.params.customer_Id, req.body);
    if (customer) {
      const transformedCustomer = transformCustomer(customer);
      sendResponse(
        res,
        200,
        "Customer updated successfully",
        transformedCustomer
      );
    } else {
      return next(DatabaseError.notFound("Customer"));
    }
  } catch (error) {
    logger.error(`Error updating customer with customer_Id: ${req.params.customer_Id}`, error);
    next(error);
  }
});

/**
 * @desc    Delete customer by customer's MongoDB ID
 * @route   DELETE /customers/:customer_Id
 * @access  Private
 */
const deleteCustomerById = asyncHandler(async (req, res, next) => {
  logger.info(`deleteCustomerById called with customer_Id: ${req.params.customer_Id}`);
  try {
    const result = await deleteCustomerService(req.params.customer_Id);
    if (result.deletedCount > 0) {
      sendResponse(res, 200, "Customer deleted successfully");
    } else {
      return next(DatabaseError.notFound("Customer"));
    }
  } catch (error) {
    logger.error(`Error deleting customer with customer_Id: ${req.params.customer_Id}`, error);
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
    sendResponse(
      res,
      200,
      `${result.deletedCount} customers deleted successfully`
    );
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
  deleteAllCustomers,
};
