const { check, param } = require("express-validator");

/**
 * Validation for return MongoDB ID in route params
 */
const return_IdValidationRules = () => {
  return [
    param("return_Id")
      .notEmpty()
      .withMessage("Return ID is required")
      .isMongoId()
      .withMessage("Invalid Return ID format")
  ];
};

/**
 * Validation for return ID (RET-XXXXX format) in route params
 */
const returnIDValidationRules = () => {
  return [
    param("returnID")
      .notEmpty()
      .withMessage("Return ID is required")
      .matches(/^RET-\d{5}$/)
      .withMessage("Return ID must be in the format RET-XXXXX where X is a digit")
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
 * Validation for source type and source ID in route params
 */
const sourceValidationRules = () => {
  return [
    param("sourceType")
      .notEmpty()
      .withMessage("Source type is required")
      .isIn(["Customer", "Supplier", "Internal", "Other"])
      .withMessage("Invalid source type. Must be one of: Customer, Supplier, Internal, Other"),
    
    param("sourceId")
      .optional()
      .isMongoId()
      .withMessage("Invalid Source ID format")
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
      .isIn(["Draft", "Pending", "Approved", "In Progress", "Completed", "Rejected", "Cancelled"])
      .withMessage("Invalid status. Must be one of: Draft, Pending, Approved, In Progress, Completed, Rejected, Cancelled")
  ];
};

/**
 * Validation for creating a new return
 */
const createReturnValidationRules = () => {
  return [
    check("returnID")
      .optional()
      .matches(/^RET-\d{5}$/)
      .withMessage("Return ID must be in the format RET-XXXXX where X is a digit"),
    
    check("sourceType")
      .notEmpty()
      .withMessage("Source type is required")
      .isIn(["Customer", "Supplier", "Internal", "Other"])
      .withMessage("Invalid source type. Must be one of: Customer, Supplier, Internal, Other"),
    
    check("source.sourceId")
      .custom((value, { req }) => {
        if (req.body.sourceType !== "Other" && !value) {
          throw new Error("Source ID is required for this source type");
        }
        if (value && !value.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("Source ID must be a valid MongoDB ID");
        }
        return true;
      }),
    
    check("source.sourceName")
      .notEmpty()
      .withMessage("Source name is required")
      .isLength({ min: 2, max: 100 })
      .withMessage("Source name must be between 2 and 100 characters"),
    
    check("relatedDocument.documentType")
      .optional()
      .isIn(["Order", "Purchase", null])
      .withMessage("Invalid document type. Must be one of: Order, Purchase"),
    
    check("relatedDocument.documentId")
      .optional()
      .isMongoId()
      .withMessage("Document ID must be a valid MongoDB ID"),
    
    check("warehouse")
      .notEmpty()
      .withMessage("Warehouse is required")
      .isMongoId()
      .withMessage("Invalid warehouse ID format"),
    
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
    
    check("items.*.reason")
      .notEmpty()
      .withMessage("Reason is required for each item")
      .isIn([
        "Damaged Goods",
        "Wrong Item Shipped",
        "Quality Issue",
        "Customer Return",
        "Expired Product",
        "Recall",
        "Overstock",
        "Other"
      ])
      .withMessage("Invalid reason. Must be one of: Damaged Goods, Wrong Item Shipped, Quality Issue, Customer Return, Expired Product, Recall, Overstock, Other"),
    
    check("items.*.condition")
      .notEmpty()
      .withMessage("Condition is required for each item")
      .isIn(["New", "Used", "Damaged", "Expired", "Defective"])
      .withMessage("Invalid condition. Must be one of: New, Used, Damaged, Expired, Defective"),
    
    check("items.*.action")
      .notEmpty()
      .withMessage("Action is required for each item")
      .isIn(["Return to Stock", "Return to Supplier", "Dispose", "Repair", "Pending Inspection"])
      .withMessage("Invalid action. Must be one of: Return to Stock, Return to Supplier, Dispose, Repair, Pending Inspection"),
    
    check("status")
      .optional()
      .isIn(["Draft", "Pending"])
      .withMessage("Status for new returns must be Draft or Pending"),
    
    check("notes")
      .optional()
      .isString()
      .withMessage("Notes must be a string")
      .isLength({ max: 500 })
      .withMessage("Notes cannot exceed 500 characters")
  ];
};

/**
 * Validation for updating an existing return
 */
const updateReturnValidationRules = () => {
  return [
    check("sourceType")
      .optional()
      .isIn(["Customer", "Supplier", "Internal", "Other"])
      .withMessage("Invalid source type. Must be one of: Customer, Supplier, Internal, Other"),
    
    check("source.sourceId")
      .optional()
      .custom((value, { req }) => {
        if (req.body.sourceType && req.body.sourceType !== "Other" && !value) {
          throw new Error("Source ID is required for this source type");
        }
        if (value && !value.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("Source ID must be a valid MongoDB ID");
        }
        return true;
      }),
    
    check("source.sourceName")
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage("Source name must be between 2 and 100 characters"),
    
    check("warehouse")
      .optional()
      .isMongoId()
      .withMessage("Invalid warehouse ID format"),
    
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
    
    check("items.*.reason")
      .optional()
      .isIn([
        "Damaged Goods",
        "Wrong Item Shipped",
        "Quality Issue",
        "Customer Return",
        "Expired Product",
        "Recall",
        "Overstock",
        "Other"
      ])
      .withMessage("Invalid reason"),
    
    check("items.*.condition")
      .optional()
      .isIn(["New", "Used", "Damaged", "Expired", "Defective"])
      .withMessage("Invalid condition"),
    
    check("items.*.action")
      .optional()
      .isIn(["Return to Stock", "Return to Supplier", "Dispose", "Repair", "Pending Inspection"])
      .withMessage("Invalid action"),
    
    check("status")
      .optional()
      .isIn(["Draft", "Pending", "Approved", "In Progress", "Completed", "Rejected", "Cancelled"])
      .withMessage("Invalid status"),
    
    check("notes")
      .optional()
      .isString()
      .withMessage("Notes must be a string")
      .isLength({ max: 500 })
      .withMessage("Notes cannot exceed 500 characters")
  ];
};

/**
 * Validation for approving a return
 */
const approveReturnValidationRules = () => {
  return [
    check("notes")
      .optional()
      .isString()
      .withMessage("Notes must be a string")
      .isLength({ max: 500 })
      .withMessage("Notes cannot exceed 500 characters")
  ];
};

/**
 * Validation for processing a return
 */
const processReturnValidationRules = () => {
  return [
    check("notes")
      .optional()
      .isString()
      .withMessage("Notes must be a string")
      .isLength({ max: 500 })
      .withMessage("Notes cannot exceed 500 characters")
  ];
};

module.exports = {
  return_IdValidationRules,
  returnIDValidationRules,
  warehouseIdValidationRules,
  sourceValidationRules,
  statusValidationRules,
  createReturnValidationRules,
  updateReturnValidationRules,
  approveReturnValidationRules,
  processReturnValidationRules
};
