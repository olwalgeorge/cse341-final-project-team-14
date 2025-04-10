const Order = require("../models/order.model");
const asyncHandler = require("express-async-handler");

const generateOrderId = asyncHandler(async () => {
  const prefix = "OR-";
  const paddedLength = 5;

  const lastOrder = await Order.findOne(
    { orderID: { $regex: `^${prefix}` } },
    { orderID: 1 },
    { sort: { orderID: -1 } }
  );

  let nextNumber = 1;
  if (lastOrder) {
    const lastNumber = parseInt(lastOrder.orderID.slice(prefix.length), 10);
    nextNumber = lastNumber + 1;
  }

  const paddedNumber = nextNumber.toString().padStart(paddedLength, "0");
  return `${prefix}${paddedNumber}`;
});

const transformOrder = (order) => {
  if (!order) return null;
  
  // Transform customer data
  let customerData = null;
  if (order.customer) {
    // Handle both populated and embedded customer data
    if (typeof order.customer === 'object') {
      if (order.customer._id) {
        // Populated customer (from Customer model)
        customerData = {
          customer_Id: order.customer._id,
          customerID: order.customer.customerID || '',
          name: order.customer.name || order.customer.fullName || '',
          email: order.customer.email || '',
          phone: order.customer.phone || '',
          address: order.customer.address || {}
        };
      } else if (order.customer.customerId) {
        // Embedded customer (from Order model structure)
        customerData = {
          customer_Id: order.customer.customerId,
          name: order.customer.name || '',
          email: order.customer.email || '',
          phone: order.customer.phone || ''
        };
      }
    } else {
      // Just the ID reference
      customerData = order.customer;
    }
  }
  
  // Transform products data
  let productsData = [];
  if (order.products && Array.isArray(order.products)) {
    productsData = order.products.map(item => {
      const productInfo = { 
        quantity: item.quantity, 
        priceAtOrder: item.priceAtOrder 
      };
      
      // Handle both populated and reference product data
      if (item.product) {
        if (typeof item.product === 'object' && item.product._id) {
          // Populated product
          productInfo.product = {
            product_id: item.product._id,
            productID: item.product.productID || '',
            name: item.product.name || '',
            description: item.product.description || '',
            price: item.product.price || 0,
            category: item.product.category || '',
            sku: item.product.sku || ''
          };
        } else {
          // Reference ID
          productInfo.product = item.product;
        }
      }
      
      return productInfo;
    });
  }
  
  return {
    order_id: order._id,
    orderID: order.orderID,
    products: productsData,
    orderDate: order.orderDate,
    status: order.status,
    totalAmount: order.totalAmount,
    shippingAddress: order.shippingAddress,
    customer: customerData,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt
  };
};

module.exports = {
  generateOrderId,
  transformOrder,
};
