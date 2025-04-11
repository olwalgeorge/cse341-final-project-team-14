const { check, param } = require("express-validator");

const isMongoIdParam = (paramName, errorMessage) => {
  return param(paramName, errorMessage).isMongoId();
};

const inventoryIDValidationRules = () => {
  return [
    param("inventoryID", "Inventory ID should be in the format IN-xxxxx").matches(
      /^IN-\d{5}$/
    ),
  ];
};

const inventory_IdValidationRules = () => {
  return [isMongoIdParam("inventory_Id", "Invalid Inventory ID format")];
};

const warehouseIdValidationRules = () => {
  return [isMongoIdParam("warehouseId", "Invalid Warehouse ID format")];
};

const productIdValidationRules = () => {
  return [isMongoIdParam("productId", "Invalid Product ID format")];
};

const stockStatusValidationRules = () => {
  return [
    param("status")
      .trim()
      .isIn(["In Stock", "Low Stock", "Out of Stock", "Overstocked"])
      .withMessage("Invalid status. Must be one of: In Stock, Low Stock, Out of Stock, Overstocked"),
  ];
};

const inventoryCreateValidationRules = () => {
  return [
    check("product")
      .isMongoId()
      .withMessage("Product must be a valid MongoDB ID"),
    
    check("warehouse")
      .isMongoId()
      .withMessage("Warehouse must be a valid MongoDB ID"),
    
    check("quantity")
      .isNumeric()
      .withMessage("Quantity must be a number")
      .custom((value) => value >= 0)
      .withMessage("Quantity cannot be negative"),
    
    check("minStockLevel")
      .isNumeric()
      .withMessage("Minimum stock level must be a number")
      .custom((value) => value >= 0)
      .withMessage("Minimum stock level cannot be negative"),
    
    check("maxStockLevel")
      .isNumeric()
      .withMessage("Maximum stock level must be a number")
      .custom((value) => value >= 0)
      .withMessage("Maximum stock level cannot be negative")
      .custom((value, { req }) => {
        return value >= req.body.minStockLevel;
      })
      .withMessage("Maximum stock level must be greater than or equal to minimum stock level"),
    
    check("location.aisle")
      .optional()
      .isLength({ max: 10 })
      .withMessage("Aisle identifier cannot exceed 10 characters"),
    
    check("location.rack")
      .optional()
      .isLength({ max: 10 })
      .withMessage("Rack identifier cannot exceed 10 characters"),
    
    check("location.bin")
      .optional()
      .isLength({ max: 10 })
      .withMessage("Bin identifier cannot exceed 10 characters"),
    
    check("notes")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Notes cannot exceed 500 characters"),
  ];
};

const inventoryUpdateValidationRules = () => {
  return [
    check("product")
      .optional()
      .isMongoId()
      .withMessage("Product must be a valid MongoDB ID"),
    
    check("warehouse")
      .optional()
      .isMongoId()
      .withMessage("Warehouse must be a valid MongoDB ID"),
    
    check("quantity")
      .optional()
      .isNumeric()
      .withMessage("Quantity must be a number")
      .custom((value) => value >= 0)
      .withMessage("Quantity cannot be negative"),
    
    check("minStockLevel")
      .optional()
      .isNumeric()
      .withMessage("Minimum stock level must be a number")
      .custom((value) => value >= 0)
      .withMessage("Minimum stock level cannot be negative"),
    
    check("maxStockLevel")
      .optional()
      .isNumeric()
      .withMessage("Maximum stock level must be a number")
      .custom((value) => value >= 0)
      .withMessage("Maximum stock level cannot be negative")
      .custom((value, { req }) => {
        if (req.body.minStockLevel !== undefined) {
          return value >= req.body.minStockLevel;
        }
        return true;
      })
      .withMessage("Maximum stock level must be greater than or equal to minimum stock level"),
    
    check("location.aisle")
      .optional()
      .isLength({ max: 10 })
      .withMessage("Aisle identifier cannot exceed 10 characters"),
    
    check("location.rack")
      .optional()
      .isLength({ max: 10 })
      .withMessage("Rack identifier cannot exceed 10 characters"),
    
    check("location.bin")
      .optional()
      .isLength({ max: 10 })
      .withMessage("Bin identifier cannot exceed 10 characters"),
    
    check("notes")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Notes cannot exceed 500 characters"),
  ];
};

module.exports = {
  inventoryIDValidationRules,
  inventory_IdValidationRules,
  warehouseIdValidationRules,
  productIdValidationRules,
  stockStatusValidationRules,
  inventoryCreateValidationRules,
  inventoryUpdateValidationRules,
};
