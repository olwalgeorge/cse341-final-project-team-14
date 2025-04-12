const Order = require("../models/order.model.js");
const Product = require("../models/product.model.js");
const { generateOrderId } = require("../utils/order.utils.js");
const APIFeatures = require("../utils/apiFeatures.js");
const logger = require("../utils/logger.js");

/**
 * Get all orders with optional filtering and pagination
 */
const getAllOrdersService = async (query = {}) => {
  // Define custom filters mapping
  const customFilters = {
    status: 'status',
    customer: 'customer',
    dateField: 'orderDate'
  };

  // Build filter using APIFeatures utility
  const filter = APIFeatures.buildFilter(query, customFilters);

  // Get pagination parameters
  const pagination = APIFeatures.getPagination(query);
  
  // Get sort parameters with default sort by order date descending
  const sort = APIFeatures.getSort(query, '-orderDate');

  // Execute query
  const orders = await Order.find(filter)
    .sort(sort)
    .skip(pagination.skip)
    .limit(pagination.limit)
    .populate("customer.customerId", "name email phone customerID")
    .populate("products.product", "name description sellingPrice category sku productID");

  // Get total count for pagination
  const total = await Order.countDocuments(filter);

  return {
    orders,
    pagination: APIFeatures.paginationResult(total, pagination)
  };
};

/**
 * Get order by order ID (OR-xxxxx format)
 */
const getOrderByOrderIDService = async (orderID) => {
  return await Order.findOne({ orderID: orderID })
    .populate("customer.customerId", "name email phone customerID")
    .populate("products.product", "name description sellingPrice category sku productID");
};

/**
 * Get order by MongoDB ID
 */
const getOrderByIdService = async (id) => {
  return await Order.findById(id)
    .populate("customer.customerId", "name email phone customerID")
    .populate("products.product", "name description sellingPrice category sku productID");
};

/**
 * Create a new order
 */
const createOrderService = async (orderData) => {
  // Generate order ID if not provided
  if (!orderData.orderID) {
    orderData.orderID = await generateOrderId();
  }

  // If customer is provided as just an ID, fetch customer details
  if (orderData.customer && typeof orderData.customer === 'string') {
    const Customer = require('../models/customer.model');
    const customerData = await Customer.findById(orderData.customer);
    
    if (!customerData) {
      throw new Error('Customer not found');
    }
    
    // Structure customer data according to the order model
    orderData.customer = {
      customerId: customerData._id,
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone || '0000000000' // Fallback if not provided
    };
  }

  // Convert items format to products format if needed
  if (orderData.items && !orderData.products) {
    // Set prices from product sellingPrice if not provided
    const productsArray = [];
    
    for (let i = 0; i < orderData.items.length; i++) {
      const item = orderData.items[i];
      const orderItem = {
        product: item.product,
        quantity: item.quantity
      };
      
      // If price is not specified, fetch it from product sellingPrice
      if (!item.price || item.price === 0) {
        try {
          const product = await Product.findById(item.product);
          if (product) {
            orderItem.priceAtOrder = product.sellingPrice;
          } else {
            throw new Error(`Product with ID ${item.product} not found`);
          }
        } catch (error) {
          throw new Error(`Error setting product price: ${error.message}`);
        }
      } else {
        orderItem.priceAtOrder = item.price;
      }
      
      productsArray.push(orderItem);
    }
    
    orderData.products = productsArray;
    
    // Remove items as it's not in the model
    delete orderData.items;
  }

  // Calculate totalAmount if not provided
  if (!orderData.totalAmount && orderData.products && Array.isArray(orderData.products)) {
    orderData.totalAmount = orderData.products.reduce((total, item) => {
      return total + (item.priceAtOrder * item.quantity);
    }, 0);
  }

  const order = new Order(orderData);
  const savedOrder = await order.save();
  
  // Populate the product details before returning
  return await Order.findById(savedOrder._id)
    .populate("customer.customerId", "name email phone customerID")
    .populate("products.product", "name description sellingPrice category sku productID");
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
    .populate("customer.customerId", "name email phone customerID")
    .populate("products.product", "name description sellingPrice category sku productID");
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
const getOrdersByCustomerService = async (customerId, query = {}) => {
  // Get pagination and sorting parameters
  const pagination = APIFeatures.getPagination(query);
  const sort = APIFeatures.getSort(query, '-orderDate');

  const orders = await Order.find({ "customer.customerId": customerId })
    .sort(sort)
    .skip(pagination.skip)
    .limit(pagination.limit)
    .populate("customer.customerId", "name email phone customerID")
    .populate("products.product", "name description sellingPrice category sku productID");

  // Get total count for pagination
  const total = await Order.countDocuments({ "customer.customerId": customerId });

  return {
    orders,
    pagination: APIFeatures.paginationResult(total, pagination)
  };
};

/**
 * Get orders by customer ID (alternative implementation)
 */
const getOrdersByCustomerIdService = async (customerId) => {
  logger.debug(
    `getOrdersByCustomerIdService called with customer ID: ${customerId}`
  );
  return await Order.find({ "customer.customerId": customerId })
    .populate("products.product", "name description sellingPrice category sku productID");
};

/**
 * Get orders by status
 */
const getOrdersByStatusService = async (status, query = {}) => {
  // Get pagination and sorting parameters
  const pagination = APIFeatures.getPagination(query);
  const sort = APIFeatures.getSort(query, '-orderDate');

  const orders = await Order.find({ status: status })
    .sort(sort)
    .skip(pagination.skip)
    .limit(pagination.limit)
    .populate("customer.customerId", "name email phone customerID")
    .populate("products.product", "name description sellingPrice category sku productID");

  // Get total count for pagination
  const total = await Order.countDocuments({ status: status });

  return {
    orders,
    pagination: APIFeatures.paginationResult(total, pagination)
  };
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
