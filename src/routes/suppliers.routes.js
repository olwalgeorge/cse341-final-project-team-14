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
  supplier_IdValidationRules,
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
  "/:_id",
  isAuthenticated,
  validate(supplier_IdValidationRules()),
  getSupplierById
);
router.post("/", isAuthenticated, createSupplier);
router.put(
  "/:_id",
  isAuthenticated,
  validate(supplier_IdValidationRules()),
  validate(supplierUpdateValidationRules()),
  updateSupplierById
);
router.delete(
  "/:_id",
  isAuthenticated,
  validate(supplier_IdValidationRules()),
  deleteSupplierById
);
router.delete("/", isAuthenticated, deleteAllSuppliers);

module.exports = router;
