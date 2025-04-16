const express = require("express");
const router = express.Router();
const {
  getAllSuppliers,
  getSupplierById,
  getSupplierBySupplierID,
  getSupplierByEmail,
  createSupplier,
  updateSupplierById,
  deleteSupplierById,
  deleteAllSuppliers,
  searchSuppliers,
} = require("../controllers/suppliers.controller.js");
const validate = require("../middlewares/validation.middleware.js");
const isAuthenticated = require("../middlewares/auth.middleware.js");
const { authorize } = require("../middlewares/auth.middleware.js");
const {
  supplierIDValidationRules,
  supplierCreateValidationRules,
  supplierUpdateValidationRules,
  supplierMongoIdValidationRules, 
  supplierQueryValidationRules,
  supplierSearchValidationRules,
  supplierEmailValidationRules,
} = require("../validators/supplier.validator.js");

// Read operations - Available to all authenticated users
router.get(
  "/search", 
  isAuthenticated,
  validate(supplierSearchValidationRules()),
  searchSuppliers
);

router.get(
  "/", 
  isAuthenticated,
  validate(supplierQueryValidationRules()),
  getAllSuppliers
);

router.get(
  "/supplierID/:supplierID",
  isAuthenticated,
  validate(supplierIDValidationRules()),
  getSupplierBySupplierID
);

router.get(
  "/email/:email", 
  isAuthenticated,
  validate(supplierEmailValidationRules()),
  getSupplierByEmail
);

router.get(
  "/:supplier_Id",
  isAuthenticated,
  validate(supplierMongoIdValidationRules()), 
  getSupplierById
);

// Create/Update operations - Restricted to management roles
router.post(
  "/",
  isAuthenticated,
  authorize(['ADMIN', 'MANAGER']),
  validate(supplierCreateValidationRules()),
  createSupplier
);

router.put(
  "/:supplier_Id",
  isAuthenticated,
  authorize(['ADMIN', 'MANAGER']),
  validate(supplierMongoIdValidationRules()), 
  validate(supplierUpdateValidationRules()),
  updateSupplierById
);

// Delete operations - Highly restricted to admin only
router.delete(
  "/:supplier_Id",
  isAuthenticated,
  authorize('ADMIN'),
  validate(supplierMongoIdValidationRules()), 
  deleteSupplierById
);

router.delete(
  "/", 
  isAuthenticated,
  authorize('ADMIN'), 
  deleteAllSuppliers
);

module.exports = router;
