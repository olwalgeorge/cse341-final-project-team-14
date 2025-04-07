const Purchase = require("../models/purchase.model");
const asyncHandler = require("express-async-handler");

const generatePurchaseId = asyncHandler(async () => {
  const prefix = "PU-";
  const paddedLength = 5;

  const lastPurchase = await Purchase.findOne(
    { purchaseID: { $regex: `^${prefix}` } },
    { purchaseID: 1 },
    { sort: { purchaseID: -1 } }
  );

  let nextNumber = 1;
  if (lastPurchase) {
    const lastNumber = parseInt(
      lastPurchase.purchaseID.slice(prefix.length),
      10
    );
    nextNumber = lastNumber + 1;
  }

  const paddedNumber = nextNumber.toString().padStart(paddedLength, "0");
  return `${prefix}${paddedNumber}`;
});

const transformPurchase = (purchase) => {
  if (!purchase) return null;
  return {
    _id: purchase._id,
    purchaseID: purchase.purchaseID,
    supplier: purchase.supplier,
    items: purchase.items,
    totalAmount: purchase.totalAmount,
    purchaseDate: purchase.purchaseDate,
    status: purchase.status,
    paymentStatus: purchase.paymentStatus,
    paymentDue: purchase.paymentDue,
    notes: purchase.notes,
    createdAt: purchase.createdAt,
    updatedAt: purchase.updatedAt,
  };
};

module.exports = {
  generatePurchaseId,
  transformPurchase,
};
