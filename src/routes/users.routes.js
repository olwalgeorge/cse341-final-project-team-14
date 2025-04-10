const express = require("express");
const {
  getUserProfile,
  updateUserProfile,
  getUserById,
  deleteUserById,
  getAllUsers,
  getUserByUsername,
  getUserByEmail,
  getUsersByRole,
  deleteAllUsers,
  updateUserById,
} = require("../controllers/users.controller.js");
const validate = require("../middlewares/validation.middleware.js");
const isAuthenticated = require("../middlewares/auth.middleware.js");
const {
  userUpdateValidationRules,
  userIDValidationRules,
  user_IdValidationRules,
  userTypeValidationRules,
  usernameValidationRules,
  emailValidationRules,
  roleValidationRules,
} = require("../validators/user.validator.js");

const router = express.Router();

router.get("/profile", isAuthenticated, getUserProfile);

router.put(
  "/profile",
  isAuthenticated,
  validate(userUpdateValidationRules()),
  updateUserProfile
);

router.get(
  "/userID/:userID",
  isAuthenticated,
  validate(userIDValidationRules()),
  getUserById
);

router.delete(
  "/:user_Id",
  isAuthenticated,
  validate(user_IdValidationRules()),
  deleteUserById
);

router.get("/", isAuthenticated, getAllUsers);

router.get(
  "/username/:username",
  isAuthenticated,
  validate(usernameValidationRules()),
  getUserByUsername
);

router.get(
  "/email/:email",
  isAuthenticated,
  validate(emailValidationRules()),
  getUserByEmail
);

router.get(
  "/role/:role",
  isAuthenticated,
  validate(roleValidationRules()),
  getUsersByRole
);

router.delete(
  "/",
  isAuthenticated,
  validate(userTypeValidationRules()),
  deleteAllUsers
);

router.put(
  "/:useruser_Id",
  isAuthenticated,
  validate(userUpdateValidationRules()),
  updateUserById
);

module.exports = router;
