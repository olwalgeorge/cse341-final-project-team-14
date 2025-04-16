const { body } = require("express-validator");
const User = require("../models/user.model");
const {
  isValidEmail,
  isValidUsernameBody,
  isValidRoleBody,
} = require("./user.validator");

const userUniquenessValidationRules = () => {
  return [
    body("userID").custom(async (value) => {
      const userExists = await User.exists({ userID: value });
      if (userExists) {
        throw new Error("User ID already exists");
      }
      return true;
    }),

    body("username").custom(async (value) => {
      const usernameExists = await User.exists({ username: value });
      if (usernameExists) {
        throw new Error("Username already exists");
      }
      return true;
    }),
    body("email").custom(async (value) => {
      const emailExists = await User.exists({ email: value });
      if (emailExists) {
        throw new Error("Email already exists");
      }
      return true;
    }),
  ];
};

const userRequiredValidationRules = () => {
  return [
    body("email", "Email is required").not().isEmpty(),
    isValidEmail("email", "Invalid email format"),
    body("password", "Password is required").not().isEmpty(),
    body("username", "Username is required").not().isEmpty(),
    isValidUsernameBody(
      "username",
      "Username must not start with a number and must contain only alphanumeric characters and underscores, and be between 3 to 20 characters"
    ),
    body(
      "fullName",
      "Full name must be at least 3 characters and at most 50 characters"
    )
      .trim()
      .isLength({ min: 3, max: 50 })
      .escape(),
    body(
      "password",
      "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character, and be between 8 to 50 characters"
    )
      .trim()
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,50}$/
      ),
    body("role").optional(),
    isValidRoleBody(
      "role",
      ["SUPERADMIN", "ADMIN", "USER", "ORG"],
      "Role should be one of SUPERADMIN, ADMIN, USER, ORG"
    ),
  ];
};

const userCreateValidationRules = () => {
  return [...userRequiredValidationRules(), ...userUniquenessValidationRules()];
};

/**
 * Validation rules for user login
 * @returns {Array} Array of express-validator validation middleware
 */
const loginValidationRules = () => {
  return [
    body("email", "Email is required")
      .not()
      .isEmpty()
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),
    body("password", "Password is required")
      .not()
      .isEmpty()
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,50}$/
      )
      .withMessage(
        'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character, and be between 8 to 50 characters'
      )
    ];
};

/**
 * Validation rules for forgot password request
 * @returns {Array} Array of express-validator validation middleware
 */
const forgotPasswordValidationRules = () => {
  return [
    body("email", "Email is required")
      .not()
      .isEmpty()
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail()
  ];
};

/**
 * Validation rules for password reset
 * @returns {Array} Array of express-validator validation middleware
 */
const resetPasswordValidationRules = () => {
  return [
    body("token", "Token is required")
      .not()
      .isEmpty()
      .isString()
      .withMessage("Invalid token format"),
    body("password", "Password is required")
      .not()
      .isEmpty()
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,50}$/
      )
      .withMessage(
        "Password must be 8-50 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    body("confirmPassword")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords do not match");
        }
        return true;
      })
  ];
};

/**
 * Validation rules for user registration
 * @returns {Array} Array of express-validator validation middleware
 */
const registerValidationRules = () => {
  return userCreateValidationRules();
};

module.exports = {  
  registerValidationRules,
  loginValidationRules,
  forgotPasswordValidationRules,
  resetPasswordValidationRules
};
