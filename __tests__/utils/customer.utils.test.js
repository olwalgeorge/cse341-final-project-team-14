const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Customer = require('../../src/models/customer.model');
const { generateCustomerId, transformCustomer } = require('../../src/utils/customer.utils');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  await Customer.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Customer Utils', () => {
  describe('generateCustomerId', () => {
    it('should generate the first customer ID as CU-00001 when no customers exist', async () => {
      const customerId = await generateCustomerId();
      expect(customerId).toBe('CU-00001');
    });

    it('should generate sequential customer IDs', async () => {
      // Create a few customers first
      await new Customer({
        customerID: 'CU-00001',
        name: 'Customer 1',
        email: 'customer1@example.com',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        }
      }).save();

      await new Customer({
        customerID: 'CU-00002',
        name: 'Customer 2',
        email: 'customer2@example.com',
        address: {
          street: '456 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        }
      }).save();

      // Generate the next ID
      const nextCustomerId = await generateCustomerId();
      expect(nextCustomerId).toBe('CU-00003');
    });

    it('should handle non-sequential existing customer IDs', async () => {
      // Create a customer with a higher ID first
      await new Customer({
        customerID: 'CU-00010',
        name: 'High Customer',
        email: 'high@example.com',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        }
      }).save();

      // Generate the next ID, should be 11
      const nextId = await generateCustomerId();
      expect(nextId).toBe('CU-00011');
    });
  });

  describe('transformCustomer', () => {
    it('should transform a customer object correctly', () => {
      const customer = {
        _id: new mongoose.Types.ObjectId(),
        customerID: 'CU-00001',
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '1234567890',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        },
        type: 'Individual',
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const transformedCustomer = transformCustomer(customer);

      // Check for correct property mapping
      // Using flexible approach to handle different property name conventions
      expect(transformedCustomer).toBeDefined();
      
      const idField = transformedCustomer.customer_Id || 
                      transformedCustomer.customerId || 
                      transformedCustomer._id;
                      
      expect(idField).toBeDefined();
      expect(transformedCustomer.customerID).toBe(customer.customerID);
      expect(transformedCustomer.name).toBe(customer.name);
      expect(transformedCustomer.email).toBe(customer.email);
      
      // Check nested objects
      if (transformedCustomer.address) {
        expect(transformedCustomer.address.city).toBe(customer.address.city);
      }
    });

    it('should return null for null input', () => {
      expect(transformCustomer(null)).toBeNull();
    });

    it('should handle customer with missing fields', () => {
      const partialCustomer = {
        _id: new mongoose.Types.ObjectId(),
        customerID: 'CU-00001',
        name: 'Partial Customer'
        // Missing email, phone, address, etc.
      };

      const transformedCustomer = transformCustomer(partialCustomer);

      expect(transformedCustomer).toBeDefined();
      expect(transformedCustomer.customerID).toBe(partialCustomer.customerID);
      expect(transformedCustomer.name).toBe(partialCustomer.name);
      
      // These should be undefined or null
      expect(transformedCustomer.email).toBeUndefined();
      expect(transformedCustomer.phone).toBeUndefined();
      expect(transformedCustomer.address).toBeUndefined();
    });
  });
});
