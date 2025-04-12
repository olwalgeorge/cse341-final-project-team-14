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
const {
  customerIDValidationRules,
  customerCreateValidationRules,
  customerUpdateValidationRules,
  customer_IdValidationRules,
  customerQueryValidationRules,
  customerSearchValidationRules,
} = require("../validators/customer.validator.js");

// Add the search route
router.get(
  "/search", 
  isAuthenticated,
  validate(customerSearchValidationRules()),
  searchCustomers
);

// all routes are protected and require authentication
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

// Route to get customer by customer's MongoDB ID
router.get(
  "/:customer_Id",
  isAuthenticated,
  validate(customer_IdValidationRules()),
  getCustomerById
);
router.post(
  "/",
  isAuthenticated,
  validate(customerCreateValidationRules()),
  createCustomer
);

// Route to update customer by customer's MongoDB ID
router.put(
  "/:customer_Id",
  isAuthenticated,
  validate(customer_IdValidationRules()),
  validate(customerUpdateValidationRules()),
  updateCustomerById
);

// Route to delete customer by customer's MongoDB ID
router.delete(
  "/:customer_Id",
  isAuthenticated,
  validate(customer_IdValidationRules()),
  deleteCustomerById
);
router.delete("/", isAuthenticated, deleteAllCustomers);

module.exports = router;
