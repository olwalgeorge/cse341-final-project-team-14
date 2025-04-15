const { body, param, query } = require("express-validator");

/**
 * Validates inventory MongoDB ID in route params
 */
const inventoryIdValidationRules = () => {
  return [
    param("inventory_Id")
      .exists()
      .withMessage("Inventory ID is required")
      .isMongoId()
      .withMessage("Invalid inventory ID format")
  ];
};

/**
 * Validates inventory ID format (IN-XXXXX)
 */
const inventoryIDFormatValidationRules = () => {
  return [
    param("inventoryID")
      .exists()
      .withMessage("Inventory ID is required")
      .matches(/^IN-\d{5}$/)
      .withMessage("Inventory ID must be in the format IN-XXXXX where X is a digit")
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
      .isMongoId()
      .withMessage("Invalid warehouse ID format")
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
      .isMongoId()
      .withMessage("Invalid product ID format")
  ];
};

/**
 * Validates stock status
 */
const stockStatusValidationRules = () => {
  const validStatuses = ['In Stock', 'Low Stock', 'Out of Stock'];
  
  return [
    param("stockStatus")
      .exists()
      .withMessage("Stock status is required")
      .isIn(validStatuses)
      .withMessage(`Stock status must be one of: ${validStatuses.join(', ')}`)
  ];
};

/**
 * Validates search term
 */
const searchValidationRules = () => {
  return [
    query("term")
      .exists()
      .withMessage("Search term is required")
      .isString()
      .withMessage("Search term must be a string")
      .trim()
      .notEmpty()
      .withMessage("Search term cannot be empty")
  ];
};

/**
 * Validates inventory creation/update data
 */
const createInventoryValidationRules = () => {
  return [
    body("product")
      .exists()
      .withMessage("Product is required")
      .isMongoId()
      .withMessage("Invalid product ID format"),
      
    body("warehouse")
      .exists()
      .withMessage("Warehouse is required")
      .isMongoId()
      .withMessage("Invalid warehouse ID format"),
      
    body("quantity")
      .exists()
      .withMessage("Quantity is required")
      .isInt({ min: 0 })
      .withMessage("Quantity must be a non-negative integer"),
      
    body("reorderPoint")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Reorder point must be a non-negative integer"),
      
    body("location.aisle")
      .optional()
      .isString()
      .withMessage("Aisle must be a string")
      .trim()
      .isLength({ max: 50 })
      .withMessage("Aisle cannot exceed 50 characters"),
      
    body("location.rack")
      .optional()
      .isString()
      .withMessage("Rack must be a string")
      .trim()
      .isLength({ max: 50 })
      .withMessage("Rack cannot exceed 50 characters"),
      
    body("location.bin")
      .optional()
      .isString()
      .withMessage("Bin must be a string")
      .trim()
      .isLength({ max: 50 })
      .withMessage("Bin cannot exceed 50 characters")
  ];
};

/**
 * Validates inventory adjustment data
 */
const adjustInventoryValidationRules = () => {
  return [
    body("product")
      .exists()
      .withMessage("Product is required")
      .isMongoId()
      .withMessage("Invalid product ID format"),
      
    body("warehouse")
      .exists()
      .withMessage("Warehouse is required")
      .isMongoId()
      .withMessage("Invalid warehouse ID format"),
      
    body("adjustmentQuantity")
      .exists()
      .withMessage("Adjustment quantity is required")
      .isNumeric()
      .withMessage("Adjustment quantity must be a number"),
      
    body("reason")
      .exists()
      .withMessage("Adjustment reason is required")
      .isString()
      .withMessage("Adjustment reason must be a string")
      .trim()
      .notEmpty()
      .withMessage("Adjustment reason cannot be empty")
      .isLength({ min: 3, max: 200 })
      .withMessage("Adjustment reason must be between 3 and 200 characters")
  ];
};

/**
 * Validates inventory transfer data
 */
const transferInventoryValidationRules = () => {
  return [
    body("product")
      .exists()
      .withMessage("Product is required")
      .isMongoId()
      .withMessage("Invalid product ID format"),
      
    body("sourceWarehouse")
      .exists()
      .withMessage("Source warehouse is required")
      .isMongoId()
      .withMessage("Invalid source warehouse ID format"),
      
    body("destinationWarehouse")
      .exists()
      .withMessage("Destination warehouse is required")
      .isMongoId()
      .withMessage("Invalid destination warehouse ID format"),
      
    body("quantity")
      .exists()
      .withMessage("Quantity is required")
      .isInt({ min: 1 })
      .withMessage("Quantity must be a positive integer"),
      
    body()
      .custom((value) => {
        if (value.sourceWarehouse === value.destinationWarehouse) {
          throw new Error("Source and destination warehouses must be different");
        }
        return true;
      })
  ];
};

module.exports = {
  inventoryIdValidationRules,
  inventoryIDFormatValidationRules,
  warehouseIdValidationRules,
  productIdValidationRules,
  stockStatusValidationRules,
  searchValidationRules,
  createInventoryValidationRules,
  adjustInventoryValidationRules,
  transferInventoryValidationRules
};
