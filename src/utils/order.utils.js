const Counter = require("../models/counter.model");
const { createLogger } = require("./logger");
const logger = createLogger("OrderUtils");

/**
 * Transform order data for API response
 */
const transformOrder = (order) => {
  if (!order) return null;
  
  // Keep existing transformation logic if any, or implement a basic transform
  const transformed = {
    id: order._id,
    orderID: order.orderID,
    customer: order.customer,
    items: order.items,
    status: order.status,
    totalAmount: order.totalAmount,
    // Include other fields as needed
    createdAt: order.createdAt,
    updatedAt: order.updatedAt
  };
  
  return transformed;
};

/**
 * Generate unique order ID (OR-XXXXX format)
 */
const generateOrderId = async () => {
  logger.debug("Generating orderID");
  
  try {
    // Use the Counter.getNextId method
    const orderID = await Counter.getNextId('orderID', { 
      prefix: 'OR-', 
      padLength: 5
    });
    
    logger.debug(`Generated orderID: ${orderID}`);
    return orderID;
  } catch (error) {
    logger.error("Error generating orderID:", error);
    throw error;
  }
};

module.exports = {
  transformOrder,
  generateOrderId
};
