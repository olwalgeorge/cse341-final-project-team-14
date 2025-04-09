const express = require("express");
const router = express.Router();
const {
  getAllSuppliers,
  getSupplierById,
  getSupplierBySupplierID,
  getSupplierByName,
  createSupplier,
  updateSupplierById,
  deleteSupplierById,
  deleteAllSuppliers,
} = require("../controllers/suppliers.controller");
const validate = require("../middlewares/validation.middleware");
const isAuthenticated = require("../middlewares/auth.middleware");
const {
  supplierIDValidationRules,
  supplierMongoIdValidationRules,
  supplierUpdateValidationRules,
} = require("../validators/supplier.validator");

// all routes are protected and require authentication
router.get("/", isAuthenticated, getAllSuppliers);
router.get(
  "/supplierID/:supplierID",
  isAuthenticated,
  validate(supplierIDValidationRules()),
  getSupplierBySupplierID
);
router.get("/name/:name", isAuthenticated, getSupplierByName);
router.get(
  "/:supplier_Id",
  isAuthenticated,
  validate(supplierMongoIdValidationRules()),
  getSupplierById
);
router.post("/", isAuthenticated, createSupplier);
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
router.delete("/", isAuthenticated, deleteAllSuppliers);

module.exports = router;
