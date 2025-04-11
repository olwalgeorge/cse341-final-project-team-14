const { check, param } = require("express-validator");

const isMongoIdParam = (paramName, errorMessage) => {
  return param(paramName, errorMessage).isMongoId();
};

const purchaseIDValidationRules = () => {
  return [
    param("purchaseID", "Purchase ID should be in the format PU-xxxxx").matches(
      /^PU-\d{5}$/
    ),
  ];
};

const purchase_IdValidationRules = () => {
  return [isMongoIdParam("purchase_Id", "Invalid Purchase ID format")];
};

const supplierIdValidationRules = () => {
  return [isMongoIdParam("supplierId", "Invalid Supplier ID format")];
};

const purchaseStatusValidationRules = () => {
  return [
    param("status")
      .trim()
      .isIn(["Pending", "Ordered", "Received", "Cancelled", "Returned"])
      .withMessage("Invalid status. Must be one of: Pending, Ordered, Received, Cancelled, Returned"),
  ];
};

const purchaseCreateValidationRules = () => {
  return [
    check("supplier")
      .isMongoId()
      .withMessage("Invalid supplier ID"),
    check("items")
      .isArray({ min: 1 })
      .withMessage("At least one item is required"),
    check("items.*.product")
      .isMongoId()
      .withMessage("Invalid product ID"),
    check("items.*.quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
    check("items.*.price")
      .optional() // Price is optional
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    check("totalAmount")
      .optional() // Total amount optional as it's calculated
      .isFloat({ min: 0 })
      .withMessage("Total amount must be a positive number"),
    check("purchaseDate")
      .optional()
      .isISO8601()
      .withMessage("Invalid purchase date format"),
    check("status")
      .optional()
      .isIn(["Pending", "Ordered", "Received", "Cancelled", "Returned"])
      .withMessage("Invalid status"),
    check("paymentStatus")
      .optional()
      .isIn(["Unpaid", "Partially_paid", "Paid"])
      .withMessage("Invalid payment status"),
    check("paymentDue")
      .optional()
      .isISO8601()
      .withMessage("Invalid payment due date format"),
    check("notes")
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage("Notes cannot exceed 500 characters"),
  ];
};

const purchaseUpdateValidationRules = () => {
  return [
    check("supplier")
      .optional()
      .isMongoId()
      .withMessage("Invalid supplier ID"),
    check("items")
      .optional()
      .isArray()
      .withMessage("Items must be an array"),
    check("items.*.product")
      .optional()
      .isMongoId()
      .withMessage("Invalid product ID"),
    check("items.*.quantity")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
    check("items.*.price")
      .optional() // Price is optional
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    check("totalAmount")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Total amount must be a positive number"),
    check("purchaseDate")
      .optional()
      .isISO8601()
      .withMessage("Invalid purchase date format"),
    check("status")
      .optional()
      .isIn(["Pending", "Ordered", "Received", "Cancelled", "Returned"])
      .withMessage("Invalid status"),
    check("paymentStatus")
      .optional()
      .isIn(["Unpaid", "Partially_paid", "Paid"])
      .withMessage("Invalid payment status"),
    check("paymentDue")
      .optional()
      .isISO8601()
      .withMessage("Invalid payment due date format"),
    check("notes")
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage("Notes cannot exceed 500 characters"),
  ];
};

module.exports = {
  purchaseIDValidationRules,
  purchase_IdValidationRules,
  supplierIdValidationRules, 
  purchaseStatusValidationRules, 
  purchaseCreateValidationRules,
  purchaseUpdateValidationRules,
};
