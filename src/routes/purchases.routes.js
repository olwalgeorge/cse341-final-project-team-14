const express = require("express");
const router = express.Router();
const {
  getAllPurchases,
  getPurchaseById,
  getPurchaseByPurchaseID,
  getPurchasesBySupplier,
  getPurchasesByStatus,
  createPurchase,
  updatePurchaseById,
  deletePurchaseById,
  deleteAllPurchases,
} = require("../controllers/purchases.controller.js");
const validate = require("../middlewares/validation.middleware.js");
const isAuthenticated = require("../middlewares/auth.middleware.js");
const {
  purchaseIDValidationRules,
  purchase_IdValidationRules,
  purchaseCreateValidationRules,
  purchaseUpdateValidationRules,
  supplierIdValidationRules,
  purchaseStatusValidationRules,
} = require("../validators/purchase.validator.js");

router.get("/", getAllPurchases);
router.get(
  "/purchaseID/:purchaseID",
  isAuthenticated,
  validate(purchaseIDValidationRules()),
  getPurchaseByPurchaseID
);

router.get(
  "/status/:status",
  isAuthenticated,
  validate(purchaseStatusValidationRules()),
  getPurchasesByStatus
);
router.get(
  "/supplier/:supplierId",
  isAuthenticated,
  validate(supplierIdValidationRules()),
  getPurchasesBySupplier
);

router.get("/:purchase_Id", validate(purchase_IdValidationRules()), getPurchaseById);


router.post(
  "/",
  isAuthenticated,
  validate(purchaseCreateValidationRules()),
  createPurchase
);
router.put(
  "/:purchase_Id",
  isAuthenticated,
  validate(purchase_IdValidationRules()),
  validate(purchaseUpdateValidationRules()),
  updatePurchaseById
);
router.delete(
  "/:purchase_Id",
  isAuthenticated,
  validate(purchase_IdValidationRules()),
  deletePurchaseById
);
router.delete("/", isAuthenticated, deleteAllPurchases);

module.exports = router;
