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
const isAuthenticated = require("../middlewares/auth.middleware.js");

// Apply more restrictive rate limiting to all auth routes
router.use(authLimiter);

// Registration route
router.post("/register", validate(registerValidationRules()), register);

// Login route
router.post("/login", validate(loginValidationRules()), login);

// Logout route
router.post("/logout", isAuthenticated, logout);

// Get JWT token (for authenticated users via OAuth)
router.get("/token", isAuthenticated, getToken);

// Password reset routes
router.post("/forgot-password", validate(forgotPasswordValidationRules()), forgotPassword);
router.post("/reset-password", validate(resetPasswordValidationRules()), resetPassword);

// Token verification route
router.get("/verify", isAuthenticated, verifyTokenValidity);

// Debug routes (development only)
if (process.env.NODE_ENV !== 'production') {
  router.get("/debug/:email", isAuthenticated, debugUserStatus);
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
