const sendResponse = require("../utils/response.js");
const asyncHandler = require("express-async-handler");
const { createLogger } = require("../utils/logger.js");
const { ValidationError, DatabaseError } = require("../utils/errors");
const {
  getAllOrdersService,
  getOrderByIdService,
  getOrderByOrderIDService,
  getOrdersByCustomerService,
  getOrdersByStatusService,
  getOrdersByDateRangeService,
  createOrderService,
  updateOrderService,
  processOrderService,
  completeOrderService,
  cancelOrderService,
  deleteOrderService,
  deleteAllOrdersService,
} = require("../services/orders.service");
const { transformOrder } = require("../utils/order.utils");
const logger = createLogger("ordersController");

/**
 * @desc    Get all orders
 * @route   GET /orders
 * @access  Private
 */
const getAllOrders = asyncHandler(async (req, res, next) => {
  logger.info("getAllOrders called");
  logger.debug("Query parameters:", req.query);
  
  try {
    const result = await getAllOrdersService(req.query);
    
    if (!result.orders.length) {
      return sendResponse(res, 200, "No orders found", {
        orders: [],
        pagination: result.pagination
      });
    }
    
    const transformedOrders = result.orders.map(transformOrder);
    sendResponse(
      res,
      200,
      "Orders retrieved successfully",
      { orders: transformedOrders, pagination: result.pagination }
    );
  } catch (error) {
    logger.error("Error retrieving orders:", error);
    next(error);
  }
});

/**
 * @desc    Get order by ID
 * @route   GET /orders/:order_Id
 * @access  Private
 */
const getOrderById = asyncHandler(async (req, res, next) => {
  const id = req.params.order_Id;
  logger.info(`getOrderById called with ID: ${id}`);
  
  try {
    const order = await getOrderByIdService(id);
    
    if (!order) {
      return next(new DatabaseError('notFound', 'Order', id));
    }
    
    const transformedOrder = transformOrder(order);
    sendResponse(
      res,
      200,
      "Order retrieved successfully",
      transformedOrder
    );
  } catch (error) {
    logger.error(`Error retrieving order with ID: ${id}`, error);
    next(error);
  }
});

/**
 * @desc    Get order by order ID (OR-XXXXX format)
 * @route   GET /orders/orderID/:orderID
 * @access  Private
 */
const getOrderByOrderID = asyncHandler(async (req, res, next) => {
  const orderID = req.params.orderID;
  logger.info(`getOrderByOrderID called with order ID: ${orderID}`);
  
  try {
    const order = await getOrderByOrderIDService(orderID);
    
    if (!order) {
      return next(new DatabaseError('notFound', 'Order', null, { orderID }));
    }
    
    const transformedOrder = transformOrder(order);
    sendResponse(
      res,
      200,
      "Order retrieved successfully",
      transformedOrder
    );
  } catch (error) {
    logger.error(`Error retrieving order with order ID: ${orderID}`, error);
    next(error);
  }
});

/**
 * @desc    Get orders by customer
 * @route   GET /orders/customer/:customerId
 * @access  Private
 */
const getOrdersByCustomer = asyncHandler(async (req, res, next) => {
  const customerId = req.params.customerId;
  logger.info(`getOrdersByCustomer called with customer ID: ${customerId}`);
  logger.debug("Query parameters:", req.query);
  
  try {
    const result = await getOrdersByCustomerService(customerId, req.query);
    
    if (!result.orders.length) {
      return sendResponse(res, 200, `No orders found for customer ID: ${customerId}`, {
        orders: [],
        pagination: result.pagination
      });
    }
    
    const transformedOrders = result.orders.map(transformOrder);
    sendResponse(
      res,
      200,
      `Orders for customer ID "${customerId}" retrieved successfully`,
      { orders: transformedOrders, pagination: result.pagination }
    );
  } catch (error) {
    logger.error(`Error retrieving orders for customer ${customerId}:`, error);
    next(error);
  }
});

/**
 * @desc    Get orders by status
 * @route   GET /orders/status/:status
 * @access  Private
 */
const getOrdersByStatus = asyncHandler(async (req, res, next) => {
  const status = req.params.status;
  logger.info(`getOrdersByStatus called with status: ${status}`);
  logger.debug("Query parameters:", req.query);
  
  try {
    const result = await getOrdersByStatusService(status, req.query);
    
    if (!result.orders.length) {
      return sendResponse(res, 200, `No orders found with status: ${status}`, {
        orders: [],
        pagination: result.pagination
      });
    }
    
    const transformedOrders = result.orders.map(transformOrder);
    sendResponse(
      res,
      200,
      `Orders with status "${status}" retrieved successfully`,
      { orders: transformedOrders, pagination: result.pagination }
    );
  } catch (error) {
    logger.error(`Error retrieving orders with status ${status}:`, error);
    next(error);
  }
});

/**
 * @desc    Get orders by date range
 * @route   GET /orders/date-range
 * @access  Private
 */
