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

const supplierIdValidationRules = () => {
  return [isMongoIdParam("supplierId", "Invalid Supplier ID format")];
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
    check("sellingPrice")
      .isFloat({ min: 0 })
      .withMessage("Selling price must be a positive number"),
    check("costPrice")
      .isFloat({ min: 0 })
      .withMessage("Cost price must be a positive number"),
    check("category")
      .isIn(["Electronics", "Clothing", "Food", "Furniture", "Other"])
      .withMessage("Invalid category"),
    check("supplier").isMongoId().withMessage("Invalid supplier ID"),
    check("sku")
      .matches(/^[A-Z0-9]{6,12}$/)
      .withMessage("SKU must be 6-12 alphanumeric characters"),
    check("tags")
      .optional()
      .isArray()
      .withMessage("Tags must be an array"),
    check("tags.*")
      .optional()
      .isString()
      .withMessage("Each tag must be a string"),
    check("images")
      .optional()
      .isArray()
      .withMessage("Images must be an array"),
    check("images.*")
      .optional()
      .isString()
      .withMessage("Each image must be a valid string URL"),
    check("unit")
      .optional()
      .isIn(["kg", "g", "l", "ml", "pcs"])
      .withMessage("Invalid unit. Must be one of: kg, g, l, ml, pcs"),
  ];
};

const productUpdateValidationRules = () => {
  return [
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
    check("sellingPrice")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Selling price must be a positive number"),
    check("costPrice")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Cost price must be a positive number"),
    check("category")
      .optional()
      .isIn(["Electronics", "Clothing", "Food", "Furniture", "Other"])
      .withMessage("Invalid category"),
    check("supplier").optional().isMongoId().withMessage("Invalid supplier ID"),
    check("sku")
      .optional()
      .matches(/^[A-Z0-9]{6,12}$/)
      .withMessage("SKU must be 6-12 alphanumeric characters"),
    check("tags")
      .optional()
      .isArray()
      .withMessage("Tags must be an array"),
    check("tags.*")
      .optional()
      .isString()
      .withMessage("Each tag must be a string"),
    check("images")
      .optional()
      .isArray()
      .withMessage("Images must be an array"),
    check("images.*")
      .optional()
      .isString()
      .withMessage("Each image must be a valid string URL"),
    check("unit")
      .optional()
      .isIn(["kg", "g", "l", "ml", "pcs"])
      .withMessage("Invalid unit. Must be one of: kg, g, l, ml, pcs"),
  ];
};

module.exports = {
  productIDValidationRules,
  product_IdValidationRules,
  supplierIdValidationRules,
  categoryValidationRules,
  productCreateValidationRules,
  productUpdateValidationRules,
};
