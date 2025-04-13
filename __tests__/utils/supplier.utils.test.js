const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Supplier = require('../../src/models/supplier.model');
const { generateSupplierId, transformSupplier } = require('../../src/utils/supplier.utils');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  await Supplier.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Supplier Utils', () => {
  describe('generateSupplierId', () => {
    it('should generate the first supplier ID as SP-00001 when no suppliers exist', async () => {
      const supplierId = await generateSupplierId();
      expect(supplierId).toBe('SP-00001');
    });

    it('should generate sequential supplier IDs', async () => {
      // Create a few suppliers first
      await new Supplier({
        supplierID: 'SP-00001',
        name: 'Supplier 1',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        }
      }).save();

      await new Supplier({
        supplierID: 'SP-00002',
        name: 'Supplier 2',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        }
      }).save();

      // Generate the next ID
      const nextSupplierId = await generateSupplierId();
      expect(nextSupplierId).toBe('SP-00003');
    });

    it('should handle non-sequential existing supplier IDs', async () => {
      // Create a supplier with a higher ID first
      await new Supplier({
        supplierID: 'SP-00010',
        name: 'High Supplier',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        }
      }).save();

      // Generate the next ID, should be 11
      const nextId = await generateSupplierId();
      expect(nextId).toBe('SP-00011');
    });
  });

  describe('transformSupplier', () => {
    it('should transform a supplier object correctly', () => {
      const supplier = {
        _id: new mongoose.Types.ObjectId(),
        supplierID: 'SP-00001',
        name: 'Test Supplier',
        contact: {
          phone: '1234567890',
          email: 'test@example.com'
        },
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        },
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const transformedSupplier = transformSupplier(supplier);
      
      // Verify the actual structure based on the console log
      expect(transformedSupplier.supplier_Id.toString()).toBe(supplier._id.toString());
      expect(transformedSupplier.supplierID).toBe(supplier.supplierID);
      expect(transformedSupplier.name).toBe(supplier.name);
      // Status is not included in the transformed object, so we don't test for it
      
      // Check nested objects
      expect(transformedSupplier.contact.phone).toBe(supplier.contact.phone);
      expect(transformedSupplier.contact.email).toBe(supplier.contact.email);
      
      expect(transformedSupplier.address.street).toBe(supplier.address.street);
      expect(transformedSupplier.address.city).toBe(supplier.address.city);
      expect(transformedSupplier.address.state).toBe(supplier.address.state);
      expect(transformedSupplier.address.postalCode).toBe(supplier.address.postalCode);
      expect(transformedSupplier.address.country).toBe(supplier.address.country);
    });

    it('should return null for null input', () => {
      expect(transformSupplier(null)).toBeNull();
    });

    it('should handle supplier with missing fields', () => {
      const partialSupplier = {
        _id: new mongoose.Types.ObjectId(),
        supplierID: 'SP-00001',
        name: 'Partial Supplier'
        // Missing contact, address, status, etc.
      };

      const transformedSupplier = transformSupplier(partialSupplier);
      
      expect(transformedSupplier.supplier_Id.toString()).toBe(partialSupplier._id.toString());
      expect(transformedSupplier.supplierID).toBe(partialSupplier.supplierID);
      expect(transformedSupplier.name).toBe(partialSupplier.name);
      
      // These should be undefined since they're not in the original object
      expect(transformedSupplier.contact).toBeUndefined();
      expect(transformedSupplier.address).toBeUndefined();
    });
  });
});
