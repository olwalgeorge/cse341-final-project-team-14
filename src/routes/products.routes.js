const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middlewares/auth.middleware');
const {
    getAllProducts,
    getProductById,
    getProductsByCategory,
    createProduct,
    updateProductById,
    deleteProductById,
    deleteAllProducts
} = require('../controllers/products.controller');

// Product routes
router.get('/', isAuthenticated, getAllProducts);
router.get('/category/:category', isAuthenticated, getProductsByCategory);  // Must come before :_id route
router.get('/:_id', isAuthenticated, getProductById);
router.post('/', isAuthenticated, createProduct);
router.put('/:_id', isAuthenticated, updateProductById);
router.delete('/:_id', isAuthenticated, deleteProductById);
router.delete('/', isAuthenticated, deleteAllProducts);

module.exports = router;
