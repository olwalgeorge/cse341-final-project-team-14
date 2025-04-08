const express = require("express")
const router = express.Router()

const productsControllers = require("../controllers/productsController")
const utilities = require("../validators/product-validation")

// Get all products
router.get('/products', productsControllers.listAllProducts)

// Get a product based on its ID
router.get('/products/:id', productsControllers.listAProduct)

// Add a product to product list
router.post('/products', 
    utilities.createProductRules(), 
    utilities.checkCreateProductData, 
    productsControllers.insertAProduct
)

// Update a product based on its ID
router.put('/products/:id', 
    utilities.createProductRules(), 
    utilities.checkCreateProductData, 
    productsControllers.modifyAProduct
)

// Delete a product
router.delete('/products/:id', 
    utilities.createProductRules(), 
    utilities.checkCreateProductData, 
    productsControllers.removeAProduct
)

module.exports = router