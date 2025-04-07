const express = require("express");
const router = express.Router();
const passport = require("../config/passport.js");
const localAuthController = require("../controllers/auth.controller.js");
const {
  userCreateValidationRules,
} = require("../validators/auth.validator.js");
const validate = require("../middlewares/validation.middleware.js");
const isAuthenticated = require("../middlewares/auth.middleware.js");

// Local authentication routes
router.post(
  "/register",
  validate(userCreateValidationRules()),
  localAuthController.register
);

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login.html",
    failureFlash: true,
  }),
  localAuthController.loginSuccess
);

router.post("/logout", isAuthenticated, localAuthController.logout);

// GitHub authentication routes
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
