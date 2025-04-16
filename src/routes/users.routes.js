const express = require("express");
const { createRateLimiter } = require("../middlewares/rateLimit.middleware");
const {
  getAllUsers,
  getUserById,
  getUserByUserID,
  getUserByUsername,
  getUserByEmail,
  getUsersByRole,
  updateUserById,
  deleteUserById,
  deleteAllUsers,
  getUserProfile,
  updateUserProfile,
  searchUsers
} = require("../controllers/users.controller");
const isAuthenticated = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validation.middleware");
const {
  
  userUpdateValidationRules,
  userIDValidationRules,
  user_IdValidationRules, 
  usernameValidationRules,
  emailValidationRules,
  roleValidationRules,
  searchValidationRules,
} = require("../validators/user.validator.js");

const router = express.Router();

// Custom rate limiter for user routes - slightly more permissive than auth but still protected
const userLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30 // 30 requests per 5 minutes
});

// Apply rate limiting to user routes
router.use(userLimiter);

// User routes
router.get("/", isAuthenticated, getAllUsers);
router.get("/search", isAuthenticated, validate(searchValidationRules()), searchUsers);
router.get("/profile", isAuthenticated, getUserProfile);
router.put("/profile", isAuthenticated, validate(userUpdateValidationRules()), updateUserProfile);
router.get("/userID/:userID", isAuthenticated, validate(userIDValidationRules()), getUserByUserID);
router.get("/username/:username", isAuthenticated, validate(usernameValidationRules()), getUserByUsername);
router.get("/email/:email", isAuthenticated, validate(emailValidationRules()), getUserByEmail);
router.get("/role/:role", isAuthenticated, validate(roleValidationRules()), getUsersByRole);
router.get("/:user_Id", isAuthenticated, validate(user_IdValidationRules()), getUserById);
router.put("/:user_Id", isAuthenticated, validate(user_IdValidationRules()), validate(userUpdateValidationRules()), updateUserById);
router.delete("/:user_Id", isAuthenticated, validate(user_IdValidationRules()), deleteUserById);
router.delete("/", isAuthenticated, deleteAllUsers);

module.exports = router;