const getOrdersByDateRange = asyncHandler(async (req, res, next) => {
  const { fromDate, toDate } = req.query;
  logger.info(`getOrdersByDateRange called with dates: ${fromDate} to ${toDate}`);
  
  try {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    
    const result = await getOrdersByDateRangeService(start, end, req.query);
    
    if (!result.orders.length) {
      return sendResponse(res, 200, `No orders found between ${fromDate} and ${toDate}`, {
        orders: [],
        pagination: result.pagination
      });
    }
    
    const transformedOrders = result.orders.map(transformOrder);
    sendResponse(
      res,
      200,
      `Orders from ${fromDate} to ${toDate} retrieved successfully`,
      { orders: transformedOrders, pagination: result.pagination }
    );
  } catch (error) {
    logger.error(`Error retrieving orders by date range:`, error);
    next(error);
  }
});

/**
 * @desc    Create a new order
 * @route   POST /orders
 * @access  Private
 */
const createOrder = asyncHandler(async (req, res, next) => {
  logger.info("createOrder called");
  logger.debug("Order data:", req.body);
  
  try {
    const orderData = { ...req.body };
    
    // Set creator if available
    if (req.user) {
      orderData.createdBy = req.user._id;
    }
    
    const order = await createOrderService(orderData);
    const transformedOrder = transformOrder(order);
    
    sendResponse(res, 201, "Order created successfully", transformedOrder);
  } catch (error) {
    logger.error("Error creating order:", error);
    
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
        'Order',
        null,
        { field, value }
      ));
    }
    
    // Handle customer or product not found error
    if (error.message && error.message.includes('not found')) {
      const entityType = error.message.split(' ')[0];
      const entityId = error.message.split(' ').pop();
      return next(new DatabaseError('notFound', entityType, entityId));
    }
    
    next(error);
  }
});

/**
 * @desc    Update order
 * @route   PUT /orders/:order_Id
 * @access  Private
 */
const updateOrder = asyncHandler(async (req, res, next) => {
  const id = req.params.order_Id;
  logger.info(`updateOrder called with ID: ${id}`);
  logger.debug("Update data:", req.body);
  
  try {
    // Get current order to check status
    const currentOrder = await getOrderByIdService(id);
    if (!currentOrder) {
      return next(new DatabaseError('notFound', 'Order', id));
    }
    
    // Prevent updates to orders in non-editable statuses
    if (['Shipped', 'Delivered', 'Completed', 'Cancelled'].includes(currentOrder.status)) {
      return next(new ValidationError(
        'status',
        currentOrder.status,
        `Orders with status '${currentOrder.status}' cannot be modified`
      ));
    }
    
    // Prevent direct status changes through regular update
    if (req.body.status) {
      const validTransitions = {
        'Pending': ['Processing', 'Cancelled'],
      };
      
      const currentStatus = currentOrder.status;
      const newStatus = req.body.status;
      
      if (!validTransitions[currentStatus] || !validTransitions[currentStatus].includes(newStatus)) {
        return next(new ValidationError(
          'status',
          newStatus,
          `Invalid status transition from '${currentStatus}' to '${newStatus}' or use specific endpoints for status changes`
        ));
      }
    }
    
    const order = await updateOrderService(id, req.body);
    const transformedOrder = transformOrder(order);
    
    sendResponse(
      res,
      200,
      "Order updated successfully",
      transformedOrder
    );
  } catch (error) {
    logger.error(`Error updating order with ID: ${id}`, error);
    
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
    
    next(error);
  }
});

/**
 * @desc    Process order
 * @route   PUT /orders/:order_Id/process
 * @access  Private
 */
const processOrder = asyncHandler(async (req, res, next) => {
  const id = req.params.order_Id;
  logger.info(`processOrder called with ID: ${id}`);
  
  try {
    // Get current order to check status
    const currentOrder = await getOrderByIdService(id);
    if (!currentOrder) {
      return next(new DatabaseError('notFound', 'Order', id));
    }
    
    // Check if order can be processed
    if (currentOrder.status !== 'Pending') {
      return next(new ValidationError(
        'status', 
        currentOrder.status, 
        `Only orders with 'Pending' status can be processed. Current status: ${currentOrder.status}`
      ));
    }
    
    // Prepare processing data
    const processData = {
      processedBy: req.user ? req.user._id : null,
      ...req.body
    };
    
    const order = await processOrderService(id, processData);
    const transformedOrder = transformOrder(order);
    
    sendResponse(
      res,
      200,
      "Order processed successfully",
      transformedOrder
    );
  } catch (error) {
    logger.error(`Error processing order with ID: ${id}`, error);
    next(error);
  }
});

/**
 * @desc    Complete order
 * @route   PUT /orders/:order_Id/complete
 * @access  Private
 */
