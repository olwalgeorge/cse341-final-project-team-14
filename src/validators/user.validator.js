const { check, param } = require("express-validator");

// Reusable rule for validating MongoDB ObjectIDs in parameters
const isMongoIdParam = (paramName, errorMessage) => {
  return param(paramName, errorMessage).isMongoId();
};

// Reusable rule for validating the SM-xxxxx User ID format in parameters
const isSMUserIDParam = (paramName, errorMessage) => {
  return param(paramName, errorMessage).matches(/^SM-\d{5}$/);
};

// Reusable rule for validating the SM-xxxxx User ID format in the body
const isSMUserIDBody = (fieldName, errorMessage) => {
  return check(fieldName, errorMessage)
    .optional()
    .trim()
    .matches(/^SM-\d{5}$/);
};

// Reusable rule for validating the username format in the body
const isValidUsernameBody = (fieldName, errorMessage) => {
  return check(fieldName, errorMessage)
    .trim()
    .matches(/^(?!\d)[a-zA-Z0-9_]+$/)
    .withMessage(
      "Username must not start with a number and can only contain alphanumeric characters and underscores"
    )
    .isLength({ min: 3, max: 20 })
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

// For /users/:userID (now using SM-xxxxx format)
const userIDValidationRules = () => {
  return [
    isSMUserIDParam(
      "userID",
      "User ID should be in the format SM-xxxxx (where x are digits)"
    ),
  ];
};

const userTypeValidationRules = () => {
  return [
    isValidRole(
      "role",
      ["SUPERADMIN", "ADMIN", "USER", "ORG"],
      "Invalid user role"
    ),
  ];
};

const userUpdateValidationRules = () => {
  return [
    check("email").optional().trim().isEmail().normalizeEmail(),
    isSMUserIDBody(
      "userID",
      "User ID should be in the format SM-xxxxx (where x are digits)"
    ),
    check("fullName").optional().trim().isLength({ min: 3, max: 50 }),
    isValidUsernameBody("username", "Invalid username format").optional(),
    isValidPassword("password", "Invalid password format"),
    isValidRole(
      "role",
      ["SUPERADMIN", "ADMIN", "USER", "ORG"],
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
    param("username", "Username must be between 3 and 20 characters")
      .isLength({ min: 3, max: 20 })
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
    param("role", "Role must be one of SUPERADMIN, ADMIN, USER, ORG")
      .trim()
      .toUpperCase()
      .isIn(["SUPERADMIN", "ADMIN", "USER", "ORG"])
      .escape(),
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
};
