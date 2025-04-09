const Supplier = require("../models/supplier.model");
const asyncHandler = require("express-async-handler");

const generateSupplierId = asyncHandler(async () => {
  const prefix = "SP-";
  const paddedLength = 5;

  const lastSupplier = await Supplier.findOne(
    { supplierID: { $regex: `^${prefix}` } },
    { supplierID: 1 },
    { sort: { supplierID: -1 } }
  );

  let nextNumber = 1;
  if (lastSupplier) {
    const lastNumber = parseInt(
      lastSupplier.supplierID.slice(prefix.length),
      10
    );
    nextNumber = lastNumber + 1;
  }

  const paddedNumber = nextNumber.toString().padStart(paddedLength, "0");
  return `${prefix}${paddedNumber}`;
});

const transformSupplier = (supplier) => {
  if (!supplier) return null;
  return {
    supplier_Id: supplier._id,
    supplierID: supplier.supplierID,
    name: supplier.name,
    contact: supplier.contact,
    address: supplier.address,
  };
};

module.exports = {
  generateSupplierId,
  transformSupplier,
};