const completeOrder = asyncHandler(async (req, res, next) => {
  const id = req.params.order_Id;
  logger.info(`completeOrder called with ID: ${id}`);
  
  try {
    // Get current order to check status
    const currentOrder = await getOrderByIdService(id);
    if (!currentOrder) {
      return next(new DatabaseError('notFound', 'Order', id));
    }
    
    // Check if order can be completed
    if (currentOrder.status !== 'Delivered') {
      return next(new ValidationError(
        'status', 
        currentOrder.status, 
        `Only orders with 'Delivered' status can be completed. Current status: ${currentOrder.status}`
      ));
    }
    
    // Prepare completion data
    const completeData = {
      completedBy: req.user ? req.user._id : null,
      ...req.body
    };
    
    const order = await completeOrderService(id, completeData);
    const transformedOrder = transformOrder(order);
    
    sendResponse(
      res,
      200,
      "Order completed successfully",
      transformedOrder
    );
  } catch (error) {
    logger.error(`Error completing order with ID: ${id}`, error);
    next(error);
  }
});

/**
 * @desc    Cancel order
 * @route   PUT /orders/:order_Id/cancel
 * @access  Private
 */
const cancelOrder = asyncHandler(async (req, res, next) => {
  const id = req.params.order_Id;
  logger.info(`cancelOrder called with ID: ${id}`);
  
  try {
    // Get current order to check status
    const currentOrder = await getOrderByIdService(id);
    if (!currentOrder) {
      return next(new DatabaseError('notFound', 'Order', id));
    }
    
    // Check if order can be cancelled
    if (['Delivered', 'Completed', 'Cancelled'].includes(currentOrder.status)) {
      return next(new ValidationError(
        'status', 
        currentOrder.status, 
        `Orders with status '${currentOrder.status}' cannot be cancelled`
      ));
    }
    
    // Require cancellation reason
    if (!req.body.cancellationReason) {
      return next(new ValidationError('cancellationReason', null, 'Cancellation reason is required'));
    }
    
    // Prepare cancellation data
    const cancelData = {
      cancelledBy: req.user ? req.user._id : null,
      ...req.body
    };
    
    const order = await cancelOrderService(id, cancelData);
    const transformedOrder = transformOrder(order);
    
    sendResponse(
      res,
      200,
      "Order cancelled successfully",
      transformedOrder
    );
  } catch (error) {
    logger.error(`Error cancelling order with ID: ${id}`, error);
    next(error);
  }
});

/**
 * @desc    Delete order
 * @route   DELETE /orders/:order_Id
 * @access  Private
 */
const deleteOrder = asyncHandler(async (req, res, next) => {
  const id = req.params.order_Id;
  logger.info(`deleteOrder called with ID: ${id}`);
  
  try {
    // Get current order to check status
    const currentOrder = await getOrderByIdService(id);
    if (!currentOrder) {
      return next(new DatabaseError('notFound', 'Order', id));
    }
    
    // Only allow deletion of Pending or Cancelled orders
    if (currentOrder.status !== 'Cancelled' && currentOrder.status !== 'Pending') {
      return next(new ValidationError(
        'status',
        currentOrder.status,
        `Only 'Pending' or 'Cancelled' orders can be deleted. Current status: ${currentOrder.status}`
      ));
    }
    
    // If the order is more than 24 hours old and not cancelled, don't allow deletion
    if (currentOrder.status !== 'Cancelled') {
      const orderDate = new Date(currentOrder.createdAt);
      const now = new Date();
      const hoursDifference = (now - orderDate) / (1000 * 60 * 60);
      
      if (hoursDifference > 24) {
        return next(new ValidationError(
          'createdAt',
          orderDate.toISOString(),
          'Orders older than 24 hours can only be deleted if they are cancelled'
        ));
      }
    }
    
    const result = await deleteOrderService(id);
    
    sendResponse(res, 200, "Order deleted successfully");
  } catch (error) {
    logger.error(`Error deleting order with ID: ${id}`, error);
    next(error);
  }
});

/**
 * @desc    Delete all orders
 * @route   DELETE /orders
 * @access  Private
 */
const deleteAllOrders = asyncHandler(async (req, res, next) => {
  logger.info("deleteAllOrders called");
  
  try {
    // Only allow in development/test environments
    const env = process.env.NODE_ENV || 'development';
    if (env === 'production') {
      return next(new ValidationError(
        'environment',
        env,
        'Mass deletion of orders is not allowed in production environment'
      ));
    }
    
    const result = await deleteAllOrdersService();
    
    sendResponse(
      res,
      200,
      `${result.deletedCount} orders deleted successfully`
    );
  } catch (error) {
    logger.error("Error deleting all orders:", error);
    next(error);
  }
});

// The controller exports the following functions:
module.exports = {
  getAllOrders,                // GET /orders
  getOrderById,                // GET /orders/:order_Id
  getOrderByOrderID,           // GET /orders/orderID/:orderID
  getOrdersByCustomer,         // GET /orders/customer/:customerId
  getOrdersByStatus,           // GET /orders/status/:status
  getOrdersByDateRange,        // GET /orders/date-range
  createOrder,                 // POST /orders
  updateOrder,                 // PUT /orders/:order_Id
  processOrder,                // PUT /orders/:order_Id/process
  completeOrder,               // PUT /orders/:order_Id/complete
  cancelOrder,                 // PUT /orders/:order_Id/cancel
  deleteOrder,                 // DELETE /orders/:order_Id
  deleteAllOrders,             // DELETE /orders
};
