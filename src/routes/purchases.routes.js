const express = require('express');
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

// Public routes
router.get('/', getAllPurchases);
router.get('/purchaseID/:purchaseID', validate(purchaseIDValidationRules()), getPurchaseByPurchaseID);
router.get('/supplier/:supplierId', validate(supplierIdValidationRules()), getPurchasesBySupplier);
router.get('/status/:status', validate(purchaseStatusValidationRules()), getPurchasesByStatus);
router.get('/:_id', validate(purchase_IdValidationRules()), getPurchaseById);

// Protected routes - require authentication 
router.post('/', isAuthenticated, validate(purchaseCreateValidationRules()), createPurchase);
router.put('/:_id', isAuthenticated, validate(purchase_IdValidationRules()), validate(purchaseUpdateValidationRules()), updatePurchaseById);
router.delete('/:_id', isAuthenticated, validate(purchase_IdValidationRules()), deletePurchaseById);
router.delete('/', isAuthenticated, deleteAllPurchases);

module.exports = router;
