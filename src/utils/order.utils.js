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
  return {
    _id: order._id,
    orderID: order.orderID,
    products: order.products,
    orderDate: order.orderDate,
    status: order.status,
    totalAmount: order.totalAmount,
    shippingAddress: order.shippingAddress,
    customer: order.customer,
  };
};

module.exports = {
  generateOrderId,
  transformOrder,
};
