const express = require("express");
const router = express.Router();
const {
  getAllCustomers,
  getCustomerById,
  getCustomerByCustomerID,
  getCustomerByEmail,
  createCustomer,
  updateCustomerById,
  deleteCustomerById,
  deleteAllCustomers,
  searchCustomers, 
} = require("../controllers/customers.controller.js");
const validate = require("../middlewares/validation.middleware.js");
const isAuthenticated = require("../middlewares/auth.middleware.js");
const { authorize } = require("../middlewares/auth.middleware.js");
const {
  customerIDValidationRules,
  customerCreateValidationRules,
  customerUpdateValidationRules,
  customer_IdValidationRules,
  customerQueryValidationRules,
  customerSearchValidationRules,
} = require("../validators/customer.validator.js");

// Read operations - available to all authenticated users
router.get(
  "/search", 
  isAuthenticated,
  validate(customerSearchValidationRules()),
  searchCustomers
);

router.get(
  "/", 
  isAuthenticated,
  validate(customerQueryValidationRules()),
  getAllCustomers
);

router.get(
  "/customerID/:customerID",
  isAuthenticated,
  validate(customerIDValidationRules()),
  getCustomerByCustomerID
);

router.get("/email/:email", isAuthenticated, getCustomerByEmail);

router.get(
  "/:customer_Id",
  isAuthenticated,
  validate(customer_IdValidationRules()),
  getCustomerById
);

// Create/Update operations - restricted to roles that manage customers
router.post(
  "/",
  isAuthenticated,
  authorize(['ADMIN', 'MANAGER', 'SUPERVISOR']),
  validate(customerCreateValidationRules()),
  createCustomer
);

router.put(
  "/:customer_Id",
  isAuthenticated,
  authorize(['ADMIN', 'MANAGER', 'SUPERVISOR']),
  validate(customer_IdValidationRules()),
  validate(customerUpdateValidationRules()),
  updateCustomerById
);

// Delete operations - highly restricted to admin role only
router.delete(
  "/:customer_Id",
  isAuthenticated,
  authorize('ADMIN'),
  validate(customer_IdValidationRules()),
  deleteCustomerById
);

router.delete(
  "/", 
  isAuthenticated,
  authorize('ADMIN'), 
  deleteAllCustomers
);

module.exports = router;
