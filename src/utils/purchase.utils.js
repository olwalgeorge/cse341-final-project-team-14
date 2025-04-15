const Counter = require("../models/counter.model");
const { createLogger } = require("./logger");
const logger = createLogger("PurchaseUtils");

/**
 * Generate a unique purchase ID in the format PU-XXXXX
 * @returns {Promise<string>} - Generated purchase ID
 */
const generatePurchaseId = async () => {
  logger.debug("Generating purchaseID");
  
  try {
    // Use the Counter.getNextId method
    const purchaseID = await Counter.getNextId('purchaseID', { 
      prefix: 'PU-', 
      padLength: 5
    });
    
    logger.debug(`Generated purchaseID: ${purchaseID}`);
    return purchaseID;
  } catch (error) {
    logger.error("Error generating purchaseID:", error);
    throw error;
  }
};

const transformPurchase = (purchase) => {
  if (!purchase) return null;
  
  // Transform supplier data
  let supplierData = null;
  if (purchase.supplier) {
    // Handle both populated and embedded supplier data
    if (typeof purchase.supplier === 'object') {
      if (purchase.supplier._id) {
        // Populated supplier
        supplierData = {
          supplier_id: purchase.supplier._id,
          supplierID: purchase.supplier.supplierID || '',
          name: purchase.supplier.name || '',
          contact: purchase.supplier.contact || {}
        };
      }
    } else {
      // Just the ID reference
      supplierData = purchase.supplier;
    }
  }
  
  // Transform items data
  let itemsData = [];
  if (purchase.items && Array.isArray(purchase.items)) {
    itemsData = purchase.items.map(item => {
      const itemInfo = { 
        quantity: item.quantity, 
        price: item.price 
      };
      
      // Handle both populated and reference product data
      if (item.product) {
        if (typeof item.product === 'object' && item.product._id) {
          // Populated product
          itemInfo.product = {
            product_id: item.product._id,
            productID: item.product.productID || '',
            name: item.product.name || '',
            description: item.product.description || '',
            costPrice: item.product.costPrice || 0,
            category: item.product.category || '',
            sku: item.product.sku || ''
          };
        } else {
          // Reference ID
          itemInfo.product = item.product;
        }
      }
      
      return itemInfo;
    });
  }
  
  return {
    purchase_id: purchase._id,
    purchaseID: purchase.purchaseID,
    supplier: supplierData,
    items: itemsData,
    totalAmount: purchase.totalAmount,
    purchaseDate: purchase.purchaseDate,
    status: purchase.status,
    paymentStatus: purchase.paymentStatus,
    paymentDue: purchase.paymentDue,
    notes: purchase.notes,
    createdAt: purchase.createdAt,
    updatedAt: purchase.updatedAt
  };
};

module.exports = {
  generatePurchaseId,
  transformPurchase,
};
