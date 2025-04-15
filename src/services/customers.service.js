const Customer = require("../models/customer.model");
const { createLogger } = require("../utils/logger");
const APIFeatures = require("../utils/apiFeatures");

const logger = createLogger("CustomersService");
const { generateCustomerId } = require("../utils/customer.utils.js");

/**
 * Get all customers with pagination and filtering
 */
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
        field: 'contact.email',
        transform: (value) => ({ $regex: value, $options: 'i' })
      },
      phone: {
        field: 'contact.phone',
        transform: (value) => ({ $regex: value, $options: 'i' })
      },
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
      },
      postalCode: {
        field: 'address.postalCode',
        transform: (value) => ({ $regex: value, $options: 'i' })
      },
      isActive: {
        field: 'isActive',
        transform: (value) => value === 'true'
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

/**
 * Get customer by MongoDB ID
 */
const getCustomerByIdService = async (id) => {
  logger.debug(`getCustomerByIdService called with ID: ${id}`);
  try {
    return await Customer.findById(id);
  } catch (error) {
    logger.error(`Error in getCustomerByIdService for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get customer by customer ID (CM-XXXXX format)
 */
const getCustomerByCustomerIDService = async (customerID) => {
  logger.debug(`getCustomerByCustomerIDService called with customerID: ${customerID}`);
  
  try {
    // Find the customer by customerID
    return await Customer.findOne({ customerID });
  } catch (error) {
    logger.error(`Error in getCustomerByCustomerIDService for customerID ${customerID}:`, error);
    throw error;
  }
};

/**
 * Get customer by email
 */
const getCustomerByEmailService = async (email) => {
  logger.debug(`getCustomerByEmailService called with email: ${email}`);
  
  try {
    return await Customer.findOne({ "contact.email": email });
  } catch (error) {
    logger.error(`Error in getCustomerByEmailService for email ${email}:`, error);
    throw error;
  }
};

/**
 * Search customers by term
 */
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
        { "contact.email": { $regex: searchTerm, $options: 'i' } },
        { "contact.phone": { $regex: searchTerm, $options: 'i' } },
        { customerID: { $regex: searchTerm, $options: 'i' } },
        { "address.street": { $regex: searchTerm, $options: 'i' } },
        { "address.city": { $regex: searchTerm, $options: 'i' } },
        { "address.state": { $regex: searchTerm, $options: 'i' } },
        { "address.country": { $regex: searchTerm, $options: 'i' } }
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
    logger.error(`Error in searchCustomersService for term ${searchTerm}:`, error);
    throw error;
  }
};

/**
 * Create a new customer
 */
const createCustomerService = async (customerData) => {
  logger.debug("createCustomerService called with data:", customerData);
  try {
    // Generate customer ID if not provided
    if (!customerData.customerID) {
      customerData.customerID = await generateCustomerId();
      logger.debug(`Generated customerID: ${customerData.customerID}`);
    }
    
    const customer = new Customer(customerData);
    return await customer.save();
  } catch (error) {
    logger.error("Error in createCustomerService:", error);
    throw error;
  }
};

/**
 * Update customer by ID
 */
const updateCustomerService = async (id, updateData) => {
  logger.debug(`updateCustomerService called with ID: ${id}`, updateData);
  try {
    return await Customer.findByIdAndUpdate(
      id, 
      { ...updateData, updatedAt: Date.now() }, 
      { new: true, runValidators: true }
    );
  } catch (error) {
    logger.error(`Error in updateCustomerService for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete customer by ID
 */
const deleteCustomerService = async (id) => {
  logger.debug(`deleteCustomerService called with ID: ${id}`);
  try {
    return await Customer.deleteOne({ _id: id });
  } catch (error) {
    logger.error(`Error in deleteCustomerService for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete all customers
 */
const deleteAllCustomersService = async () => {
  logger.debug("deleteAllCustomersService called");
  try {
    return await Customer.deleteMany({});
  } catch (error) {
    logger.error("Error in deleteAllCustomersService:", error);
    throw error;
  }
};

module.exports = {
  getAllCustomersService,
  getCustomerByIdService,
  getCustomerByCustomerIDService,
  getCustomerByEmailService,
  searchCustomersService,
  createCustomerService,
  updateCustomerService,
  deleteCustomerService,
  deleteAllCustomersService,
};
