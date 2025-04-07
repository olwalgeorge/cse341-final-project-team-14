const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middlewares/auth.middleware');
const {
    getAllOrders,
    getOrderById,
    getOrdersByCustomerId,
    createOrder,
    updateOrderById,
    deleteOrderById,
    deleteAllOrders
} = require('../controllers/orders.controller');

// Orders routes
router.get('/', isAuthenticated, getAllOrders);
router.get('/customer/:customerId', isAuthenticated, getOrdersByCustomerId);
router.get('/:_id', isAuthenticated, getOrderById);
router.post('/', isAuthenticated, createOrder);
router.put('/:_id', isAuthenticated, updateOrderById);
router.delete('/:_id', isAuthenticated, deleteOrderById);
router.delete('/', isAuthenticated, deleteAllOrders);

module.exports = router;
