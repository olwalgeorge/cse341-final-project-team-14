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
const { authorize } = require("../middlewares/auth.middleware");
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

// Query operations - MANAGER and ADMIN can view all orders, others can only view their own orders
// This will be enforced at controller level by checking user role and filter accordingly
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

// Create a new order - any authenticated user can create orders
router.post(
  "/", 
  isAuthenticated, 
  validate(createOrderValidationRules()),
  createOrder
);

// Update operations - editing orders requires higher permissions
router.put(
  "/:order_Id", 
  isAuthenticated,
  authorize(['ADMIN', 'MANAGER', 'SUPERVISOR']),
  validate([...orderIdValidationRules(), ...updateOrderValidationRules()]),
  updateOrder
);

// Workflow operations - these affect order state and require appropriate permissions
router.put(
  "/:order_Id/process", 
  isAuthenticated,
  authorize(['ADMIN', 'MANAGER', 'SUPERVISOR']), 
  validate(orderIdValidationRules()),
  processOrder
);

// Complete an order
router.put(
  "/:order_Id/complete", 
  isAuthenticated,
  authorize(['ADMIN', 'MANAGER', 'SUPERVISOR']), 
  validate(orderIdValidationRules()),
  completeOrder
);

// Cancel an order - users can cancel their own orders, admins can cancel any order
// Logic to check ownership will be in the controller
router.put(
  "/:order_Id/cancel", 
  isAuthenticated, 
  validate([...orderIdValidationRules(), ...cancelOrderValidationRules()]),
  cancelOrder
);

// Dangerous operations - restricted to admin only
router.delete(
  "/:order_Id", 
  isAuthenticated,
  authorize('ADMIN'), 
  validate(orderIdValidationRules()),
  deleteOrder
);

// Delete all orders (dev/test only) - highly restricted operation
router.delete("/", isAuthenticated, authorize('ADMIN'), deleteAllOrders);

module.exports = router;
