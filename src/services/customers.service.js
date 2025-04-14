const Customer = require("../models/customer.model");
const logger = require("../utils/logger");
const APIFeatures = require("../utils/apiFeatures");

// Get all customers with filtering, pagination, and sorting
const getAllCustomersService = async (query = {}) => {
  logger.debug("getAllCustomersService called with query:", query);
  
  try {
    // Define custom filters mapping
    const customFilters = {
      name: {
        field: 'name',
        transform: (value) => ({ $regex: value, $options: 'i' })
      },
      email: {
        field: 'email',
        transform: (value) => ({ $regex: value, $options: 'i' })
      },
      phone: 'phone',
      city: {
        field: 'address.city',
        transform: (value) => ({ $regex: value, $options: 'i' })
      },
      state: {
        field: 'address.state',
        transform: (value) => ({ $regex: value, $options: 'i' })
      },
      country: {
        field: 'address.country',
        transform: (value) => ({ $regex: value, $options: 'i' })
      }
    };
    
    // Build filter using APIFeatures utility
    const filter = APIFeatures.buildFilter(query, customFilters);
    
    // Get pagination parameters
    const pagination = APIFeatures.getPagination(query);
    
    // Get sort parameters with default sort by name
    const sort = APIFeatures.getSort(query, 'name');

    // Execute query with pagination and sorting
    const customers = await Customer.find(filter)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit);
    
    // Get total count for pagination
    const total = await Customer.countDocuments(filter);
    
    return {
      customers,
      pagination: APIFeatures.paginationResult(total, pagination)
    };
  } catch (error) {
    logger.error("Error in getAllCustomersService:", error);
    throw error;
  }
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
  return await Customer.findByIdAndUpdate(customer_Id, updateData, { 
    new: true,
    runValidators: true  // Ensure validators run on update
  });
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

// Search customers by term
const searchCustomersService = async (searchTerm, query = {}) => {
  logger.debug(`searchCustomersService called with term: ${searchTerm}`);
  
  try {
    // Get pagination parameters
    const pagination = APIFeatures.getPagination(query);
    
    // Get sort parameters with default sort by name
    const sort = APIFeatures.getSort(query, 'name');

    // Create text search criteria
    const searchCriteria = {
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { 'address.city': { $regex: searchTerm, $options: 'i' } },
        { 'address.state': { $regex: searchTerm, $options: 'i' } },
        { 'address.country': { $regex: searchTerm, $options: 'i' } }
      ]
    };

    // Execute search query with pagination and sorting
    const customers = await Customer.find(searchCriteria)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit);
    
    // Get total count for pagination
    const total = await Customer.countDocuments(searchCriteria);
    
    return {
      customers,
      pagination: APIFeatures.paginationResult(total, pagination)
    };
  } catch (error) {
    logger.error("Error in searchCustomersService:", error);
    throw error;
  }
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
  searchCustomersService, // Add the new service to exports
};
