const express = require("express");
const router = express.Router();
const passport = require("../config/passport.js");
const { authLimiter } = require("../middlewares/rateLimit.middleware");
const {
  register,
  login,
  logout,
  getToken,
  forgotPassword,
  resetPassword,
  verifyTokenValidity,
  debugUserStatus
} = require("../controllers/auth.controller");
const validate = require("../middlewares/validation.middleware");
const {
  registerValidationRules,
  loginValidationRules,
  forgotPasswordValidationRules,
  resetPasswordValidationRules
} = require("../validators/auth.validator");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

// Apply more restrictive rate limiting to all auth routes
router.use(authLimiter);

// Public routes
router.post("/register", validate(registerValidationRules()), register);
router.post("/login", validate(loginValidationRules()), login);
router.post("/forgot-password", validate(forgotPasswordValidationRules()), forgotPassword);
router.post("/reset-password", validate(resetPasswordValidationRules()), resetPassword);

// Authenticated routes
router.post("/logout", authenticate, logout);
router.get("/token", authenticate, getToken);
router.get("/verify", authenticate, verifyTokenValidity);

// Debug routes (development only)
if (process.env.NODE_ENV !== 'production') {
  router.get("/debug/:email", authenticate, authorize('ADMIN'), debugUserStatus);
}

// GitHub OAuth routes
router.get(
  "/github",
  passport.authenticate("github", {
    scope: ["user:email"],
    failureRedirect: "/login.html",
  })
);

router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login.html" }),
  (req, res) => res.redirect("/dashboard.html")
);

module.exports = router;
