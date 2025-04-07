const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middlewares/auth.middleware');
const {
    getAllPurchases,
    getPurchaseById,
    createPurchase,
    updatePurchaseById,
    deletePurchaseById,
    deleteAllPurchases
} = require('../controllers/purchases.controller');

// Routes
router.get('/', isAuthenticated, getAllPurchases);
router.get('/:_id', isAuthenticated, getPurchaseById);
router.post('/', isAuthenticated, createPurchase);
router.put('/:_id', isAuthenticated, updatePurchaseById);
router.delete('/:_id', isAuthenticated, deletePurchaseById);
router.delete('/', isAuthenticated, deleteAllPurchases);

module.exports = router;
