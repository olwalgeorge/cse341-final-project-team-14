const express = require('express');
const router = express.Router();
const {
  getAllSuppliers,
  getSupplierById,
  getSupplierBySupplierID,
  createSupplier,
  updateSupplierById,
  deleteSupplierById,
  searchSuppliers,
  deleteAllSuppliers
} = require('../controllers/suppliers.controller.js');
const validate = require('../middlewares/validation.middleware.js');
const isAuthenticated = require('../middlewares/auth.middleware.js');
const {
  supplierIDValidationRules,
  supplier_IdValidationRules,
  supplierCreateValidationRules
} = require('../validators/supplier.validator.js');

// Public routes
router.get('/', getAllSuppliers);
router.get('/search', searchSuppliers);
router.get('/supplierID/:supplierID', validate(supplierIDValidationRules()), getSupplierBySupplierID);
router.get('/:_id', validate(supplier_IdValidationRules()), getSupplierById);

// Protected routes - require authentication
router.post('/', isAuthenticated, validate(supplierCreateValidationRules()), createSupplier);
router.put('/:_id', isAuthenticated, validate(supplier_IdValidationRules()), updateSupplierById);
router.delete('/:_id', isAuthenticated, validate(supplier_IdValidationRules()), deleteSupplierById);
router.delete('/', isAuthenticated, deleteAllSuppliers);

module.exports = router;
