const sendResponse = require("../utils/response.js");
const asyncHandler = require("express-async-handler");
const logger = require("../utils/logger.js");
const { DatabaseError } = require("../utils/errors");
const { 
    getAllOrdersService, 
    getOrderByIdService,
    getOrdersByCustomerIdService,
    getOrderByOrderIDService,
    createOrderService,
    updateOrderService,
    deleteOrderService,
    deleteAllOrdersService,
    getOrdersByStatusService
} = require("../services/orders.service");
const { transformOrder } = require("../utils/order.utils");

/**
 * @desc    Get all orders
 * @route   GET /orders
 * @access  Private
 */
const getAllOrders = asyncHandler(async (req, res, next) => {
    logger.info("getAllOrders called");
    try {
        const orders = await getAllOrdersService();
        const transformedOrders = orders.map(transformOrder);
        sendResponse(res, 200, "Orders retrieved successfully", transformedOrders);
    } catch (error) {
        logger.error("Error retrieving all orders:", error);
        next(error);
    }
});

/**
 * @desc    Get order by ID
 * @route   GET /orders/:_id
 * @access  Private
 */
const getOrderById = asyncHandler(async (req, res, next) => {
    logger.info(`getOrderById called with ID: ${req.params._id}`);
    try {
        const order = await getOrderByIdService(req.params._id);
        if (order) {
            const transformedOrder = transformOrder(order);
            sendResponse(res, 200, "Order retrieved successfully", transformedOrder);
        } else {
            return next(DatabaseError.notFound("Order"));
        }
    } catch (error) {
        logger.error(`Error retrieving order with ID: ${req.params._id}`, error);
        next(error);
    }
});

/**
 * @desc    Get orders by customer ID
 * @route   GET /orders/customer/:customerId
 * @access  Private
 */
const getOrdersByCustomerId = asyncHandler(async (req, res, next) => {
    logger.info(`getOrdersByCustomerId called with customer ID: ${req.params.customerId}`);
    try {
        const orders = await getOrdersByCustomerIdService(req.params.customerId);
        if (orders && orders.length > 0) {
            const transformedOrders = orders.map(transformOrder);
            sendResponse(res, 200, "Orders retrieved successfully", transformedOrders);
        } else {
            return next(DatabaseError.notFound("Orders for customer"));
        }
    } catch (error) {
        logger.error(`Error retrieving orders for customer: ${req.params.customerId}`, error);
        next(error);
    }
});

/**
 * @desc    Get order by order ID (OR-XXXXX format)
 * @route   GET /orders/orderID/:orderID
 * @access  Private
 */
const getOrderByOrderID = asyncHandler(async (req, res, next) => {
    logger.info(`getOrderByOrderID called with order ID: ${req.params.orderID}`);
    try {
        const order = await getOrderByOrderIDService(req.params.orderID);
        if (order) {
            const transformedOrder = transformOrder(order);
            sendResponse(res, 200, "Order retrieved successfully", transformedOrder);
        } else {
            return next(DatabaseError.notFound("Order"));
        }
    } catch (error) {
        logger.error(`Error retrieving order with order ID: ${req.params.orderID}`, error);
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
    logger.debug("Request body:", req.body);
    try {
        const order = await createOrderService(req.body);
        const transformedOrder = transformOrder(order);
        sendResponse(res, 201, "Order created successfully", transformedOrder);
    } catch (error) {
        logger.error("Error creating order:", error);
        next(error);
    }
});

/**
 * @desc    Update order by ID
 * @route   PUT /orders/:_id
 * @access  Private
 */
const updateOrderById = asyncHandler(async (req, res, next) => {
    logger.info(`updateOrderById called with ID: ${req.params._id}`);
    logger.debug("Update data:", req.body);
    try {
        const order = await updateOrderService(req.params._id, req.body);
        if (order) {
            const transformedOrder = transformOrder(order);
            sendResponse(res, 200, "Order updated successfully", transformedOrder);
        } else {
            return next(DatabaseError.notFound("Order"));
        }
    } catch (error) {
        logger.error(`Error updating order with ID: ${req.params._id}`, error);
        next(error);
    }
});

/**
 * @desc    Delete order by ID
 * @route   DELETE /orders/:_id
 * @access  Private
 */
const deleteOrderById = asyncHandler(async (req, res, next) => {
    logger.info(`deleteOrderById called with ID: ${req.params._id}`);
    try {
        const result = await deleteOrderService(req.params._id);
        if (result.deletedCount > 0) {
            sendResponse(res, 200, "Order deleted successfully");
        } else {
            return next(DatabaseError.notFound("Order"));
        }
    } catch (error) {
        logger.error(`Error deleting order with ID: ${req.params._id}`, error);
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
        const result = await deleteAllOrdersService();
        sendResponse(res, 200, `${result.deletedCount} orders deleted successfully`);
    } catch (error) {
        logger.error("Error deleting all orders:", error);
        next(error);
    }
});

/**
 * @desc    Get orders by status
 * @route   GET /orders/status/:status
 * @access  Public
 */
const getOrdersByStatus = asyncHandler(async (req, res, next) => {
    logger.info(`getOrdersByStatus called with status: ${req.params.status}`);
    try {
        const orders = await getOrdersByStatusService(req.params.status);
        if (orders && orders.length > 0) {
            const transformedOrders = orders.map(transformOrder);
            sendResponse(res, 200, "Orders retrieved successfully", transformedOrders);
        } else {
            // Return empty array instead of 404 for empty results
            sendResponse(res, 200, "No orders found with this status", []);
        }
    } catch (error) {
        logger.error(`Error retrieving orders with status: ${req.params.status}`, error);
        next(error);
    }
});

module.exports = {
    getAllOrders,
    getOrderById,
    getOrdersByCustomerId,
    getOrderByOrderID,
    createOrder,
    updateOrderById,
    deleteOrderById,
    deleteAllOrders,
    getOrdersByStatus
};
