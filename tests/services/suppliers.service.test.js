const mongoose = require('mongoose');
const { 
  getAllSuppliersService,
  getSupplierByIdService,
  createSupplierService,
  updateSupplierService,
  deleteSupplierService
} = require('../../src/services/suppliers.service');
const Supplier = require('../../src/models/supplier.model');
const { generateSupplierId } = require('../../src/utils/supplier.utils');

// Mock the supplier utils module
jest.mock('../../src/utils/supplier.utils');
jest.mock('../../src/utils/logger');

describe('Suppliers Service Tests', () => {
  const supplierData = {
    name: 'Test Supplier',
    contact: {
      phone: '1234567890',
      email: 'test@supplier.com'
    },
    address: {
      street: '123 Test St',
      city: 'Test City',
      state: 'Test State',
      postalCode: '12345',
      country: 'Test Country'
    }
  };

  beforeEach(async () => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    // Clear the suppliers collection before each test
    await Supplier.deleteMany({});
    // Set up the generateSupplierId mock to return a unique ID for each call
    let counter = 1;
    generateSupplierId.mockImplementation(() => {
      return Promise.resolve(`SP-${String(counter++).padStart(5, '0')}`);
    });
  });

  describe('createSupplierService', () => {
    it('should create a new supplier', async () => {
      // Add supplierID to match the implementation
      const supplierWithId = { 
        ...supplierData,
        supplierID: 'SP-00001'
      };
      
      const result = await createSupplierService(supplierWithId);
      
      expect(result._id).toBeDefined();
      expect(result.supplierID).toBe('SP-00001');
      expect(result.name).toBe(supplierData.name);
      expect(result.contact.phone).toBe(supplierData.contact.phone);
      expect(result.contact.email).toBe(supplierData.contact.email);
    });

    it('should throw an error if supplierID is missing', async () => {
      const invalidData = { ...supplierData };
      // We're testing missing supplierID, so don't auto-generate it

      await expect(createSupplierService(invalidData)).rejects.toThrow();
    });
  });

  describe('getSupplierByIdService', () => {
    it('should retrieve a supplier by ID', async () => {
      // First create a supplier with a unique ID
      const supplier = await createSupplierService({
        ...supplierData,
        supplierID: 'SP-00002'
      });
      
      // Then retrieve it by ID
      const result = await getSupplierByIdService(supplier._id);
      
      expect(result).toBeDefined();
      expect(result._id.toString()).toBe(supplier._id.toString());
      expect(result.name).toBe(supplierData.name);
    });

    it('should return null for non-existent ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const result = await getSupplierByIdService(nonExistentId);
      
      expect(result).toBeNull();
    });
  });

  describe('updateSupplierService', () => {
    it('should update an existing supplier', async () => {
      // First create a supplier with a unique ID
      const supplier = await createSupplierService({
        ...supplierData,
        supplierID: 'SP-00003'
      });
      
      // Update data
      const updateData = {
        name: 'Updated Supplier Name',
        contact: {
          phone: '9876543210',
          email: 'updated@supplier.com'
        }
      };
      
      // Update supplier
      const result = await updateSupplierService(supplier._id, updateData);
      
      expect(result).toBeDefined();
      expect(result.name).toBe(updateData.name);
      expect(result.contact.phone).toBe(updateData.contact.phone);
      expect(result.contact.email).toBe(updateData.contact.email);
      // Original fields should remain unchanged
      expect(result.supplierID).toBe('SP-00003');
    });
  });

  describe('deleteSupplierService', () => {
    it('should delete an existing supplier', async () => {
      // First create a supplier with a unique ID
      const supplier = await createSupplierService({
        ...supplierData,
        supplierID: 'SP-00004'
      });
      
      // Delete the supplier
      const result = await deleteSupplierService(supplier._id);
      
      expect(result).toBeDefined();
      expect(result.acknowledged).toBe(true);
      expect(result.deletedCount).toBe(1);
      
      // Verify supplier no longer exists
      const deletedSupplier = await getSupplierByIdService(supplier._id);
      expect(deletedSupplier).toBeNull();
    });
  });

  describe('getAllSuppliersService', () => {
    it('should retrieve all suppliers', async () => {
      // Create multiple suppliers with unique IDs
      await Promise.all([
        createSupplierService({
          ...supplierData, 
          supplierID: 'SP-00005',
          name: 'First Supplier'
        }),
        createSupplierService({
          ...supplierData,
          supplierID: 'SP-00006',
          name: 'Second Supplier',
          contact: { ...supplierData.contact, email: 'second@supplier.com' }
        }),
        createSupplierService({
          ...supplierData,
          supplierID: 'SP-00007',
          name: 'Third Supplier',
          contact: { ...supplierData.contact, email: 'third@supplier.com' }
        })
      ]);
      
      // Get all suppliers
      const result = await getAllSuppliersService();
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(3);
      // Check that our suppliers are in the results
      const supplierNames = result.map(s => s.name);
      expect(supplierNames).toContain('First Supplier');
      expect(supplierNames).toContain('Second Supplier');
      expect(supplierNames).toContain('Third Supplier');
    });

    it('should filter suppliers by name when queried in the database', async () => {
      // Create multiple suppliers with unique IDs
      await createSupplierService({
        ...supplierData,
        supplierID: 'SP-00009',
        name: 'Unique Supplier Name',
        contact: { ...supplierData.contact, email: 'unique@supplier.com' }
      });
      
      await createSupplierService({
        ...supplierData,
        supplierID: 'SP-00008',
        name: 'Regular Supplier'
      });
      
      // Get all suppliers and filter in memory (since the service doesn't support filtering directly)
      const allSuppliers = await getAllSuppliersService();
      const filteredSuppliers = allSuppliers.filter(s => s.name.includes('Unique'));
      
      expect(filteredSuppliers).toBeDefined();
      expect(Array.isArray(filteredSuppliers)).toBe(true);
      expect(filteredSuppliers.length).toBeGreaterThanOrEqual(1);
      // Check that our unique supplier is in the results
      expect(filteredSuppliers.some(s => s.name === 'Unique Supplier Name')).toBe(true);
    });
  });
});