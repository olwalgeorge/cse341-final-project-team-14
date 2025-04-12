const { check, param } = require("express-validator");

/**
 * Validation for adjustment MongoDB ID in route params
 */
const adjustment_IdValidationRules = () => {
  return [
    param("adjustment_Id")
      .notEmpty()
      .withMessage("Adjustment ID is required")
      .isMongoId()
      .withMessage("Invalid Adjustment ID format")
  ];
};

/**
 * Validation for adjustment ID (ADJ-XXXXX format) in route params
 */
const adjustmentIDValidationRules = () => {
  return [
    param("adjustmentID")
      .notEmpty()
      .withMessage("Adjustment ID is required")
      .matches(/^ADJ-\d{5}$/)
      .withMessage("Adjustment ID must be in the format ADJ-XXXXX where X is a digit")
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
 * Validation for reason in route params
 */
const reasonValidationRules = () => {
  return [
    param("reason")
      .notEmpty()
      .withMessage("Reason is required")
      .isIn([
        "Physical Count",
        "Damaged Goods",
        "Expired Goods",
        "System Correction",
        "Quality Control", 
        "Lost Items",
        "Found Items",
        "Initial Setup",
        "Other"
      ])
      .withMessage("Invalid reason. Must be one of: Physical Count, Damaged Goods, Expired Goods, System Correction, Quality Control, Lost Items, Found Items, Initial Setup, Other")
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
      .isIn(["Draft", "Pending Approval", "Approved", "Completed", "Cancelled"])
      .withMessage("Invalid status. Must be one of: Draft, Pending Approval, Approved, Completed, Cancelled")
  ];
};

/**
 * Validation for creating a new adjustment
 */
const createAdjustmentValidationRules = () => {
  return [
    check("adjustmentID")
      .optional()
      .matches(/^ADJ-\d{5}$/)
      .withMessage("Adjustment ID must be in the format ADJ-XXXXX where X is a digit"),
    
    check("warehouse")
      .notEmpty()
      .withMessage("Warehouse is required")
      .isMongoId()
      .withMessage("Invalid warehouse ID format"),
    
    check("reason")
      .notEmpty()
      .withMessage("Reason is required")
      .isIn([
        "Physical Count",
        "Damaged Goods",
        "Expired Goods",
        "System Correction",
        "Quality Control", 
        "Lost Items",
        "Found Items",
        "Initial Setup",
        "Other"
      ])
      .withMessage("Invalid reason"),
    
    check("description")
      .optional()
      .isString()
      .withMessage("Description must be a string")
      .isLength({ max: 500 })
      .withMessage("Description cannot exceed 500 characters"),
    
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
    
    check("items.*.quantityBefore")
      .notEmpty()
      .withMessage("Previous quantity is required for each item")
      .isInt({ min: 0 })
      .withMessage("Previous quantity cannot be negative"),
    
    check("items.*.quantityAfter")
      .notEmpty()
      .withMessage("New quantity is required for each item")
      .isInt({ min: 0 })
      .withMessage("New quantity cannot be negative"),
    
    check("items.*.reason")
      .optional()
      .isString()
      .withMessage("Reason must be a string"),
    
    check("adjustmentDate")
      .optional()
      .isISO8601()
      .withMessage("Adjustment date must be a valid ISO 8601 date")
      .custom(value => {
        return new Date(value) <= new Date();
      })
      .withMessage("Adjustment date cannot be in the future"),
    
    check("status")
      .optional()
      .isIn(["Draft", "Pending Approval"])
      .withMessage("Status for new adjustments must be Draft or Pending Approval")
  ];
};

/**
 * Validation for updating an existing adjustment
 */
const updateAdjustmentValidationRules = () => {
  return [
    check("warehouse")
      .optional()
      .isMongoId()
      .withMessage("Invalid warehouse ID format"),
    
    check("reason")
      .optional()
      .isIn([
        "Physical Count",
        "Damaged Goods",
        "Expired Goods",
        "System Correction",
        "Quality Control", 
        "Lost Items",
        "Found Items",
        "Initial Setup",
        "Other"
      ])
      .withMessage("Invalid reason"),
    
    check("description")
      .optional()
      .isString()
      .withMessage("Description must be a string")
      .isLength({ max: 500 })
      .withMessage("Description cannot exceed 500 characters"),
    
    check("items")
      .optional()
      .isArray()
      .withMessage("Items must be an array"),
    
    check("items.*.product")
      .optional()
      .isMongoId()
      .withMessage("Invalid product ID format"),
    
    check("items.*.quantityBefore")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Previous quantity cannot be negative"),
    
    check("items.*.quantityAfter")
      .optional()
      .isInt({ min: 0 })
      .withMessage("New quantity cannot be negative"),
    
    check("adjustmentDate")
      .optional()
      .isISO8601()
      .withMessage("Adjustment date must be a valid ISO 8601 date")
      .custom(value => {
        return new Date(value) <= new Date();
      })
      .withMessage("Adjustment date cannot be in the future"),
    
    check("status")
      .optional()
      .isIn(["Draft", "Pending Approval", "Approved", "Completed", "Cancelled"])
      .withMessage("Invalid status")
  ];
};

/**
 * Validation for approving an adjustment
 */
const approveAdjustmentValidationRules = () => {
  return [
    check("description")
      .optional()
      .isString()
      .withMessage("Description must be a string")
      .isLength({ max: 500 })
      .withMessage("Description cannot exceed 500 characters")
  ];
};

/**
 * Validation for completing an adjustment
 */
const completeAdjustmentValidationRules = () => {
  return [
    // No additional fields needed for completion
  ];
};

module.exports = {
  adjustment_IdValidationRules,
  adjustmentIDValidationRules,
  warehouseIdValidationRules,
  reasonValidationRules,
  statusValidationRules,
  createAdjustmentValidationRules,
  updateAdjustmentValidationRules,
  approveAdjustmentValidationRules,
  completeAdjustmentValidationRules
};
