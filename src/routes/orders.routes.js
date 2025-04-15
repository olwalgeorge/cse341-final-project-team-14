const express = require("express");
const router = express.Router();
const {
  getAllOrders,
  getOrderById,
  getOrderByOrderID,
  getOrdersByCustomer,
  getOrdersByStatus,
  getOrdersByDateRange,
  createOrder,
  updateOrder,
  processOrder,
  completeOrder,
  cancelOrder,
  deleteOrder,
  deleteAllOrders,
} = require("../controllers/orders.controller");
const isAuthenticated = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validation.middleware");
const {
  orderIdValidationRules,
  orderIDFormatValidationRules,
  customerIdValidationRules,
  statusValidationRules,
  dateRangeValidationRules,
  createOrderValidationRules,
  updateOrderValidationRules,
  cancelOrderValidationRules
} = require("../validators/order.validator");

// Get all orders
router.get("/", isAuthenticated, getAllOrders);

// Get order by MongoDB ID
router.get(
  "/:order_Id", 
  isAuthenticated, 
  validate(orderIdValidationRules()),
  getOrderById
);

// Get order by order ID (OR-XXXXX format)
router.get(
  "/orderID/:orderID", 
  isAuthenticated, 
  validate(orderIDFormatValidationRules()),
  getOrderByOrderID
);

// Get orders by customer
router.get(
  "/customer/:customerId", 
  isAuthenticated, 
  validate(customerIdValidationRules()),
  getOrdersByCustomer
);

// Get orders by status
router.get(
  "/status/:status", 
  isAuthenticated, 
  validate(statusValidationRules()),
  getOrdersByStatus
);

// Get orders by date range
router.get(
  "/date-range", 
  isAuthenticated, 
  validate(dateRangeValidationRules()),
  getOrdersByDateRange
);

// Create a new order
router.post(
  "/", 
  isAuthenticated, 
  validate(createOrderValidationRules()),
  createOrder
);

// Update an order
router.put(
  "/:order_Id", 
  isAuthenticated, 
  validate([...orderIdValidationRules(), ...updateOrderValidationRules()]),
  updateOrder
);

// Process an order
router.put(
  "/:order_Id/process", 
  isAuthenticated, 
  validate(orderIdValidationRules()),
  processOrder
);

// Complete an order
router.put(
  "/:order_Id/complete", 
  isAuthenticated, 
  validate(orderIdValidationRules()),
  completeOrder
);

// Cancel an order
router.put(
  "/:order_Id/cancel", 
  isAuthenticated, 
  validate([...orderIdValidationRules(), ...cancelOrderValidationRules()]),
  cancelOrder
);

// Delete an order
router.delete(
  "/:order_Id", 
  isAuthenticated, 
  validate(orderIdValidationRules()),
  deleteOrder
);

// Delete all orders (dev/test only)
router.delete("/", isAuthenticated, deleteAllOrders);

module.exports = router;
