const { check, param } = require("express-validator");

const isMongoIdParam = (paramName, errorMessage) => {
  return param(paramName, errorMessage).isMongoId();
};

const warehouseIDValidationRules = () => {
  return [
    param("warehouseID", "Warehouse ID should be in the format WH-xxxxx").matches(
      /^WH-\d{5}$/
    ),
  ];
};

const warehouseMongoIdValidationRules = () => {
  return [isMongoIdParam("warehouse_Id", "Invalid Warehouse ID format")];
};

const warehouseCreateValidationRules = () => {
  return [
    check("name")
      .trim()
      .notEmpty()
      .withMessage("Warehouse name is required")
      .isLength({ max: 100 })
      .withMessage("Warehouse name cannot exceed 100 characters"),
    
    check("capacity")
      .isNumeric()
      .withMessage("Capacity must be a number")
      .custom((value) => value >= 0)
      .withMessage("Capacity cannot be negative"),
    
    check("capacityUnit")
      .isIn(["sqft", "sqm", "pallets", "items"])
      .withMessage("Capacity unit must be one of: sqft, sqm, pallets, items"),
    
    check("status")
      .isIn(["Active", "Inactive", "Maintenance", "Under Construction"])
      .withMessage("Status must be one of: Active, Inactive, Maintenance, Under Construction"),
    
    check("contact.name")
      .trim()
      .notEmpty()
      .withMessage("Contact name is required")
      .isLength({ max: 100 })
      .withMessage("Contact name cannot exceed 100 characters"),
    
    check("contact.phone")
      .trim()
      .notEmpty()
      .withMessage("Contact phone is required")
      .matches(/^\d{10,15}$/)
      .withMessage("Contact phone must be a valid phone number (10-15 digits)"),
    
    check("contact.email")
      .trim()
      .notEmpty()
      .withMessage("Contact email is required")
      .isEmail()
      .withMessage("Contact email must be a valid email address"),
    
    check("address.street")
      .trim()
      .notEmpty()
      .withMessage("Street address is required")
      .isLength({ max: 200 })
      .withMessage("Street address cannot exceed 200 characters"),
    
    check("address.city")
      .trim()
      .notEmpty()
      .withMessage("City is required")
      .isLength({ max: 50 })
      .withMessage("City name cannot exceed 50 characters"),
    
    check("address.state")
      .trim()
      .notEmpty()
      .withMessage("State is required")
      .isLength({ max: 50 })
      .withMessage("State name cannot exceed 50 characters"),
    
    check("address.postalCode")
      .trim()
      .notEmpty()
      .withMessage("Postal code is required")
      .isLength({ max: 20 })
      .withMessage("Postal code cannot exceed 20 characters"),
    
    check("address.country")
      .trim()
      .notEmpty()
      .withMessage("Country is required")
      .isLength({ max: 50 })
      .withMessage("Country name cannot exceed 50 characters"),
  ];
};

const warehouseUpdateValidationRules = () => {
  return [
    check("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Warehouse name cannot be empty if provided")
      .isLength({ max: 100 })
      .withMessage("Warehouse name cannot exceed 100 characters"),
    
    check("capacity")
      .optional()
      .isNumeric()
      .withMessage("Capacity must be a number")
      .custom((value) => value >= 0)
      .withMessage("Capacity cannot be negative"),
    
    check("capacityUnit")
      .optional()
      .isIn(["sqft", "sqm", "pallets", "items"])
      .withMessage("Capacity unit must be one of: sqft, sqm, pallets, items"),
    
    check("status")
      .optional()
      .isIn(["Active", "Inactive", "Maintenance", "Under Construction"])
      .withMessage("Status must be one of: Active, Inactive, Maintenance, Under Construction"),
    
    check("contact.name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Contact name cannot be empty if provided")
      .isLength({ max: 100 })
      .withMessage("Contact name cannot exceed 100 characters"),
    
    check("contact.phone")
      .optional()
      .trim()
      .matches(/^\d{10,15}$/)
      .withMessage("Contact phone must be a valid phone number (10-15 digits)"),
    
    check("contact.email")
      .optional()
      .trim()
      .isEmail()
      .withMessage("Contact email must be a valid email address"),
    
    check("address.street")
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage("Street address cannot exceed 200 characters"),
    
    check("address.city")
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage("City name cannot exceed 50 characters"),
    
    check("address.state")
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage("State name cannot exceed 50 characters"),
    
    check("address.postalCode")
      .optional()
      .trim()
      .isLength({ max: 20 })
      .withMessage("Postal code cannot exceed 20 characters"),
    
    check("address.country")
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage("Country name cannot exceed 50 characters"),
  ];
};

module.exports = {
  warehouseIDValidationRules,
  warehouseMongoIdValidationRules,
  warehouseCreateValidationRules,
  warehouseUpdateValidationRules,
};
