const sendResponse = require("../utils/response.js");
const asyncHandler = require("express-async-handler");
const logger = require("../utils/logger.js");
const { ValidationError, DatabaseError } = require("../utils/errors.js");
const {
  getAllCustomersService,
  getCustomerByIdService,
  getCustomerByCustomerIDService,
  getCustomerByEmailService,
  searchCustomersService,
  createCustomerService,
  updateCustomerService,
  deleteCustomerService,
  deleteAllCustomersService,
} = require("../services/customers.service.js");
const { transformCustomer } = require("../utils/customer.utils.js");

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
    
    if (!result.customers.length) {
      return sendResponse(res, 200, "No customers found", {
        customers: [],
        pagination: result.pagination
      });
    }
    
    const transformedCustomers = result.customers.map(transformCustomer);
    sendResponse(
      res,
      200,
      "Customers retrieved successfully",
      { customers: transformedCustomers, pagination: result.pagination }
    );
  } catch (error) {
    logger.error("Error retrieving customers:", error);
    next(error);
  }
});

/**
 * @desc    Get customer by MongoDB ID
 * @route   GET /customers/:customer_Id
 * @access  Private
 */
const getCustomerById = asyncHandler(async (req, res, next) => {
  const id = req.params.customer_Id;
  logger.info(`getCustomerById called with ID: ${id}`);
  
  try {
    const customer = await getCustomerByIdService(id);
    
    if (!customer) {
      return next(new DatabaseError('notFound', 'Customer', id));
    }
    
    const transformedCustomer = transformCustomer(customer);
    sendResponse(
      res,
      200,
      "Customer retrieved successfully",
      transformedCustomer
    );
  } catch (error) {
    logger.error(`Error retrieving customer with ID: ${id}`, error);
    
    // Handle CastError for invalid ObjectId
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return next(new ValidationError('id', id, 'Invalid customer ID format'));
    }
    
    next(error);
  }
});

/**
 * @desc    Get customer by customer ID (CM-XXXXX format)
 * @route   GET /customers/customerID/:customerID
 * @access  Private
 */
const getCustomerByCustomerID = asyncHandler(async (req, res, next) => {
  const customerID = req.params.customerID;
  logger.info(`getCustomerByCustomerID called with customer ID: ${customerID}`);
  
  try {
    // Validate customer ID format
    if (!customerID.match(/^CM-\d{5}$/)) {
      return next(new ValidationError(
        'customerID', 
        customerID, 
        'Customer ID must be in the format CM-XXXXX where X is a digit'
      ));
    }
    
    const customer = await getCustomerByCustomerIDService(customerID);
    
    if (!customer) {
      return next(new DatabaseError('notFound', 'Customer', null, { customerID }));
    }
    
    const transformedCustomer = transformCustomer(customer);
    sendResponse(
      res,
      200,
      "Customer retrieved successfully",
      transformedCustomer
    );
  } catch (error) {
    logger.error(`Error retrieving customer with customer ID: ${customerID}`, error);
    next(error);
  }
});

/**
 * @desc    Get customer by email
 * @route   GET /customers/email/:email
 * @access  Private
 */
const getCustomerByEmail = asyncHandler(async (req, res, next) => {
  const email = req.params.email;
  logger.info(`getCustomerByEmail called with email: ${email}`);
  
  try {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(new ValidationError('email', email, 'Invalid email format'));
    }
    
    const customer = await getCustomerByEmailService(email);
    
    if (!customer) {
      return next(new DatabaseError('notFound', 'Customer', null, { email }));
    }
    
    const transformedCustomer = transformCustomer(customer);
    sendResponse(
      res,
      200,
      "Customer retrieved successfully",
      transformedCustomer
    );
  } catch (error) {
    logger.error(`Error retrieving customer with email: ${email}`, error);
    next(error);
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
  
  try {
    if (!searchTerm) {
      return next(new ValidationError('term', searchTerm, 'Search term is required'));
    }
    
    const result = await searchCustomersService(searchTerm, req.query);
    
    if (!result.customers.length) {
      return sendResponse(res, 200, "No customers found matching search criteria", {
        customers: [],
        pagination: result.pagination
      });
    }
    
    const transformedCustomers = result.customers.map(transformCustomer);
    sendResponse(
      res,
      200,
      "Customers retrieved successfully",
      { customers: transformedCustomers, pagination: result.pagination }
    );
  } catch (error) {
    logger.error(`Error searching customers with term: ${searchTerm}`, error);
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
  logger.debug("Customer data:", req.body);
  
  try {
    // Ensure we're not using any user-provided customerID to force generation
    const customerData = { ...req.body };
    delete customerData.customerID;
    
    const customer = await createCustomerService(customerData);
    const transformedCustomer = transformCustomer(customer);
    sendResponse(res, 201, "Customer created successfully", transformedCustomer);
  } catch (error) {
    logger.error("Error creating customer:", error);
    
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const firstErrorKey = Object.keys(error.errors)[0];
      const firstError = error.errors[firstErrorKey];
      
      return next(new ValidationError(
        firstErrorKey,
        firstError.value,
        firstError.message
      ));
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      
      return next(new DatabaseError(
        'duplicate',
        'Customer',
        null,
        { field, value }
      ));
    }
    
    next(error);
  }
});

/**
 * @desc    Update customer by ID
 * @route   PUT /customers/:customer_Id
 * @access  Private
 */
const updateCustomerById = asyncHandler(async (req, res, next) => {
  const id = req.params.customer_Id;
  logger.info(`updateCustomer called with ID: ${id}`);
  logger.debug("Update data:", req.body);
  
  try {
    // Prevent updating the customerID
    if (req.body.customerID) {
      delete req.body.customerID;
    }
    
    const customer = await updateCustomerService(id, req.body);
    
    if (!customer) {
      return next(new DatabaseError('notFound', 'Customer', id));
    }
    
    const transformedCustomer = transformCustomer(customer);
    sendResponse(
      res,
      200,
      "Customer updated successfully",
      transformedCustomer
    );
  } catch (error) {
    logger.error(`Error updating customer with ID: ${id}`, error);
    
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const firstErrorKey = Object.keys(error.errors)[0];
      const firstError = error.errors[firstErrorKey];
      
      return next(new ValidationError(
        firstErrorKey,
        firstError.value,
        firstError.message
      ));
    }
    
    // Handle CastError for invalid ObjectId
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return next(new ValidationError('id', id, 'Invalid customer ID format'));
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      
      return next(new DatabaseError(
        'duplicate',
        'Customer',
        null,
        { field, value }
      ));
    }
    
    next(error);
  }
});

/**
 * @desc    Delete customer by ID
 * @route   DELETE /customers/:customer_Id
 * @access  Private
 */
const deleteCustomerById = asyncHandler(async (req, res, next) => {
  const id = req.params.customer_Id;
  logger.info(`deleteCustomer called with ID: ${id}`);
  
  try {
    const result = await deleteCustomerService(id);
    
    if (result.deletedCount === 0) {
      return next(new DatabaseError('notFound', 'Customer', id));
    }
    
    sendResponse(res, 200, "Customer deleted successfully");
  } catch (error) {
    logger.error(`Error deleting customer with ID: ${id}`, error);
    
    // Handle CastError for invalid ObjectId
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return next(new ValidationError('id', id, 'Invalid customer ID format'));
    }
    
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
  getCustomerById,
  getCustomerByCustomerID,
  getCustomerByEmail,
  searchCustomers,
  createCustomer,
  updateCustomerById,
  deleteCustomerById,
  deleteAllCustomers,
};
