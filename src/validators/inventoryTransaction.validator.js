const { check, param } = require("express-validator");

/**
 * Validation for transaction MongoDB ID in route params
 */
const transaction_IdValidationRules = () => {
  return [
    param("transaction_Id")
      .notEmpty()
      .withMessage("Transaction ID is required")
      .isMongoId()
      .withMessage("Invalid Transaction ID format")
  ];
};

/**
 * Validation for transaction ID (IT-XXXXX format) in route params
 */
const transactionIDValidationRules = () => {
  return [
    param("transactionID")
      .notEmpty()
      .withMessage("Transaction ID is required")
      .matches(/^IT-\d{5}$/)
      .withMessage("Transaction ID must be in the format IT-XXXXX where X is a digit")
  ];
};

/**
 * Validation for product ID in route params
 */
const productIdValidationRules = () => {
  return [
    param("productId")
      .notEmpty()
      .withMessage("Product ID is required")
      .isMongoId()
      .withMessage("Invalid Product ID format")
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
 * Validation for transaction type in route params
 */
const transactionTypeValidationRules = () => {
  return [
    param("transactionType")
      .notEmpty()
      .withMessage("Transaction type is required")
      .isIn([
        "Adjustment", 
        "Purchase", 
        "Sale", 
        "Return", 
        "Transfer In", 
        "Transfer Out", 
        "Damaged",
        "Expired",
        "Initial"
      ])
      .withMessage("Invalid transaction type. Must be one of: Adjustment, Purchase, Sale, Return, Transfer In, Transfer Out, Damaged, Expired, Initial")
  ];
};

/**
 * Validation for creating a new transaction
 */
const createTransactionValidationRules = () => {
  return [
    check("inventory")
      .optional()  // Made optional as it might be auto-populated
      .isMongoId()
      .withMessage("Invalid Inventory ID format"),
    
    check("product")
      .notEmpty()
      .withMessage("Product is required")
      .isMongoId()
      .withMessage("Invalid Product ID format"),
    
    check("warehouse")
      .notEmpty()
      .withMessage("Warehouse is required")
      .isMongoId()
      .withMessage("Invalid Warehouse ID format"),
      
    check("transactionType")
      .notEmpty()
      .withMessage("Transaction type is required")
      .isIn([
        "Adjustment", 
        "Purchase", 
        "Sale", 
        "Return", 
        "Transfer In", 
        "Transfer Out", 
        "Damaged",
        "Expired",
        "Initial"
      ])
      .withMessage("Invalid transaction type"),
      
    check("quantityBefore")
      .optional()  // Can be auto-populated from current inventory
      .isNumeric()
      .withMessage("Previous quantity must be a number")
      .custom((value) => value >= 0)
      .withMessage("Previous quantity cannot be negative"),
    
    check("quantityChange")
      .notEmpty()
      .withMessage("Quantity change is required")
      .isNumeric()
      .withMessage("Quantity change must be a number")
      .custom((value, { req }) => {
        // Specific validation based on transaction type
        const type = req.body.transactionType;
        
        if (value === 0) {
          throw new Error("Quantity change cannot be zero");
        }
        
        // Sale, Transfer Out, Damaged, and Expired should have negative quantity change
        if (["Sale", "Transfer Out", "Damaged", "Expired"].includes(type) && Number(value) > 0) {
          throw new Error(`${type} transactions must have a negative quantity change`);
        }
        
        // Purchase, Transfer In, Initial should have positive quantity change
        if (["Purchase", "Transfer In", "Initial"].includes(type) && Number(value) < 0) {
          throw new Error(`${type} transactions must have a positive quantity change`);
        }
        
        return true;
      }),
      
    check("quantityAfter")
      .optional()  // Can be calculated
      .isNumeric()
      .withMessage("New quantity must be a number")
      .custom((value) => value >= 0)
      .withMessage("New quantity cannot be negative"),
      
    // Reference validation (optional but structured if provided)
    check("reference")
      .optional()
      .custom((value, { req }) => {
        if (value) {
          // If reference is provided, validate its structure
          if (typeof value !== 'object') {
            throw new Error("Reference must be an object");
          }
          
          // Custom validation based on transaction type
          const type = req.body.transactionType;
          
          // Check if reference is appropriate for the transaction type
          if (type === "Purchase" && value.documentType !== "Purchase") {
            throw new Error("Purchase transactions must reference a Purchase document");
          }
          
          if (type === "Sale" && value.documentType !== "Order") {
            throw new Error("Sale transactions must reference an Order document");
          }
        }
        return true;
      }),
      
    check("reference.documentType")
      .optional()
      .isIn(["Purchase", "Order", "Adjustment", "Transfer", "Return"])
      .withMessage("Invalid document type. Must be one of: Purchase, Order, Adjustment, Transfer, Return"),
      
    check("reference.documentId")
      .optional()
      .isMongoId()
      .withMessage("Document ID must be a valid MongoDB ID"),
      
    check("reference.documentCode")
      .optional()
      .isString()
      .withMessage("Document code must be a string")
      .isLength({ min: 3, max: 20 })
      .withMessage("Document code must be between 3 and 20 characters"),
      
    // Warehouse validations for transfers
    check("fromWarehouse")
      .custom((value, { req }) => {
        if (req.body.transactionType === "Transfer Out" && !value) {
          throw new Error("From warehouse is required for Transfer Out transactions");
        }
        if (value && !value.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("From warehouse must be a valid MongoDB ID");
        }
        return true;
      }),
      
    check("toWarehouse")
      .custom((value, { req }) => {
        if (req.body.transactionType === "Transfer In" && !value) {
          throw new Error("To warehouse is required for Transfer In transactions");
        }
        if (value && !value.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("To warehouse must be a valid MongoDB ID");
        }
        return true;
      }),
      
    check("toWarehouse")
      .custom((value, { req }) => {
        if (value && req.body.fromWarehouse && value === req.body.fromWarehouse) {
          throw new Error("From and To warehouses cannot be the same");
        }
        return true;
      }),
      
    check("notes")
      .optional()
      .isString()
      .withMessage("Notes must be a string")
      .isLength({ max: 500 })
      .withMessage("Notes cannot exceed 500 characters"),
      
    check("transactionDate")
      .optional()
      .isISO8601()
      .withMessage("Transaction date must be a valid ISO 8601 date")
      .custom((value) => {
        const transactionDate = new Date(value);
        const now = new Date();
        if (transactionDate > now) {
          throw new Error("Transaction date cannot be in the future");
        }
        return true;
      })
  ];
};

module.exports = {
  transaction_IdValidationRules,
  transactionIDValidationRules,
  productIdValidationRules,
  warehouseIdValidationRules,
  transactionTypeValidationRules,
  createTransactionValidationRules
};
