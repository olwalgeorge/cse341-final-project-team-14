const sendResponse = require("../utils/response.js");
const asyncHandler = require("express-async-handler");
const logger = require("../utils/logger.js");
const createHttpError = require("http-errors");
const orderService = require("../services/orders.service.js");
const { transformOrder } = require("../utils/order.utils.js");

/**
 * @desc    Get all orders
 * @route   GET /orders
 * @access  Private
 */
const getAllOrders = asyncHandler(async (req, res, next) => {
    logger.info("getAllOrders called");
    try {
        const result = await orderService.getAllOrdersService(req.query);
        // Transform each order in the results
        const transformedOrders = result.orders.map(order => transformOrder(order));
        
        sendResponse(res, 200, "Orders retrieved successfully", {
            orders: transformedOrders,
            pagination: result.pagination
        });
    } catch (error) {
        logger.error("Error retrieving all orders:", error);
        next(createHttpError(500, "Failed to retrieve orders", { message: error.message }));
    }
});

/**
 * @desc    Get order by order ID
 * @route   GET /orders/orderID/:orderID
 * @access  Private
 */
const getOrderByOrderID = asyncHandler(async (req, res, next) => {
    logger.info(`getOrderByOrderID called with orderID: ${req.params.orderID}`);
    try {
        const order = await orderService.getOrderByOrderIDService(req.params.orderID);
        if (order) {
            const transformedOrder = transformOrder(order);
            sendResponse(res, 200, "Order retrieved successfully", transformedOrder);
        } else {
            return next(createHttpError(404, "Order not found"));
        }
    } catch (error) {
        logger.error(`Error retrieving order with orderID: ${req.params.orderID}`, error);
        next(createHttpError(500, "Failed to retrieve order", { message: error.message }));
    }
});

/**
 * @desc    Get order by MongoDB ID
 * @route   GET /orders/:_id
 * @access  Private
 */
const getOrderById = asyncHandler(async (req, res, next) => {
    logger.info(`getOrderById called with ID: ${req.params._id}`);
    try {
        const order = await orderService.getOrderByIdService(req.params._id);
        if (order) {
            const transformedOrder = transformOrder(order);
            sendResponse(res, 200, "Order retrieved successfully", transformedOrder);
        } else {
            return next(createHttpError(404, "Order not found"));
        }
    } catch (error) {
        logger.error(`Error retrieving order with ID: ${req.params._id}`, error);
        if (error.name === "CastError" && error.kind === "ObjectId") {
            return next(createHttpError(400, "Invalid order ID format"));
        }
        next(createHttpError(500, "Failed to retrieve order", { message: error.message }));
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
        const order = await orderService.createOrderService(req.body);
        const transformedOrder = transformOrder(order);
        sendResponse(res, 201, "Order created successfully", transformedOrder);
    } catch (error) {
        logger.error("Error creating order:", error);
        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map((val) => val.message);
            return next(createHttpError(400, "Validation error", { message: errors.join(". ") }));
        }
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            const value = error.keyValue[field];
            return next(createHttpError(409, `Duplicate ${field}`, { message: `${field} '${value}' already exists` }));
        }
        next(createHttpError(500, "Failed to create order", { message: error.message }));
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
        const order = await orderService.updateOrderService(req.params._id, req.body);
        if (order) {
            const transformedOrder = transformOrder(order);
            sendResponse(res, 200, "Order updated successfully", transformedOrder);
        } else {
            return next(createHttpError(404, "Order not found"));
        }
    } catch (error) {
        logger.error(`Error updating order with ID: ${req.params._id}`, error);
        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map((val) => val.message);
            return next(createHttpError(400, "Validation error", { message: errors.join(". ") }));
        }
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            const value = error.keyValue[field];
            return next(createHttpError(409, `Duplicate ${field}`, { message: `${field} '${value}' already exists` }));
        }
        if (error.name === "CastError" && error.kind === "ObjectId") {
            return next(createHttpError(400, "Invalid order ID format"));
        }
        next(createHttpError(500, "Failed to update order", { message: error.message }));
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
        const result = await orderService.deleteOrderService(req.params._id);
        if (result.deletedCount > 0) {
            sendResponse(res, 200, "Order deleted successfully");
        } else {
            return next(createHttpError(404, "Order not found"));
        }
    } catch (error) {
        logger.error(`Error deleting order with ID: ${req.params._id}`, error);
        if (error.name === "CastError" && error.kind === "ObjectId") {
            return next(createHttpError(400, "Invalid order ID format"));
        }
        next(createHttpError(500, "Failed to delete order", { message: error.message }));
    }
});

/**
 * @desc    Get orders by customer
 * @route   GET /orders/customer/:customerId
 * @access  Private
 */
const getOrdersByCustomer = asyncHandler(async (req, res, next) => {
    logger.info(`getOrdersByCustomer called with customer ID: ${req.params.customerId}`);
    try {
        const orders = await orderService.getOrdersByCustomerService(req.params.customerId);
        if (orders && orders.length > 0) {
            const transformedOrders = orders.map(order => transformOrder(order));
            sendResponse(res, 200, "Orders retrieved successfully", transformedOrders);
        } else {
            sendResponse(res, 200, "No orders found for this customer", []);
        }
    } catch (error) {
        logger.error(`Error retrieving orders with customer ID: ${req.params.customerId}`, error);
        if (error.name === "CastError" && error.kind === "ObjectId") {
            return next(createHttpError(400, "Invalid customer ID format"));
        }
        next(createHttpError(500, "Failed to retrieve orders", { message: error.message }));
    }
});

/**
 * @desc    Get orders by status
 * @route   GET /orders/status/:status
 * @access  Private
 */
const getOrdersByStatus = asyncHandler(async (req, res, next) => {
    logger.info(`getOrdersByStatus called with status: ${req.params.status}`);
    try {
        const orders = await orderService.getOrdersByStatusService(req.params.status);
        if (orders && orders.length > 0) {
            const transformedOrders = orders.map(order => transformOrder(order));
            sendResponse(res, 200, "Orders retrieved successfully", transformedOrders);
        } else {
            sendResponse(res, 200, "No orders found with this status", []);
        }
    } catch (error) {
        logger.error(`Error retrieving orders with status: ${req.params.status}`, error);
        next(createHttpError(500, "Failed to retrieve orders", { message: error.message }));
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
        const result = await orderService.deleteAllOrdersService();
        if (result.deletedCount > 0) {
            sendResponse(res, 200, `Successfully deleted ${result.deletedCount} orders`);
        } else {
            sendResponse(res, 200, "No orders to delete");
        }
    } catch (error) {
        logger.error("Error deleting all orders:", error);
        next(createHttpError(500, "Failed to delete all orders", { message: error.message }));
    }
});

module.exports = {
    getAllOrders,   
    getOrderByOrderID,
    getOrderById,
    createOrder,
    updateOrderById,
    deleteOrderById,
    getOrdersByCustomer,
    getOrdersByStatus,
    deleteAllOrders
};
