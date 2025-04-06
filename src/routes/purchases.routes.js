const express = require('express');
const router = express.Router();
const {
  getAllPurchases,
  getPurchaseById,
  getPurchaseByPurchaseID,
  createPurchase,
  updatePurchaseById,
  deletePurchaseById,
  getPurchasesBySupplier,
  getPurchasesByStatus,
  deleteAllPurchases
} = require('../controllers/purchases.controller.js');
const validate = require('../middlewares/validation.middleware.js');
const isAuthenticated = require('../middlewares/auth.middleware.js');
const {
  purchaseIDValidationRules,
  purchase_IdValidationRules,
  purchaseCreateValidationRules,
  purchaseUpdateValidationRules,
  supplierIdValidationRules,
  purchaseStatusValidationRules
} = require('../validators/purchase.validator.js');

// All purchase routes require authentication
router.get('/', isAuthenticated, getAllPurchases);
router.get('/purchaseID/:purchaseID', isAuthenticated, validate(purchaseIDValidationRules()), getPurchaseByPurchaseID);
router.get('/supplier/:supplierId', isAuthenticated, validate(supplierIdValidationRules()), getPurchasesBySupplier);
router.get('/status/:status', isAuthenticated, validate(purchaseStatusValidationRules()), getPurchasesByStatus);
router.get('/:_id', isAuthenticated, validate(purchase_IdValidationRules()), getPurchaseById);

router.post('/', isAuthenticated, validate(purchaseCreateValidationRules()), createPurchase);
router.put('/:_id', isAuthenticated, validate(purchase_IdValidationRules()), validate(purchaseUpdateValidationRules()), updatePurchaseById);
router.delete('/:_id', isAuthenticated, validate(purchase_IdValidationRules()), deletePurchaseById);
router.delete('/', isAuthenticated, deleteAllPurchases);

module.exports = router;
