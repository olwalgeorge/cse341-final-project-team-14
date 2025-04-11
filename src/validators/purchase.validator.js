const { check, param, oneOf, body } = require("express-validator");

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
      .isMongoId()
      .withMessage("Invalid MongoDB ID format"),
  ];
};

const supplierIdValidationRules = () => {
  return [
    param("supplierId")
      .isMongoId()
      .withMessage("Invalid supplier ID format"),
  ];
};

const purchaseStatusValidationRules = () => {
  return [
    param("status")
      .isIn(["Pending", "Ordered", "Received", "Cancelled", "Returned"])
      .withMessage("Invalid purchase status"),
  ];
};

const purchaseCreateValidationRules = () => {
  return [
    check("supplier")
      .notEmpty()
      .withMessage("Supplier ID is required")
      .isMongoId()
      .withMessage("Invalid supplier ID format"),
    
    oneOf([
      // Validate items array format
      [
        check("items")
          .isArray({ min: 1 })
          .withMessage("At least one item is required"),
        check("items.*.product")
          .notEmpty()
          .withMessage("Product ID is required")
          .isMongoId()
          .withMessage("Invalid product ID format"),
        check("items.*.quantity")
          .isInt({ min: 1 })
          .withMessage("Quantity must be at least 1"),
        check("items.*.price")
          .isFloat({ min: 0 })
          .withMessage("Price must be a positive number"),
      ],
    ], "Purchase must contain 'items' array with at least one item"),

    check("totalAmount")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Total amount must be a positive number"),
    
    check("purchaseDate")
      .optional()
      .isISO8601()
      .toDate()
      .withMessage("Purchase date must be a valid date"),
    
    check("status")
      .optional()
      .isIn(["Pending", "Ordered", "Received", "Cancelled", "Returned"])
      .withMessage("Invalid purchase status"),
    
    check("paymentStatus")
      .optional()
      .isIn(["Unpaid", "Partially_paid", "Paid"])
      .withMessage("Invalid payment status"),
    
    check("paymentDue")
      .optional()
      .isISO8601()
      .toDate()
      .withMessage("Payment due date must be a valid date"),
    
    check("notes")
      .optional()
      .isString()
      .withMessage("Notes must be a string")
      .isLength({ max: 1000 })
      .withMessage("Notes cannot exceed 1000 characters"),
  ];
};

const purchaseUpdateValidationRules = () => {
  return [
    oneOf([
      // Optional items array
      [
        check("items").optional().isArray().withMessage("Items must be an array"),
        check("items.*.product")
          .optional()
          .isMongoId()
          .withMessage("Invalid product ID format"),
        check("items.*.quantity")
          .optional()
          .isInt({ min: 1 })
          .withMessage("Quantity must be at least 1"),
        check("items.*.price")
          .optional()
          .isFloat({ min: 0 })
          .withMessage("Price must be a positive number"),
      ],
      // Neither is provided (other fields being updated)
      [
        body().custom((body) => {
          return !body.items;
        }),
      ],
    ], "If updating items, use valid format"),
    
    check("supplier")
      .optional()
      .isMongoId()
      .withMessage("Invalid supplier ID format"),
    
    check("totalAmount")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Total amount must be a positive number"),
    
    check("purchaseDate")
      .optional()
      .isISO8601()
      .toDate()
      .withMessage("Purchase date must be a valid date"),
    
    check("status")
      .optional()
      .isIn(["Pending", "Ordered", "Received", "Cancelled", "Returned"])
      .withMessage("Invalid purchase status"),
    
    check("paymentStatus")
      .optional()
      .isIn(["Unpaid", "Partially_paid", "Paid"])
      .withMessage("Invalid payment status"),
    
    check("paymentDue")
      .optional()
      .isISO8601()
      .toDate()
      .withMessage("Payment due date must be a valid date"),
    
    check("notes")
      .optional()
      .isString()
      .withMessage("Notes must be a string")
      .isLength({ max: 1000 })
      .withMessage("Notes cannot exceed 1000 characters"),
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
