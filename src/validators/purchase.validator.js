const { check, param } = require("express-validator");
const mongoose = require("mongoose");

const purchaseIDValidationRules = () => {
  return [
    param("purchaseID", "Purchase ID should be in the format PU-xxxxx").matches(
      /^PU-\d{5}$/
    ),
  ];
};

const purchase_IdValidationRules = () => {
  return [
    check("_id")
      .custom((value) => mongoose.Types.ObjectId.isValid(value))
      .withMessage("Invalid MongoDB ID format"),
  ];
};

const supplierIdValidationRules = () => {
  return [
    param("supplierId")
      .custom((value) => mongoose.Types.ObjectId.isValid(value))
      .withMessage("Invalid supplier ID format"),
  ];
};

const purchaseStatusValidationRules = () => {
  return [
    param("status")
      .isIn(["pending", "ordered", "received", "cancelled", "returned"])
      .withMessage("Invalid purchase status"),
  ];
};

const purchaseCreateValidationRules = () => {
  return [
    check("supplier")
      .notEmpty()
      .withMessage("Supplier ID is required")
      .custom((value) => mongoose.Types.ObjectId.isValid(value))
      .withMessage("Invalid supplier ID format"),
    check("items")
      .isArray({ min: 1 })
      .withMessage("At least one item is required"),
    check("items.*.product")
      .notEmpty()
      .withMessage("Product ID is required")
      .custom((value) => mongoose.Types.ObjectId.isValid(value))
      .withMessage("Invalid product ID format"),
    check("items.*.quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
    check("items.*.price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    check("totalAmount")
      .isFloat({ min: 0 })
      .withMessage("Total amount must be a positive number"),
    check("status")
      .optional()
      .isIn(["pending", "ordered", "received", "cancelled", "returned"])
      .withMessage("Invalid purchase status"),
    check("paymentStatus")
      .optional()
      .isIn(["unpaid", "partially_paid", "paid"])
      .withMessage("Invalid payment status"),
    check("paymentDue")
      .optional()
      .isISO8601()
      .withMessage("Invalid date format for payment due date"),
  ];
};

const purchaseUpdateValidationRules = () => {
  return [
    check("supplier")
      .optional()
      .custom((value) => mongoose.Types.ObjectId.isValid(value))
      .withMessage("Invalid supplier ID format"),
    check("items").optional().isArray().withMessage("Items must be an array"),
    check("items.*.product")
      .optional()
      .custom((value) => mongoose.Types.ObjectId.isValid(value))
      .withMessage("Invalid product ID format"),
    check("items.*.quantity")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
    check("items.*.price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    check("totalAmount")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Total amount must be a positive number"),
    check("status")
      .optional()
      .isIn(["pending", "ordered", "received", "cancelled", "returned"])
      .withMessage("Invalid purchase status"),
    check("paymentStatus")
      .optional()
      .isIn(["unpaid", "partially_paid", "paid"])
      .withMessage("Invalid payment status"),
    check("paymentDue")
      .optional()
      .isISO8601()
      .withMessage("Invalid date format for payment due date"),
  ];
};

module.exports = {
  purchaseIDValidationRules,
  purchase_IdValidationRules,
  purchaseCreateValidationRules,
  purchaseUpdateValidationRules,
  supplierIdValidationRules,
  purchaseStatusValidationRules,
};
