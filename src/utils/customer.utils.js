const Counter = require("../models/counter.model");
const logger = require("./logger");

/**
 * Generate a unique customer ID in the format CUST-XXXXX
 * @returns {Promise<string>} - Generated customer ID
 */
const generateCustomerId = async () => {
  logger.debug("Generating customerID");
  
  try {
    // Use the Counter.getNextId method
    const customerID = await Counter.getNextId('customerID', { 
      prefix: 'CUST-', 
      padLength: 5
    });
    
    logger.debug(`Generated customerID: ${customerID}`);
    return customerID;
  } catch (error) {
    logger.error("Error generating customerID:", error);
    throw error;
  }
};

/**
 * Transform customer data for API response
 * @param {Object} customer - Customer document from database
 * @returns {Object} - Transformed customer object
 */
const transformCustomer = (customer) => {
  if (!customer) return null;
  
  return {
    customer_id: customer._id,
    customerID: customer.customerID,
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt
  };
};

module.exports = {
  generateCustomerId,
  transformCustomer
};
