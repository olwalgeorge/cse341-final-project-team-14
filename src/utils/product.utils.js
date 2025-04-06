const Product = require("../models/product.model.js");

/**
 * Generate a unique product ID in the format PR-xxxxx
 */
const generateProductId = async () => {
    // Count total products and add 1 to get the next number
    const count = await Product.countDocuments();
    // Pad with leading zeros to ensure 5-digit format
    const paddedCount = String(count + 1).padStart(5, '0');
    
    // Create product ID in the format PR-xxxxx
    const productID = `PR-${paddedCount}`;
    
    // Check if this ID already exists (just to be safe)
    const existingProduct = await Product.findOne({ productID });
    
    if (existingProduct) {
        // If exists, recursively try again with a random offset
        const randomOffset = Math.floor(Math.random() * 1000) + 1;
        const newCount = count + randomOffset;
        const newPaddedCount = String(newCount).padStart(5, '0');
        return `PR-${newPaddedCount}`;
    }
    
    return productID;
};

const transformProduct = (product) => {
    if (!product) return null;
    return {
        _id: product._id,
        productID: product.productID,
        name: product.name,
        description: product.description,
        price: product.price,
        quantity: product.quantity,
        category: product.category,
        supplier: product.supplier,
        sku: product.sku
    };
};

module.exports = {
    generateProductId,
    transformProduct
};
