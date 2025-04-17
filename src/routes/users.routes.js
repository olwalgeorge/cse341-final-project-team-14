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
  searchUsers,
  createUser
} = require("../controllers/users.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validation.middleware");
const {
  userUpdateValidationRules,
  userIDValidationRules,
  user_IdValidationRules, 
  usernameValidationRules,
  emailValidationRules,
  roleValidationRules,
  searchValidationRules,
  adminUserCreateValidationRules,
} = require("../validators/user.validator.js");

const router = express.Router();

// Custom rate limiter for user routes - slightly more permissive than auth but still protected
const userLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30 // 30 requests per 5 minutes
});

// Apply rate limiting to user routes
router.use(userLimiter);

// User routes with role-based authorization
// Own profile access - any authenticated user can access their own profile
router.get("/profile", authenticate, getUserProfile);
router.put("/profile", authenticate, validate(userUpdateValidationRules()), updateUserProfile);

// Administrative routes - restricted to ADMIN role
router.get("/", authenticate, authorize(['ADMIN', 'MANAGER']), getAllUsers);
router.get("/search", authenticate, authorize(['ADMIN', 'MANAGER']), validate(searchValidationRules()), searchUsers);
router.get("/userID/:userID", authenticate, authorize(['ADMIN', 'MANAGER']), validate(userIDValidationRules()), getUserByUserID);
router.get("/username/:username", authenticate, authorize(['ADMIN', 'MANAGER']), validate(usernameValidationRules()), getUserByUsername);
router.get("/email/:email", authenticate, authorize(['ADMIN', 'MANAGER']), validate(emailValidationRules()), getUserByEmail);
router.get("/role/:role", authenticate, authorize(['ADMIN', 'MANAGER']), validate(roleValidationRules()), getUsersByRole);
router.get("/:user_Id", authenticate, authorize(['ADMIN', 'MANAGER']), validate(user_IdValidationRules()), getUserById);
router.put("/:user_Id", authenticate, authorize(['ADMIN']), validate(user_IdValidationRules()), validate(userUpdateValidationRules()), updateUserById);

// Create user route - restricted to ADMIN role only
router.post(
  "/", 
  authenticate, 
  authorize('ADMIN'),
  validate(adminUserCreateValidationRules()),
  createUser
);

// Dangerous operations - restricted to ADMIN role only
router.delete("/:user_Id", authenticate, authorize('ADMIN'), validate(user_IdValidationRules()), deleteUserById);
router.delete("/", authenticate, authorize('ADMIN'), deleteAllUsers);

module.exports = router;
