const Supplier = require("../models/supplier.model");
const logger = require("../utils/logger");

// Get all suppliers
const getAllSuppliersService = async () => {
  logger.debug("getAllSuppliersService called");
  return await Supplier.find({});
};

// Get supplier by ID
const getSupplierByIdService = async (id) => {
  logger.debug(`getSupplierByIdService called with ID: ${id}`);
  return await Supplier.findById(id);
};

// Get supplier by name
const getSupplierByNameService = async (name) => {
  logger.debug(`getSupplierByNameService called with name: ${name}`);
  return await Supplier.findOne({ name: new RegExp(name, "i") });
};

// Get supplier by supplier ID (SP-XXXXX format)
const getSupplierBySupplierIDService = async (supplierID) => {
  logger.debug(`getSupplierBySupplierIDService called with supplier ID: ${supplierID}`);
  return await Supplier.findOne({ supplierID: supplierID });
};

// Create a new supplier
const createSupplierService = async (supplierData) => {
  logger.debug("createSupplierService called with data:", supplierData);
  const supplier = new Supplier(supplierData);
  return await supplier.save();
};

// Update supplier by ID
const updateSupplierService = async (id, updateData) => {
  logger.debug(`updateSupplierService called with ID: ${id}`, updateData);
  return await Supplier.findByIdAndUpdate(id, updateData, { new: true });
};

// Delete supplier by ID
const deleteSupplierService = async (id) => {
  logger.debug(`deleteSupplierService called with ID: ${id}`);
  return await Supplier.deleteOne({ _id: id });
};

// Delete all suppliers
const deleteAllSuppliersService = async () => {
  logger.debug("deleteAllSuppliersService called");
  return await Supplier.deleteMany({});
};

module.exports = {
  getAllSuppliersService,
  getSupplierByIdService,
  getSupplierByNameService,
  getSupplierBySupplierIDService,
  createSupplierService,
  updateSupplierService,
  deleteSupplierService,
  deleteAllSuppliersService,  
};
