const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  getProductByProductID,
  createProduct,
  updateProductById,
  deleteProductById,
  getProductsByCategory,
  getProductsBySupplier,
  searchProducts,
  deleteAllProducts,
} = require("../controllers/products.controller.js");
const validate = require("../middlewares/validation.middleware.js");
const isAuthenticated = require("../middlewares/auth.middleware.js");
const {
  productIDValidationRules,
  product_IdValidationRules,
  productCreateValidationRules,
  productUpdateValidationRules,
  categoryValidationRules,
} = require("../validators/product.validator.js");

// Public routes
router.get("/", getAllProducts);
router.get("/search", searchProducts);
router.get(
  "/productID/:productID",
  validate(productIDValidationRules()),
  getProductByProductID
);
router.get("/category/:category", validate(categoryValidationRules()), getProductsByCategory);
router.get("/supplier/:supplierId", getProductsBySupplier);
router.get("/:_id", validate(product_IdValidationRules()), getProductById);

// Protected routes - require authentication
router.post(
  "/",
  isAuthenticated,
  validate(productCreateValidationRules()),
  createProduct
);
router.put(
  "/:_id",
  isAuthenticated,
  validate(product_IdValidationRules()),
  validate(productUpdateValidationRules()),
  updateProductById
);
router.delete(
  "/:_id",
  isAuthenticated,
  validate(product_IdValidationRules()),
  deleteProductById
);
router.delete("/", isAuthenticated, deleteAllProducts);

module.exports = router;
