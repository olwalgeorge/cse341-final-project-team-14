const { check, param } = require("express-validator");

/**
 * Validation for transfer MongoDB ID in route params
 */
const transfer_IdValidationRules = () => {
  return [
    param("transfer_Id")
      .notEmpty()
      .withMessage("Transfer ID is required")
      .isMongoId()
      .withMessage("Invalid Transfer ID format")
  ];
};

/**
 * Validation for transfer ID (TR-XXXXX format) in route params
 */
const transferIDValidationRules = () => {
  return [
    param("transferID")
      .notEmpty()
      .withMessage("Transfer ID is required")
      .matches(/^TR-\d{5}$/)
      .withMessage("Transfer ID must be in the format TR-XXXXX where X is a digit")
  ];
};

/**
 * Validation for warehouse ID in route params
 */
const warehouseIdValidationRules = () => {
  return [
    param("warehouseId")
      .notEmpty()
      .withMessage("Warehouse ID is required")
      .isMongoId()
      .withMessage("Invalid Warehouse ID format")
  ];
};

/**
 * Validation for status in route params
 */
const statusValidationRules = () => {
  return [
    param("status")
      .notEmpty()
      .withMessage("Status is required")
      .isIn(["Draft", "Pending", "Approved", "In Transit", "Partially Received", "Completed", "Cancelled"])
      .withMessage("Invalid status. Must be one of: Draft, Pending, Approved, In Transit, Partially Received, Completed, Cancelled")
  ];
};

/**
 * Validation for creating a new transfer
 */
const createTransferValidationRules = () => {
  return [
    check("transferID")
      .optional()
      .matches(/^TR-\d{5}$/)
      .withMessage("Transfer ID must be in the format TR-XXXXX where X is a digit"),
    
    check("fromWarehouse")
      .notEmpty()
      .withMessage("From warehouse is required")
      .isMongoId()
      .withMessage("Invalid from warehouse ID format"),
    
    check("toWarehouse")
      .notEmpty()
      .withMessage("To warehouse is required")
      .isMongoId()
      .withMessage("Invalid to warehouse ID format")
      .custom((value, { req }) => {
        if (value === req.body.fromWarehouse) {
          throw new Error("From and To warehouses cannot be the same");
        }
        return true;
      }),
    
    check("items")
      .notEmpty()
      .withMessage("At least one item is required")
      .isArray()
      .withMessage("Items must be an array"),
    
    check("items.*.product")
      .notEmpty()
      .withMessage("Product is required for each item")
      .isMongoId()
      .withMessage("Invalid product ID format"),
    
    check("items.*.quantity")
      .notEmpty()
      .withMessage("Quantity is required for each item")
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
    
    check("expectedDeliveryDate")
      .optional()
      .isISO8601()
      .withMessage("Expected delivery date must be a valid ISO 8601 date"),
    
    check("status")
      .optional()
      .isIn(["Draft", "Pending"])
      .withMessage("Status for new transfers must be Draft or Pending"),
    
    check("transportInfo.method")
      .optional()
      .isString()
      .withMessage("Transport method must be a string"),
    
    check("transportInfo.carrier")
      .optional()
      .isString()
      .withMessage("Carrier must be a string"),
    
    check("transportInfo.trackingNumber")
      .optional()
      .isString()
      .withMessage("Tracking number must be a string"),
    
    check("notes")
      .optional()
      .isString()
      .withMessage("Notes must be a string")
      .isLength({ max: 500 })
      .withMessage("Notes cannot exceed 500 characters")
  ];
};

/**
 * Validation for updating an existing transfer
 */
const updateTransferValidationRules = () => {
  return [
    check("fromWarehouse")
      .optional()
      .isMongoId()
      .withMessage("Invalid from warehouse ID format"),
    
    check("toWarehouse")
      .optional()
      .isMongoId()
      .withMessage("Invalid to warehouse ID format")
      .custom((value, { req }) => {
        if (value && req.body.fromWarehouse && value === req.body.fromWarehouse) {
          throw new Error("From and To warehouses cannot be the same");
        }
        return true;
      }),
    
    check("items")
      .optional()
      .isArray()
      .withMessage("Items must be an array"),
    
    check("items.*.product")
      .optional()
      .isMongoId()
      .withMessage("Invalid product ID format"),
    
    check("items.*.quantity")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
    
    check("expectedDeliveryDate")
      .optional()
      .isISO8601()
      .withMessage("Expected delivery date must be a valid ISO 8601 date"),
    
    check("status")
      .optional()
      .isIn(["Draft", "Pending", "Approved", "In Transit", "Partially Received", "Completed", "Cancelled"])
      .withMessage("Invalid status"),
    
    check("transportInfo.method")
      .optional()
      .isString()
      .withMessage("Transport method must be a string"),
    
    check("transportInfo.carrier")
      .optional()
      .isString()
      .withMessage("Carrier must be a string"),
    
    check("transportInfo.trackingNumber")
      .optional()
      .isString()
      .withMessage("Tracking number must be a string"),
    
    check("notes")
      .optional()
      .isString()
      .withMessage("Notes must be a string")
      .isLength({ max: 500 })
      .withMessage("Notes cannot exceed 500 characters")
  ];
};

/**
 * Validation for approving a transfer
 */
const approveTransferValidationRules = () => {
  return [
    check("expectedDeliveryDate")
      .optional()
      .isISO8601()
      .withMessage("Expected delivery date must be a valid ISO 8601 date"),
      
    check("notes")
      .optional()
      .isString()
      .withMessage("Notes must be a string")
      .isLength({ max: 500 })
      .withMessage("Notes cannot exceed 500 characters")
  ];
};

/**
 * Validation for shipping a transfer
 */
const shipTransferValidationRules = () => {
  return [
    check("transportInfo.method")
      .optional()
      .isString()
      .withMessage("Transport method must be a string"),
    
    check("transportInfo.carrier")
      .optional()
      .isString()
      .withMessage("Carrier must be a string"),
    
    check("transportInfo.trackingNumber")
      .optional()
      .isString()
      .withMessage("Tracking number must be a string"),
      
    check("notes")
      .optional()
      .isString()
      .withMessage("Notes must be a string")
      .isLength({ max: 500 })
      .withMessage("Notes cannot exceed 500 characters")
  ];
};

/**
 * Validation for receiving a transfer
 */
const receiveTransferValidationRules = () => {
  return [
    check("items")
      .notEmpty()
      .withMessage("At least one item is required")
      .isArray()
      .withMessage("Items must be an array"),
    
    check("items.*.product")
      .notEmpty()
      .withMessage("Product is required for each item")
      .isMongoId()
      .withMessage("Invalid product ID format"),
    
    check("items.*.receivedQuantity")
      .notEmpty()
      .withMessage("Received quantity is required for each item")
      .isInt({ min: 0 })
      .withMessage("Received quantity must be at least 0"),
      
    check("notes")
      .optional()
      .isString()
      .withMessage("Notes must be a string")
      .isLength({ max: 500 })
      .withMessage("Notes cannot exceed 500 characters")
  ];
};

module.exports = {
  transfer_IdValidationRules,
  transferIDValidationRules,
  warehouseIdValidationRules,
  statusValidationRules,
  createTransferValidationRules,
  updateTransferValidationRules,
  approveTransferValidationRules,
  shipTransferValidationRules,
  receiveTransferValidationRules
};
