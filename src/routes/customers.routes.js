const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middlewares/auth.middleware');
const {
    getAllCustomers,
    getCustomerByEmail,
    getCustomerById,
    createCustomer,
    updateCustomerById,
    deleteCustomerById,
    deleteAllCustomers
} = require('../controllers/customers.controller');

// Make sure specific routes come before generic routes with path parameters
router.get('/', isAuthenticated, getAllCustomers);
router.get('/email/:email', isAuthenticated, getCustomerByEmail);
router.get('/:_id', isAuthenticated, getCustomerById);
router.post('/', isAuthenticated, createCustomer);
router.put('/:_id', isAuthenticated, updateCustomerById);
router.delete('/:_id', isAuthenticated, deleteCustomerById);
router.delete('/', isAuthenticated, deleteAllCustomers);

module.exports = router;
