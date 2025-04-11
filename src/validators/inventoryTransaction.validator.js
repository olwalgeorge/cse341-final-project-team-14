const { check } = require("express-validator");

const transactionID_ValidationRules = () => {
  return [
    check("_id")
      .isMongoId()
      .withMessage("Invalid MongoDB ID format"),
  ];
};

const transactionIDValidationRules = () => {
  return [
    check("transactionID")
      .matches(/^IT-\d{5}$/)
      .withMessage("Transaction ID must be in the format IT-XXXXX"),
  ];
};

const productIdValidationRules = () => {
  return [
    check("productId")
      .isMongoId()
      .withMessage("Product ID must be a valid MongoDB ID"),
  ];
};

const warehouseIdValidationRules = () => {
  return [
    check("warehouseId")
      .isMongoId()
      .withMessage("Warehouse ID must be a valid MongoDB ID"),
  ];
};

const transactionTypeValidationRules = () => {
  return [
    check("transactionType")
      .isIn(["Purchase", "Sale", "Adjustment", "Transfer In", "Transfer Out", "Return", "Initial Stock"])
      .withMessage("Invalid transaction type"),
  ];
};

const inventoryTransactionCreateValidationRules = () => {
  return [
    check("inventory")
      .isMongoId()
      .withMessage("Inventory must be a valid MongoDB ID"),
    
    check("product")
      .isMongoId()
      .withMessage("Product must be a valid MongoDB ID"),
    
    check("warehouse")
      .isMongoId()
      .withMessage("Warehouse must be a valid MongoDB ID"),
    
    check("transactionType")
      .isIn(["Purchase", "Sale", "Adjustment", "Transfer In", "Transfer Out", "Return", "Initial Stock"])
      .withMessage("Invalid transaction type"),
    
    check("quantityBefore")
      .isNumeric()
      .withMessage("Previous quantity must be a number")
      .custom((value) => value >= 0)
      .withMessage("Previous quantity cannot be negative"),
    
    check("quantityChange")
      .isNumeric()
      .withMessage("Quantity change must be a number")
      .custom((value) => value !== 0)
      .withMessage("Quantity change cannot be zero"),
    
    check("quantityAfter")
      .optional()
      .isNumeric()
      .withMessage("New quantity must be a number")
      .custom((value) => value >= 0)
      .withMessage("New quantity cannot be negative"),
    
    check("reference.documentType")
      .optional()
      .isIn(["Purchase", "Order", "Adjustment", "Transfer", "Return", null])
      .withMessage("Invalid document type"),
    
    check("reference.documentId")
      .optional()
      .isMongoId()
      .withMessage("Document ID must be a valid MongoDB ID"),
    
    check("fromWarehouse")
      .optional()
      .isMongoId()
      .withMessage("From warehouse must be a valid MongoDB ID"),
    
    check("toWarehouse")
      .optional()
      .isMongoId()
      .withMessage("To warehouse must be a valid MongoDB ID"),
    
    check("notes")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Notes cannot exceed 500 characters"),
  ];
};

module.exports = {
  transactionID_ValidationRules,
  transactionIDValidationRules,
  productIdValidationRules,
  warehouseIdValidationRules,
  transactionTypeValidationRules,
  inventoryTransactionCreateValidationRules
};
