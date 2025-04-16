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
const { authorize } = require("../middlewares/auth.middleware.js");
const {
  productIDValidationRules,
  product_IdValidationRules,
  productCreateValidationRules,
  productUpdateValidationRules,
  categoryValidationRules,
  supplierIdValidationRules,
} = require("../validators/product.validator.js");

// Public routes - no authentication required
router.get("/", getAllProducts);
router.get("/search", searchProducts);
router.get(
  "/productID/:productID",
  validate(productIDValidationRules()),
  getProductByProductID
);
router.get("/category/:category", validate(categoryValidationRules()), getProductsByCategory);
router.get("/supplier/:supplierId", validate(supplierIdValidationRules()), getProductsBySupplier);
router.get("/:product_Id", validate(product_IdValidationRules()), getProductById);

// Protected routes - require authentication and proper authorization
// Create products - restricted to management roles
router.post(
  "/",
  isAuthenticated,
  authorize(['ADMIN', 'MANAGER']),
  validate(productCreateValidationRules()),
  createProduct
);

// Update products - restricted to management roles
router.put(
  "/:product_Id",
  isAuthenticated,
  authorize(['ADMIN', 'MANAGER']),
  validate(product_IdValidationRules()),
  validate(productUpdateValidationRules()),
  updateProductById
);

// Delete operations - highly restricted to admin only
router.delete(
  "/:product_Id",
  isAuthenticated,
  authorize('ADMIN'),
  validate(product_IdValidationRules()),
  deleteProductById
);
router.delete("/", isAuthenticated, authorize('ADMIN'), deleteAllProducts);

module.exports = router;
