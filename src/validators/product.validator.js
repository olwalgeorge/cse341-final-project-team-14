const { check, param } = require("express-validator");

const isMongoIdParam = (paramName, errorMessage) => {
  return param(paramName, errorMessage).isMongoId();
};

const productIDValidationRules = () => {
  return [
    param("productID", "Product ID should be in the format PR-xxxxx").matches(
      /^PR-\d{5}$/
    ),
  ];
};

const product_IdValidationRules = () => {
  return [isMongoIdParam("_id", "Invalid Product ID format")];
};

const categoryValidationRules = () => {
  return [
    param("category")
      .trim()
      .isIn(["Electronics", "Clothing", "Food", "Furniture", "Other"])
      .withMessage("Invalid category. Must be one of: Electronics, Clothing, Food, Furniture, Other"),
  ];
};

const productCreateValidationRules = () => {
  return [
    check("productID")
      .optional()
      .matches(/^PR-\d{5}$/)
      .withMessage("Product ID should be in the format PR-xxxxx"),
    check("name")
      .trim()
      .notEmpty()
      .withMessage("Product name is required")
      .isLength({ max: 100 })
      .withMessage("Product name cannot exceed 100 characters"),
    check("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Product description cannot exceed 500 characters"),
    check("price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    check("quantity")
      .isInt({ min: 0 })
      .withMessage("Quantity must be a non-negative integer"),
    check("category")
      .isIn(["Electronics", "Clothing", "Food", "Furniture", "Other"])
      .withMessage("Invalid category"),
    check("supplier").isMongoId().withMessage("Invalid supplier ID"),
    check("sku")
      .matches(/^[A-Z0-9]{6,12}$/)
      .withMessage("SKU must be 6-12 alphanumeric characters"),
  ];
};

const productUpdateValidationRules = () => {
  return [
    check("productID")
      .optional()
      .matches(/^PR-\d{5}$/)
      .withMessage("Product ID should be in the format PR-xxxxx"),
    check("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Product name cannot be empty")
      .isLength({ max: 100 })
      .withMessage("Product name cannot exceed 100 characters"),
    check("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description cannot exceed 500 characters"),
    check("price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    check("quantity")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Quantity must be a non-negative integer"),
    check("category")
      .optional()
      .isIn(["Electronics", "Clothing", "Food", "Furniture", "Other"])
      .withMessage("Invalid category"),
    check("supplier").optional().isMongoId().withMessage("Invalid supplier ID"),
    check("sku")
      .optional()
      .matches(/^[A-Z0-9]{6,12}$/)
      .withMessage("SKU must be 6-12 alphanumeric characters"),
  ];
};

module.exports = {
  productIDValidationRules,
  product_IdValidationRules,
  categoryValidationRules,
  productCreateValidationRules,
  productUpdateValidationRules,
};
