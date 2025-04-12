const { check, param, query } = require("express-validator");

const customerIDValidationRules = () => {
  return [
    param("customerID", "Customer ID should be in the format CU-xxxxx").matches(
      /^CU-\d{5}$/
    ),
  ];
};

// Validation rules for customer's MongoDB ID
const customer_IdValidationRules = () => {
  return [
    param("customer_Id")
      .isMongoId()
      .withMessage("Invalid MongoDB ID format"),
  ];
};

const emailValidationRules = () => {
  return [check("email").isEmail().withMessage("Invalid email format")];
};

const customerCreateValidationRules = () => {
  return [
    check("name")
      .trim()
      .notEmpty()
      .withMessage("Customer name is required")
      .isLength({ max: 100 })
      .withMessage("Customer name cannot exceed 100 characters"),
    check("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format"),
    check("phone")
      .optional()
      .matches(/^[0-9]{10,15}$/)
      .withMessage("Please enter a valid phone number"),
    check("address.street")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Street cannot exceed 100 characters"),
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

const customerUpdateValidationRules = () => {
  return [
    check("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Customer name cannot be empty")
      .isLength({ max: 100 })
      .withMessage("Customer name cannot exceed 100 characters"),
    check("email")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Email cannot be empty")
      .isEmail()
      .withMessage("Invalid email format"),
    check("phone")
      .optional()
      .matches(/^[0-9]{10,15}$/)
      .withMessage("Please enter a valid phone number"),
  ];
};

/**
 * Validation rules for customer query parameters
 */
const customerQueryValidationRules = () => {
  return [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("sort")
      .optional()
      .isString()
      .withMessage("Sort must be a string"),
    query("name")
      .optional()
      .isString()
      .withMessage("Name filter must be a string"),
    query("email")
      .optional()
      .isString()
      .withMessage("Email filter must be a string"),
    query("phone")
      .optional()
      .isString()
      .withMessage("Phone filter must be a string"),
    query("city")
      .optional()
      .isString()
      .withMessage("City filter must be a string"),
    query("state")
      .optional()
      .isString()
      .withMessage("State filter must be a string"),
    query("country")
      .optional()
      .isString()
      .withMessage("Country filter must be a string"),
  ];
};

module.exports = {
  customerIDValidationRules,
  customer_IdValidationRules,
  emailValidationRules,
  customerCreateValidationRules,
  customerUpdateValidationRules,
  customerQueryValidationRules,
};
