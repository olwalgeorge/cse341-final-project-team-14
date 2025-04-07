const Order = require("../models/order.model.js");
const { generateOrderId } = require("../utils/order.utils.js");
const logger = require("../utils/logger.js");

/**
 * Get all orders with optional filtering and pagination
 */
const getAllOrdersService = async (query = {}) => {
  // Create filter object
  const filter = {};

  // Apply status filter
  if (query.status) {
    filter.status = query.status;
  }

  // Apply customer filter
  if (query.customer) {
    filter.customer = query.customer;
  }

  // Apply date range filter
  if (query.fromDate || query.toDate) {
    filter.orderDate = {};
    if (query.fromDate) filter.orderDate.$gte = new Date(query.fromDate);
    if (query.toDate) filter.orderDate.$lte = new Date(query.toDate);
  }

  // Pagination
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  // Sort options
  const sort = {};
  if (query.sort) {
    const sortFields = query.sort.split(",");
    sortFields.forEach((field) => {
      if (field.startsWith("-")) {
        sort[field.substring(1)] = -1;
      } else {
        sort[field] = 1;
      }
    });
  } else {
    sort.orderDate = -1; // Default sort by newest orders
  }

  // Execute query
  const orders = await Order.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate("customer", "fullName email")
    .populate("items.product", "name price");

  // Get total count for pagination
  const total = await Order.countDocuments(filter);

  return {
    orders,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get order by order ID (OR-xxxxx format)
 */
const getOrderByOrderIDService = async (orderID) => {
  return await Order.findOne({ orderID: orderID })
    .populate("customer", "fullName email")
    .populate("items.product", "name price");
};

/**
 * Get order by MongoDB ID
 */
const getOrderByIdService = async (id) => {
  return await Order.findById(id)
    .populate("customer", "fullName email")
    .populate("items.product", "name price");
};

/**
 * Create a new order
 */
const createOrderService = async (orderData) => {
  // Generate order ID if not provided
  if (!orderData.orderID) {
    orderData.orderID = await generateOrderId();
  }

  const order = new Order(orderData);
  return await order.save();
};

/**
 * Update an order by ID
 */
const updateOrderService = async (id, updates) => {
  return await Order.findByIdAndUpdate(
    id,
    { ...updates, updatedAt: Date.now() },
    { new: true, runValidators: true }
  )
    .populate("customer", "fullName email")
    .populate("items.product", "name price");
};

/**
 * Delete an order by ID
 */
const deleteOrderService = async (id) => {
  return await Order.deleteOne({ _id: id });
};

/**
 * Get orders by customer ID
 */
const getOrdersByCustomerService = async (customerId) => {
  return await Order.find({ customer: customerId })
    .populate("customer", "fullName email")
    .populate("items.product", "name price");
};

/**
 * Get orders by customer ID (alternative implementation)
 */
const getOrdersByCustomerIdService = async (customerId) => {
  logger.debug(
    `getOrdersByCustomerIdService called with customer ID: ${customerId}`
  );
  return await Order.find({ customerId: customerId });
};

/**
 * Get orders by status
 */
const getOrdersByStatusService = async (status) => {
  return await Order.find({ status: status })
    .populate("customer", "fullName email")
    .populate("items.product", "name price");
};

/**
 * Delete all orders - use with caution
 */
const deleteAllOrdersService = async () => {
  return await Order.deleteMany({});
};

module.exports = {
  getAllOrdersService,
  getOrderByOrderIDService,
  getOrderByIdService,
  getOrdersByCustomerIdService,
  createOrderService,
  updateOrderService,
  deleteOrderService,
  getOrdersByCustomerService,
  getOrdersByStatusService,
  deleteAllOrdersService,
};
