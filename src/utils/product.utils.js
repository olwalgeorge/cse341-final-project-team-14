const Product = require("../models/product.model");
const asyncHandler = require("express-async-handler");

const generateProductId = asyncHandler(async () => {
  const prefix = "PR-";
  const paddedLength = 5;

  const lastProduct = await Product.findOne(
    { productID: { $regex: `^${prefix}` } },
    { productID: 1 },
    { sort: { productID: -1 } }
  );

  let nextNumber = 1;
  if (lastProduct) {
    const lastNumber = parseInt(lastProduct.productID.slice(prefix.length), 10);
    nextNumber = lastNumber + 1;
  }

  const paddedNumber = nextNumber.toString().padStart(paddedLength, "0");
  return `${prefix}${paddedNumber}`;
});

const transformProduct = (product) => {
  if (!product) return null;
  return {
    product_id: product._id,
    productID: product.productID,
    name: product.name,
    description: product.description,
    sellingPrice: product.sellingPrice,
    costPrice: product.costPrice,
    quantity: product.quantity,
    category: product.category,
    supplier: product.supplier,
    sku: product.sku,
    tags: product.tags,
    images: product.images,
    unit: product.unit,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
};

module.exports = {
  generateProductId,
  transformProduct,
};
