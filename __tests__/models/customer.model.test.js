const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Customer = require('../../src/models/customer.model');

let mongoServer;

// Connect to a new in-memory database before running tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

// Clear database after each test
afterEach(async () => {
  await Customer.deleteMany({});
});

// Disconnect and close database after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Customer Model', () => {
  describe('Schema Validation', () => {
    it('should create a valid customer', async () => {
      const customerData = {
        customerID: 'CU-00001',
        name: 'Test Customer',
        email: 'customer@example.com',
        phone: '1234567890',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        },
        type: 'Individual',
        status: 'Active'
      };
      
      const validCustomer = new Customer(customerData);
      const savedCustomer = await validCustomer.save();
      
      // Verify saved customer
      expect(savedCustomer._id).toBeDefined();
      expect(savedCustomer.customerID).toBe(customerData.customerID);
      expect(savedCustomer.name).toBe(customerData.name);
      expect(savedCustomer.email).toBe(customerData.email);
      expect(savedCustomer.phone).toBe(customerData.phone);
      expect(savedCustomer.address.city).toBe(customerData.address.city);
      expect(savedCustomer.type).toBe(customerData.type);
      expect(savedCustomer.status).toBe(customerData.status);
      expect(savedCustomer.createdAt).toBeDefined();
      expect(savedCustomer.updatedAt).toBeDefined();
    });
    
    it('should fail on duplicate customerID', async () => {
      // Create first customer
      await new Customer({
        customerID: 'CU-00001',
        name: 'First Customer',
        email: 'first@example.com',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        }
      }).save();
      
      // Try to create a second customer with same customerID
      const duplicateCustomer = new Customer({
        customerID: 'CU-00001',
        name: 'Second Customer',
        email: 'second@example.com',
        address: {
          street: '456 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        }
      });
      
      await expect(duplicateCustomer.save()).rejects.toThrow();
    });
    
    it('should fail with invalid customerID format', async () => {
      const invalidCustomer = new Customer({
        customerID: 'INVALID',  // Not matching CU-XXXXX pattern
        name: 'Test Customer',
        email: 'test@example.com',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        }
      });
      
      await expect(invalidCustomer.save()).rejects.toThrow();
    });
    
    it('should fail without required name', async () => {
      const invalidCustomer = new Customer({
        customerID: 'CU-00001',
        // name is missing
        email: 'test@example.com',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        }
      });
      
      await expect(invalidCustomer.save()).rejects.toThrow();
    });
    
    it('should validate email format', async () => {
      const invalidCustomer = new Customer({
        customerID: 'CU-00001',
        name: 'Test Customer',
        email: 'not-an-email',  // Invalid email format
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        }
      });
      
      await expect(invalidCustomer.save()).rejects.toThrow();
    });
    
    it('should validate phone number format', async () => {
      const invalidCustomer = new Customer({
        customerID: 'CU-00001',
        name: 'Test Customer',
        email: 'test@example.com',
        phone: 'not-a-phone',  // Invalid phone format
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        }
      });
      
      await expect(invalidCustomer.save()).rejects.toThrow();
    });
  });
  
  describe('Type and Status Validation', () => {
    it('should accept valid type values', async () => {
      const validTypes = ['Individual', 'Business', 'Government', 'Non-profit'];
      
      for (const type of validTypes) {
        const customer = new Customer({
          customerID: `CU-0000${validTypes.indexOf(type) + 1}`,
          name: `${type} Customer`,
          email: `${type.toLowerCase()}@example.com`,
          type: type,
          address: {
            street: '123 Test St',
            city: 'Test City',
            state: 'Test State',
            postalCode: '12345',
            country: 'Test Country'
          }
        });
        
        const savedCustomer = await customer.save();
        expect(savedCustomer.type).toBe(type);
      }
    });
    
    it('should default to Individual type if not provided', async () => {
      const customer = new Customer({
        customerID: 'CU-00001',
        name: 'Test Customer',
        email: 'test@example.com',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        }
        // type not provided
      });
      
      const savedCustomer = await customer.save();
      expect(savedCustomer.type).toBe('Individual');
    });
    
    it('should accept valid status values', async () => {
      const validStatuses = ['Active', 'Inactive', 'Pending', 'Blocked'];
      
      for (const status of validStatuses) {
        const customer = new Customer({
          customerID: `CU-0000${validStatuses.indexOf(status) + 1}`,
          name: `${status} Customer`,
          email: `${status.toLowerCase()}@example.com`,
          status: status,
          address: {
            street: '123 Test St',
            city: 'Test City',
            state: 'Test State',
            postalCode: '12345',
            country: 'Test Country'
          }
        });
        
        const savedCustomer = await customer.save();
        expect(savedCustomer.status).toBe(status);
      }
    });
    
    it('should default to Active status if not provided', async () => {
      const customer = new Customer({
        customerID: 'CU-00001',
        name: 'Test Customer',
        email: 'test@example.com',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        }
        // status not provided
      });
      
      const savedCustomer = await customer.save();
      expect(savedCustomer.status).toBe('Active');
    });
    
    it('should reject invalid type values', async () => {
      const customer = new Customer({
        customerID: 'CU-00001',
        name: 'Test Customer',
        email: 'test@example.com',
        type: 'InvalidType',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        }
      });
      
      await expect(customer.save()).rejects.toThrow();
    });
    
    it('should reject invalid status values', async () => {
      const customer = new Customer({
        customerID: 'CU-00001',
        name: 'Test Customer',
        email: 'test@example.com',
        status: 'InvalidStatus',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        }
      });
      
      await expect(customer.save()).rejects.toThrow();
    });
  });
  
  describe('Timestamps', () => {
    it('should set createdAt and updatedAt timestamps', async () => {
      const customer = new Customer({
        customerID: 'CU-00001',
        name: 'Test Customer',
        email: 'test@example.com',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        }
      });
      
      const savedCustomer = await customer.save();
      
      expect(savedCustomer.createdAt).toBeInstanceOf(Date);
      expect(savedCustomer.updatedAt).toBeInstanceOf(Date);
    });
    
    it('should update the updatedAt timestamp on update', async () => {
      const customer = new Customer({
        customerID: 'CU-00001',
        name: 'Test Customer',
        email: 'test@example.com',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        }
      });
      
      const savedCustomer = await customer.save();
      const originalUpdatedAt = savedCustomer.updatedAt;
      
      // Wait a bit to ensure the timestamp changes
      await new Promise(resolve => setTimeout(resolve, 100));
      
      savedCustomer.name = 'Updated Customer';
      await savedCustomer.save();
      
      expect(savedCustomer.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});
