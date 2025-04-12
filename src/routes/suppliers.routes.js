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
const {
  supplierIDValidationRules,
  supplierCreateValidationRules,
  supplierUpdateValidationRules,
  supplierMongoIdValidationRules, 
  supplierQueryValidationRules,
  supplierSearchValidationRules,
  supplierEmailValidationRules,
} = require("../validators/supplier.validator.js");

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

router.post(
  "/",
  isAuthenticated,
  validate(supplierCreateValidationRules()),
  createSupplier
);

router.put(
  "/:supplier_Id",
  isAuthenticated,
  validate(supplierMongoIdValidationRules()), 
  validate(supplierUpdateValidationRules()),
  updateSupplierById
);

router.delete(
  "/:supplier_Id",
  isAuthenticated,
  validate(supplierMongoIdValidationRules()), 
  deleteSupplierById
);

router.delete(
  "/", 
  isAuthenticated, 
  deleteAllSuppliers
);

module.exports = router;
