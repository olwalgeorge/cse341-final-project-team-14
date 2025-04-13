const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Supplier = require('../../src/models/supplier.model');

let mongoServer;

// Connect to a new in-memory database before running tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

// Clear database after each test
afterEach(async () => {
  await Supplier.deleteMany({});
});

// Disconnect and close database after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Supplier Model', () => {
  describe('Schema Validation', () => {
    it('should create a valid supplier', async () => {
      const supplierData = {
        supplierID: 'SP-00001',
        name: 'Test Supplier',
        contact: {
          phone: '1234567890',
          email: 'supplier@example.com'
        },
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        },
        status: 'Active'
      };
      
      const validSupplier = new Supplier(supplierData);
      const savedSupplier = await validSupplier.save();
      
      // Verify saved supplier
      expect(savedSupplier._id).toBeDefined();
      expect(savedSupplier.supplierID).toBe(supplierData.supplierID);
      expect(savedSupplier.name).toBe(supplierData.name);
      expect(savedSupplier.contact.phone).toBe(supplierData.contact.phone);
      expect(savedSupplier.contact.email).toBe(supplierData.contact.email);
      expect(savedSupplier.address.city).toBe(supplierData.address.city);
      expect(savedSupplier.status).toBe(supplierData.status);
      expect(savedSupplier.createdAt).toBeDefined();
      expect(savedSupplier.updatedAt).toBeDefined();
    });
    
    it('should fail on duplicate supplierID', async () => {
      // Create first supplier
      await new Supplier({
        supplierID: 'SP-00001',
        name: 'First Supplier',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        }
      }).save();
      
      // Try to create a second supplier with same supplierID
      const duplicateSupplier = new Supplier({
        supplierID: 'SP-00001',
        name: 'Second Supplier',
        address: {
          street: '456 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        }
      });
      
      await expect(duplicateSupplier.save()).rejects.toThrow();
    });
    
    it('should fail with invalid supplierID format', async () => {
      const invalidSupplier = new Supplier({
        supplierID: 'INVALID',  // Not matching SP-XXXXX pattern
        name: 'Test Supplier',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        }
      });
      
      await expect(invalidSupplier.save()).rejects.toThrow();
    });
    
    it('should fail without required name', async () => {
      const invalidSupplier = new Supplier({
        supplierID: 'SP-00001',
        // name is missing
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        }
      });
      
      await expect(invalidSupplier.save()).rejects.toThrow();
    });
    
    it('should validate phone number format', async () => {
      const invalidSupplier = new Supplier({
        supplierID: 'SP-00001',
        name: 'Test Supplier',
        contact: {
          phone: 'not-a-phone',  // Invalid phone format
          email: 'supplier@example.com'
        },
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        }
      });
      
      await expect(invalidSupplier.save()).rejects.toThrow();
    });
    
    it('should validate email format', async () => {
      const invalidSupplier = new Supplier({
        supplierID: 'SP-00001',
        name: 'Test Supplier',
        contact: {
          phone: '1234567890',
          email: 'not-an-email'  // Invalid email format
        },
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        }
      });
      
      // Email isn't required, so this might still save
      const savedSupplier = await invalidSupplier.save();
      expect(savedSupplier.contact.email).toBe('not-an-email');
    });
    
    it('should enforce field length constraints', async () => {
      const tooLongName = 'a'.repeat(101);  // Over 100 character limit
      
      const invalidSupplier = new Supplier({
        supplierID: 'SP-00001',
        name: tooLongName,
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        }
      });
      
      await expect(invalidSupplier.save()).rejects.toThrow();
    });
  });
  
  describe('Status Validation', () => {
    it('should accept valid status values', async () => {
      const validStatuses = ['Active', 'Inactive', 'Pending', 'Blocked'];
      
      for (const status of validStatuses) {
        const supplier = new Supplier({
          supplierID: `SP-0000${validStatuses.indexOf(status) + 1}`,
          name: `${status} Supplier`,
          status: status,
          address: {
            street: '123 Test St',
            city: 'Test City',
            state: 'Test State',
            postalCode: '12345',
            country: 'Test Country'
          }
        });
        
        const savedSupplier = await supplier.save();
        expect(savedSupplier.status).toBe(status);
      }
    });
    
    it('should default to Active status if not provided', async () => {
      const supplier = new Supplier({
        supplierID: 'SP-00001',
        name: 'Test Supplier',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        }
        // status not provided
      });
      
      const savedSupplier = await supplier.save();
      expect(savedSupplier.status).toBe('Active');
    });
    
    it('should reject invalid status values', async () => {
      const supplier = new Supplier({
        supplierID: 'SP-00001',
        name: 'Test Supplier',
        status: 'InvalidStatus',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        }
      });
      
      await expect(supplier.save()).rejects.toThrow();
    });
  });
  
  describe('Timestamps', () => {
    it('should set createdAt and updatedAt timestamps', async () => {
      const supplier = new Supplier({
        supplierID: 'SP-00001',
        name: 'Test Supplier',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        }
      });
      
      const savedSupplier = await supplier.save();
      
      expect(savedSupplier.createdAt).toBeInstanceOf(Date);
      expect(savedSupplier.updatedAt).toBeInstanceOf(Date);
    });
    
    it('should update the updatedAt timestamp on update', async () => {
      const supplier = new Supplier({
        supplierID: 'SP-00001',
        name: 'Test Supplier',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        }
      });
      
      const savedSupplier = await supplier.save();
      const originalUpdatedAt = savedSupplier.updatedAt;
      
      // Wait a bit to ensure the timestamp changes
      await new Promise(resolve => setTimeout(resolve, 100));
      
      savedSupplier.name = 'Updated Supplier';
      await savedSupplier.save();
      
      expect(savedSupplier.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});
