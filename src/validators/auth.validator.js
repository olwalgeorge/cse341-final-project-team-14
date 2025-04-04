const { body } = require("express-validator");
const User = require("../models/user.model");
const { isValidEmail, isValidUsernameBody, isValidRoleBody } = require("./user.validator");

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
    isValidRoleBody("role", ["SUPERADMIN", "ADMIN", "USER", "ORG"], "Role should be one of SUPERADMIN, ADMIN, USER, ORG"),
  ];
};

const userGeneralValidationRules = () => {
  return [
    body("facebookId").optional().trim().escape(),
    body("googleId").optional().trim().escape(),
    body("twitterId").optional().trim().escape(),
    body("githubId").optional().trim().escape(),
    body("profilePicture").optional().trim().escape(),
    body("bio").optional().trim().escape(),
    body("website").optional().trim().escape(),
    body("location").optional().trim().escape(),
    body("isVerified").optional().isBoolean(),
    body("phoneNumber").optional().trim().escape(),
    body("preferences").optional().isObject(),
  ];
};

const userCreateValidationRules = () => {
  return [
    ...userRequiredValidationRules(),
    ...userUniquenessValidationRules(),
  ];
};

const userCreateProfileRules = () => {
  return [
    ...userGeneralValidationRules
  ]
}

module.exports = {
  userCreateValidationRules,
  userCreateProfileRules

};