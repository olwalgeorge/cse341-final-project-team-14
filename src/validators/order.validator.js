const { body, param, query } = require("express-validator");

/**
 * Validates order MongoDB ID format
 */
const orderIdValidationRules = () => {
  return [
    param("order_Id")
      .exists()
      .withMessage("Order ID is required")
      .isString()
      .withMessage("Order ID must be a string")
      .isMongoId()
      .withMessage("Invalid order ID format")
  ];
};

/**
 * Validates order ID format (OR-XXXXX)
 */
const orderIDFormatValidationRules = () => {
  return [
    param("orderID")
      .exists()
      .withMessage("Order ID is required")
      .isString()
      .withMessage("Order ID must be a string")
      .matches(/^OR-\d{5}$/)
      .withMessage("Order ID must be in the format OR-XXXXX where X is a digit")
  ];
};

/**
 * Validates customer ID format
 */
const customerIdValidationRules = () => {
  return [
    param("customerId")
      .exists()
      .withMessage("Customer ID is required")
      .isString()
      .withMessage("Customer ID must be a string")
      .isMongoId()
      .withMessage("Invalid customer ID format")
  ];
};

/**
 * Validates order status
 */
const statusValidationRules = () => {
  const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Completed', 'Cancelled'];
  
  return [
    param("status")
      .exists()
      .withMessage("Status is required")
      .isString()
      .withMessage("Status must be a string")
      .isIn(validStatuses)
      .withMessage(`Status must be one of: ${validStatuses.join(', ')}`)
  ];
};

/**
 * Validates date range parameters
 */
const dateRangeValidationRules = () => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  
  return [
    query("fromDate")
      .exists()
      .withMessage("From date is required")
      .isString()
      .withMessage("From date must be a string")
      .matches(dateRegex)
      .withMessage("From date must be in YYYY-MM-DD format")
      .custom((value) => {
        if (isNaN(Date.parse(value))) {
          throw new Error("From date is invalid");
        }
        return true;
      }),
      
    query("toDate")
      .exists()
      .withMessage("To date is required")
      .isString()
      .withMessage("To date must be a string")
      .matches(dateRegex)
      .withMessage("To date must be in YYYY-MM-DD format")
      .custom((value) => {
        if (isNaN(Date.parse(value))) {
          throw new Error("To date is invalid");
        }
        return true;
      }),
      
    query()
      .custom((value) => {
        const fromDate = new Date(value.fromDate);
        const toDate = new Date(value.toDate);
        
        if (fromDate > toDate) {
          throw new Error("From date must be before or equal to to date");
        }
        return true;
      })
  ];
};

/**
 * Validates order creation data
 */
const createOrderValidationRules = () => {
  return [
    body("customer")
      .exists()
      .withMessage("Customer is required")
      .custom(value => {
        if (typeof value === 'string') {
          // Only validate if it's a string (ID reference)
          return body("customer").isMongoId().withMessage("Invalid customer ID format").run(value);
        }
        return true;
      }),
      
    body("items")
      .optional()
      .isArray()
      .withMessage("Items must be an array"),
      
    body("items.*.product")
      .optional()
      .isMongoId()
      .withMessage("Invalid product ID format"),
      
    body("items.*.quantity")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Quantity must be a positive integer"),
      
    body("products")
      .optional()
      .isArray()
      .withMessage("Products must be an array"),
      
    body("products.*.product")
      .optional()
      .isMongoId()
      .withMessage("Invalid product ID format"),
      
    body("products.*.quantity")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Quantity must be a positive integer"),
    
    body()
      .custom((value) => {
        if (!value.items && !value.products) {
          throw new Error("Either items or products array must be provided");
        }
        
        if (value.items && value.items.length === 0) {
          throw new Error("Items array cannot be empty");
        }
        
        if (value.products && value.products.length === 0) {
          throw new Error("Products array cannot be empty");
        }
        
        return true;
      })
  ];
};

/**
 * Validates order update data
 */
const updateOrderValidationRules = () => {
  const validStatuses = ['Pending', 'Processing', 'Cancelled'];
  
  return [
    body("status")
      .optional()
      .isString()
      .withMessage("Status must be a string")
      .isIn(validStatuses)
      .withMessage(`Status must be one of: ${validStatuses.join(', ')}`),
      
    body("items")
      .optional()
      .isArray()
      .withMessage("Items must be an array"),
      
    body("items.*.product")
      .optional()
      .isMongoId()
      .withMessage("Invalid product ID format"),
      
    body("items.*.quantity")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Quantity must be a positive integer"),
      
    body("products")
      .optional()
      .isArray()
      .withMessage("Products must be an array"),
      
    body("products.*.product")
      .optional()
      .isMongoId()
      .withMessage("Invalid product ID format"),
      
    body("products.*.quantity")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Quantity must be a positive integer")
  ];
};

/**
 * Validates cancellation data
 */
const cancelOrderValidationRules = () => {
  return [
    body("cancellationReason")
      .exists()
      .withMessage("Cancellation reason is required")
      .isString()
      .withMessage("Cancellation reason must be a string")
      .trim()
      .notEmpty()
      .withMessage("Cancellation reason cannot be empty")
      .isLength({ min: 3, max: 200 })
      .withMessage("Cancellation reason must be between 3 and 200 characters")
  ];
};

module.exports = {
  orderIdValidationRules,
  orderIDFormatValidationRules,
  customerIdValidationRules,
  statusValidationRules,
  dateRangeValidationRules,
  createOrderValidationRules,
  updateOrderValidationRules,
  cancelOrderValidationRules
};
