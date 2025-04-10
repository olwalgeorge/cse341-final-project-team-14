const express = require("express");
const router = express.Router();
const {
  getAllOrders,
  getOrderById,
  getOrderByOrderID,
  getOrdersByCustomerId,
  getOrdersByStatus,
  createOrder,
  updateOrderById,
  deleteOrderById,
  deleteAllOrders,
} = require("../controllers/orders.controller.js");
const validate = require("../middlewares/validation.middleware.js");
const isAuthenticated = require("../middlewares/auth.middleware.js");
const {
  orderIDValidationRules,
  order_IdValidationRules,
  customerIdValidationRules,
  orderStatusValidationRules,
  orderCreateValidationRules,
  orderUpdateValidationRules,
} = require("../validators/order.validator.js");

router.get("/", isAuthenticated, getAllOrders);
router.get(
  "/orderID/:orderID",
  isAuthenticated,
  validate(orderIDValidationRules()),
  getOrderByOrderID
);
router.get(
  "/customer/:customerId",
  isAuthenticated,
  validate(customerIdValidationRules()),
  getOrdersByCustomerId
);
router.get(
  "/status/:status",
  isAuthenticated,
  validate(orderStatusValidationRules()),
  getOrdersByStatus
);
router.get(
  "/:order_Id",
  isAuthenticated,
  validate(order_IdValidationRules()),
  getOrderById
);
router.post(
  "/",
  isAuthenticated,
  validate(orderCreateValidationRules()),
  createOrder
);
router.put(
  "/:order_Id",
  isAuthenticated,
  validate(order_IdValidationRules()),
  validate(orderUpdateValidationRules()),
  updateOrderById
);
router.delete(
  "/:order_Id",
  isAuthenticated,
  validate(order_IdValidationRules()),
  deleteOrderById
);
router.delete("/", isAuthenticated, deleteAllOrders);

module.exports = router;
