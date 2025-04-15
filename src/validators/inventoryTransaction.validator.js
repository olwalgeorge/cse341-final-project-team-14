const { body, param} = require("express-validator");

/**
 * Validates if the parameter is a valid date in YYYY-MM-DD format
 */
const isDateRule = (fieldName) => {
  return param(fieldName)
    .exists()
    .withMessage(`${fieldName} is required`)
    .isString()
    .withMessage(`${fieldName} must be a string`)
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage(`${fieldName} must be in YYYY-MM-DD format`)
    .custom((value) => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error(`${fieldName} is not a valid date`);
      }
      return true;
    });
};

/**
 * Validates transaction MongoDB ID format
 */
const transaction_IdValidationRules = () => {
  return [
    param("transaction_Id")
      .exists()
      .withMessage("Transaction ID is required")
      .isString()
      .withMessage("Transaction ID must be a string")
      .isMongoId()
      .withMessage("Invalid transaction ID format")
  ];
};

/**
 * Validates transaction ID format (IT-XXXXX)
 */
const transactionIDValidationRules = () => {
  return [
    param("transactionID")
      .exists()
      .withMessage("Transaction ID is required")
      .isString()
      .withMessage("Transaction ID must be a string")
      .matches(/^IT-\d{5}$/)
      .withMessage("Transaction ID must be in the format IT-XXXXX where X is a digit")
  ];
};

/**
 * Validates product ID format
 */
const productIdValidationRules = () => {
  return [
    param("productId")
      .exists()
      .withMessage("Product ID is required")
      .isString()
      .withMessage("Product ID must be a string")
      .isMongoId()
      .withMessage("Invalid product ID format")
  ];
};

/**
 * Validates warehouse ID format
 */
const warehouseIdValidationRules = () => {
  return [
    param("warehouseId")
      .exists()
      .withMessage("Warehouse ID is required")
      .isString()
      .withMessage("Warehouse ID must be a string")
      .isMongoId()
      .withMessage("Invalid warehouse ID format")
  ];
};

/**
 * Validates transaction type
 */
const transactionTypeValidationRules = () => {
  const validTypes = ['Inbound', 'Outbound', 'Adjustment', 'Transfer In', 'Transfer Out', 'Return'];
  
  return [
    param("transactionType")
      .exists()
      .withMessage("Transaction type is required")
      .isString()
      .withMessage("Transaction type must be a string")
      .isIn(validTypes)
      .withMessage(`Transaction type must be one of: ${validTypes.join(', ')}`)
  ];
};

/**
 * Validates date range parameters
 */
const dateRangeValidationRules = () => {
  return [
    isDateRule("startDate"),
    isDateRule("endDate"),
    param()
      .custom((value) => {
        const startDate = new Date(value.startDate);
        const endDate = new Date(value.endDate);
        
        if (startDate > endDate) {
          throw new Error("Start date must be before or equal to end date");
        }
        return true;
      })
  ];
};

/**
 * Validates reference data
 */
const referenceValidationRules = () => {
  const validReferenceTypes = ['Order', 'Transfer', 'Adjustment', 'Return', 'Manual'];
  
  return [
    param("referenceType")
      .exists()
      .withMessage("Reference type is required")
      .isString()
      .withMessage("Reference type must be a string")
      .isIn(validReferenceTypes)
      .withMessage(`Reference type must be one of: ${validReferenceTypes.join(', ')}`),
      
    param("referenceId")
      .exists()
      .withMessage("Reference ID is required")
      .isString()
      .withMessage("Reference ID must be a string")
      .custom((value, { req }) => {
        // If referenceType is Manual, we don't need to validate as MongoId
        if (req.params.referenceType !== 'Manual' && !value.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("Invalid reference ID format");
        }
        return true;
      })
  ];
};

/**
 * Validates transaction creation data
 */
const createTransactionValidationRules = () => {
  const validTypes = ['Inbound', 'Outbound', 'Adjustment', 'Transfer In', 'Transfer Out', 'Return'];
  
  return [
    body("warehouse")
      .exists()
      .withMessage("Warehouse is required")
      .isMongoId()
      .withMessage("Invalid warehouse ID format"),
      
    body("product")
      .exists()
      .withMessage("Product is required")
      .isMongoId()
      .withMessage("Invalid product ID format"),
      
    body("type")
      .exists()
      .withMessage("Transaction type is required")
      .isString()
      .withMessage("Transaction type must be a string")
      .isIn(validTypes)
      .withMessage(`Transaction type must be one of: ${validTypes.join(', ')}`),
      
    body("quantity")
      .exists()
      .withMessage("Quantity is required")
      .isNumeric()
      .withMessage("Quantity must be a number"),
      
    body("referenceType")
      .optional()
      .isString()
      .withMessage("Reference type must be a string")
      .isIn(['Order', 'Transfer', 'Adjustment', 'Return', 'Manual'])
      .withMessage("Invalid reference type"),
      
    body("referenceId")
      .optional()
      .isString()
      .withMessage("Reference ID must be a string")
      .custom((value, { req }) => {
        // If referenceType is Manual, we don't need to validate as MongoId
        if (req.body.referenceType && 
            req.body.referenceType !== 'Manual' && 
            !value.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("Invalid reference ID format");
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
  dateRangeValidationRules,
  referenceValidationRules,
  createTransactionValidationRules,
  isDateRule
};
