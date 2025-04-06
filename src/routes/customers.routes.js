const express = require('express');
const router = express.Router();
const {
  getAllCustomers,
  getCustomerById,
  getCustomerByCustomerID,
  getCustomerByEmail,
  createCustomer,
  updateCustomerById,
  deleteCustomerById,
  searchCustomers,
  deleteAllCustomers
} = require('../controllers/customers.controller.js');
const validate = require('../middlewares/validation.middleware.js');
const isAuthenticated = require('../middlewares/auth.middleware.js');
const {
  customerIDValidationRules,
  customer_IdValidationRules,
  customerCreateValidationRules,
  customerUpdateValidationRules,
  emailValidationRules
} = require('../validators/customer.validator.js');

// All customer routes require authentication
router.get('/', isAuthenticated, getAllCustomers);
router.get('/search', isAuthenticated, searchCustomers);
router.get('/customerID/:customerID', isAuthenticated, validate(customerIDValidationRules()), getCustomerByCustomerID);
router.get('/email/:email', isAuthenticated, validate(emailValidationRules()), getCustomerByEmail);
router.get('/:_id', isAuthenticated, validate(customer_IdValidationRules()), getCustomerById);

router.post('/', isAuthenticated, validate(customerCreateValidationRules()), createCustomer);
router.put('/:_id', isAuthenticated, validate(customer_IdValidationRules()), validate(customerUpdateValidationRules()), updateCustomerById);
router.delete('/:_id', isAuthenticated, validate(customer_IdValidationRules()), deleteCustomerById);
router.delete('/', isAuthenticated, deleteAllCustomers);

module.exports = router;
