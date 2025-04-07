const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middlewares/auth.middleware');
const {
    getAllSuppliers,
    getSupplierById,
    getSupplierByName,
    createSupplier,
    updateSupplierById,
    deleteSupplierById,
    deleteAllSuppliers
} = require('../controllers/suppliers.controller');

// Routes should be ordered from most specific to least specific
router.get('/name/:name', isAuthenticated, getSupplierByName);
router.get('/:_id', isAuthenticated, getSupplierById);
router.get('/', isAuthenticated, getAllSuppliers);
router.post('/', isAuthenticated, createSupplier);
router.put('/:_id', isAuthenticated, updateSupplierById);
router.delete('/:_id', isAuthenticated, deleteSupplierById);
router.delete('/', isAuthenticated, deleteAllSuppliers);

module.exports = router;
