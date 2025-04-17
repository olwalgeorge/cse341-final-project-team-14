const { check, param, body } = require("express-validator");

// Reusable rule for validating MongoDB ObjectIDs in parameters
const isMongoIdParam = (paramName, errorMessage) => {
  return param(paramName, errorMessage).isMongoId();
};

// Reusable rule for validating the USR-xxxxx User ID format in parameters
const isUserIDParam = (paramName, errorMessage) => {
  return param(paramName, errorMessage).matches(/^USR-\d{5}$/);
};

// Reusable rule for validating the USR-xxxxx User ID format in the body
const isUserIDBody = (fieldName, errorMessage) => {
  return check(fieldName, errorMessage)
    .optional()
    .trim()
    .matches(/^USR-\d{5}$/);
};

// Reusable rule for validating the username format in the body
const isValidUsernameBody = (fieldName, errorMessage) => {
  return check(fieldName, errorMessage)
    .trim()
    .matches(/^(?!\d)[a-zA-Z0-9_]+$/)
    .withMessage(
      "Username must not start with a number and can only contain alphanumeric characters and underscores"
    )
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .escape()
    .toLowerCase();
};

// Reusable rule for validating the password format in the body
const isValidPassword = (fieldName, errorMessage) => {
  return check(fieldName, errorMessage)
    .optional()
    .trim()
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,50}$/
    )
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"
    );
};

// Reusable rule for validating the user role in the body
const isValidRole = (fieldName, allowedRoles, errorMessage) => {
  return check(fieldName, errorMessage)
    .optional()
    .trim()
    .toUpperCase()
    .isIn(allowedRoles);
};

// rule for validating user role
const isValidRoleBody = (fieldName, allowedRoles, errorMessage) => {
  return check(fieldName, errorMessage)
    .optional()
    .custom((value) => {
      if (!value) {
        return true; // Skip validation if value is undefined or empty
      }
      return allowedRoles.includes(value.toUpperCase());
    })
    .withMessage(errorMessage)
    .trim()
    .escape();
};

// rule for validating and normalizing email
const isValidEmail = (fieldName, errorMessage) => {
  return check(fieldName, errorMessage)
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage(errorMessage);
};

const user_IdValidationRules = () => {
  return [isMongoIdParam("user_Id", "Invalid internal User ID format")];
};

// For /users/:userID (now using USR-xxxxx format)
const userIDValidationRules = () => {
  return [
    isUserIDParam(
      "userID",
      "User ID should be in the format USR-xxxxx (where x are digits)"
    ),
  ];
};

const userTypeValidationRules = () => {
  return [
    isValidRole(
      "role",
      ["SUPERADMIN", "ADMIN", "MANAGER", "SUPERVISOR", "USER", "ORG"],
      "Invalid user role"
    ),
  ];
};

const userUpdateValidationRules = () => {
  return [
    check("email").optional().trim().isEmail().normalizeEmail(),
    isUserIDBody(
      "userID",
      "User ID should be in the format USR-xxxxx (where x are digits)"
    ),
    check("fullName").optional().trim().isLength({ min: 2, max: 100 }),
    isValidUsernameBody("username", "Invalid username format").optional(),
    isValidPassword("password", "Invalid password format"),
    isValidRole(
      "role",
      ["SUPERADMIN", "ADMIN", "MANAGER", "SUPERVISOR", "USER", "ORG"],
      "Invalid user role"
    ),
    check("profilePicture").optional().trim().isLength({ max: 200 }),
    check("bio").optional().trim(),
    check("website").optional().trim().isURL({ require_tld: false }),
    check("location").optional().trim(),
    check("isVerified").optional().isBoolean(),
    check("phoneNumber").optional().trim(),
    check("preferences").optional().isObject(),
  ];
};

const usernameValidationRules = () => {
  return [
    param("username", "Username must be between 3 and 30 characters")
      .isLength({ min: 3, max: 30 })
      .trim()
      .escape()
      .toLowerCase(),
  ];
};

const emailValidationRules = () => {
  return [isValidEmail("email", "Invalid email format")];
};

const roleValidationRules = () => {
  return [
    body('role')
      .optional()
      .isString()
      .withMessage('Role must be a string')
      .isIn(['USER', 'SUPERVISOR', 'MANAGER', 'ADMIN', 'SUPERADMIN'])
      .withMessage('Invalid role specified'),
    
    param('role')
      .optional()
      .isString()
      .withMessage('Role must be a string')
      .isIn(['USER', 'SUPERVISOR', 'MANAGER', 'ADMIN', 'SUPERADMIN'])
      .withMessage('Invalid role specified')
  ];
};

/**
 * Validation rules for search term
 */
const searchValidationRules = () => {
  return [
    check("term", "Search term must be provided")
      .exists()
      .notEmpty()
      .isLength({ min: 2, max: 50 })
      .withMessage("Search term must be between 2 and 50 characters")
      .trim()
      .escape(),
  ];
};

/**
 * Validation rules for creating a new user by an admin
 */
const adminUserCreateValidationRules = () => {
  return [
    check("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be between 3 and 30 characters")
      .matches(/^(?!\d)[a-zA-Z0-9_]+$/)
      .withMessage("Username must not start with a number and can only contain alphanumeric characters and underscores"),
    
    check("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),
    
    check("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8, max: 50 })
      .withMessage("Password must be between 8 and 50 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,50}$/)
      .withMessage("Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"),
    
    check("fullName")
      .trim()
      .notEmpty()
      .withMessage("Full name is required")
      .isLength({ min: 2, max: 100 })
      .withMessage("Full name must be between 2 and 100 characters"),
    
    isValidRoleBody(
      "role",
      ["ADMIN", "MANAGER", "SUPERVISOR", "USER"],
      "Role must be one of: ADMIN, MANAGER, SUPERVISOR, USER"
    ),
    
    check("isActive")
      .optional()
      .isBoolean()
      .withMessage("isActive must be a boolean value"),
    
    check("isVerified")
      .optional()
      .isBoolean()
      .withMessage("isVerified must be a boolean value")
  ];
};

module.exports = {
  userUpdateValidationRules,
  userIDValidationRules,
  user_IdValidationRules,
  userTypeValidationRules,
  isValidEmail,
  isValidUsernameBody,
  isValidRoleBody,
  usernameValidationRules,
  emailValidationRules,
  roleValidationRules,
  searchValidationRules,
  adminUserCreateValidationRules,
};
