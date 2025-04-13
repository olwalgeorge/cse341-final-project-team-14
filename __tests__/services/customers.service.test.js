const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Customer = require('../../src/models/customer.model');
const customerService = require('../../src/services/customers.service');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

beforeEach(async () => {
  // Setup test customers
  await Customer.create([
    {
      customerID: 'CU-00001',
      name: 'Individual Customer',
      email: 'individual@example.com',
      phone: '1234567890',
      address: {
        street: '123 Individual St',
        city: 'Individual City',
        state: 'Individual State',
        postalCode: '12345',
        country: 'Individual Country'
      },
      type: 'Individual',
      status: 'Active'
    },
    {
      customerID: 'CU-00002',
      name: 'Business Customer',
      email: 'business@example.com',
      phone: '0987654321',
      address: {
        street: '456 Business St',
        city: 'Business City',
        state: 'Business State',
        postalCode: '54321',
        country: 'Business Country'
      },
      type: 'Business',
      status: 'Active'
    },
    {
      customerID: 'CU-00003',
      name: 'Blocked Customer',
      email: 'blocked@example.com',
      phone: '5555555555',
      address: {
        street: '789 Blocked St',
        city: 'Blocked City',
        state: 'Blocked State',
        postalCode: '55555',
        country: 'Blocked Country'
      },
      type: 'Individual',
      status: 'Blocked'
    }
  ]);
});

afterEach(async () => {
  await Customer.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Display available service methods for debugging
console.log('Available customer service methods:', Object.keys(customerService));

describe('Customer Service', () => {
  describe('getCustomerByIdService', () => {
    it('should return a customer by MongoDB ID', async () => {
      const existingCustomer = await Customer.findOne({ name: 'Individual Customer' });
      
      const customer = await customerService.getCustomerByIdService(existingCustomer._id);
      
      expect(customer).not.toBeNull();
      expect(customer.name).toBe('Individual Customer');
      expect(customer.customerID).toBe('CU-00001');
    });

    it('should return null for non-existent ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const customer = await customerService.getCustomerByIdService(nonExistentId);
      
      expect(customer).toBeNull();
    });
  });

  describe('getCustomerByCustomerIDService', () => {
    it('should return a customer by customerID (CU-xxxxx format)', async () => {
      const customer = await customerService.getCustomerByCustomerIDService('CU-00002');
      
      expect(customer).not.toBeNull();
      expect(customer.name).toBe('Business Customer');
    });

    it('should return null for non-existent customerID', async () => {
      const customer = await customerService.getCustomerByCustomerIDService('CU-99999');
      
      expect(customer).toBeNull();
    });
  });

  describe('createCustomerService', () => {
    it('should create a new customer', async () => {
      const newCustomerData = {
        customerID: 'CU-00004',
        name: 'New Customer',
        email: 'new@example.com',
        phone: '1112223333',
        address: {
          street: '111 New St',
          city: 'New City',
          state: 'New State',
          postalCode: '11111',
          country: 'New Country'
        },
        type: 'Government'
      };
      
      const newCustomer = await customerService.createCustomerService(newCustomerData);
      
      expect(newCustomer).not.toBeNull();
      expect(newCustomer.customerID).toBe('CU-00004');
      expect(newCustomer.name).toBe('New Customer');
      expect(newCustomer.email).toBe('new@example.com');
      expect(newCustomer.type).toBe('Government');
      
      // Verify it was saved to the database
      const savedCustomer = await Customer.findOne({ customerID: 'CU-00004' });
      expect(savedCustomer).not.toBeNull();
    });
  });

  describe('updateCustomerService', () => {
    it('should update customer fields', async () => {
      const existingCustomer = await Customer.findOne({ name: 'Individual Customer' });
      
      const updatedCustomer = await customerService.updateCustomerService(existingCustomer._id, {
        name: 'Updated Individual Customer',
        phone: '9999999999',
        type: 'Business'
      });
      
      expect(updatedCustomer.name).toBe('Updated Individual Customer');
      expect(updatedCustomer.phone).toBe('9999999999');
      expect(updatedCustomer.type).toBe('Business');
      expect(updatedCustomer.customerID).toBe('CU-00001'); // unchanged
    });

    it('should return null for non-existent customer', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const result = await customerService.updateCustomerService(nonExistentId, { name: 'Test' });
      
      expect(result).toBeNull();
    });
  });

  describe('deleteCustomerService', () => {
    it('should delete a customer by ID', async () => {
      const existingCustomer = await Customer.findOne({ name: 'Business Customer' });
      
      const deletedCustomer = await customerService.deleteCustomerService(existingCustomer._id);
      
      expect(deletedCustomer).not.toBeNull();
      expect(deletedCustomer.name).toBe('Business Customer');
      
      // Verify customer is deleted
      const customerAfterDelete = await Customer.findById(existingCustomer._id);
      expect(customerAfterDelete).toBeNull();
    });
  });

  describe('getAllCustomersService', () => {
    it('should return all customers with pagination', async () => {
      const result = await customerService.getAllCustomersService();
      
      expect(result.customers.length).toBe(3);
      expect(result.pagination).toBeDefined();
    });

    it('should apply status filter', async () => {
      const result = await customerService.getAllCustomersService({ status: 'Blocked' });
      
      expect(result.customers.length).toBe(1);
      expect(result.customers[0].name).toBe('Blocked Customer');
    });

    it('should apply type filter', async () => {
      const result = await customerService.getAllCustomersService({ type: 'Business' });
      
      expect(result.customers.length).toBe(1);
      expect(result.customers[0].name).toBe('Business Customer');
    });

    it('should apply city filter', async () => {
      const result = await customerService.getAllCustomersService({ city: 'Individual City' });
      
      expect(result.customers.length).toBe(1);
      expect(result.customers[0].name).toBe('Individual Customer');
    });

    it('should apply sorting', async () => {
      const result = await customerService.getAllCustomersService({ sort: '-name' }); // descending name
      
      expect(result.customers[0].name).toBe('Individual Customer');
      expect(result.customers[2].name).toBe('Blocked Customer');
    });
  });

  describe('searchCustomersService', () => {
    it('should search customers by term', async () => {
      const result = await customerService.searchCustomersService('individual');
      
      expect(result.customers.length).toBe(1);
      expect(result.customers[0].name).toBe('Individual Customer');
    });

    it('should return empty array for no matches', async () => {
      const result = await customerService.searchCustomersService('nonexistent');
      
      expect(result.customers.length).toBe(0);
    });

    it('should match partial terms', async () => {
      const result = await customerService.searchCustomersService('business');
      
      expect(result.customers.length).toBe(1);
      expect(result.customers[0].name).toBe('Business Customer');
    });
  });

  describe('getCustomersByTypeService', () => {
    it('should return customers filtered by type', async () => {
      const result = await customerService.getCustomersByTypeService('Individual');
      
      expect(result.customers.length).toBe(2);
      expect(result.customers[0].type).toBe('Individual');
      expect(result.customers[1].type).toBe('Individual');
    });

    it('should handle empty results', async () => {
      const result = await customerService.getCustomersByTypeService('Non-profit');
      
      expect(result.customers.length).toBe(0);
    });
  });

  describe('getCustomersByStatusService', () => {
    it('should return customers filtered by status', async () => {
      const result = await customerService.getCustomersByStatusService('Blocked');
      
      expect(result.customers.length).toBe(1);
      expect(result.customers[0].name).toBe('Blocked Customer');
    });

    it('should handle empty results', async () => {
      const result = await customerService.getCustomersByStatusService('Pending');
      
      expect(result.customers.length).toBe(0);
    });
  });

  describe('generateCustomerIdService', () => {
    it('should generate sequential customer IDs', async () => {
      // Next ID should be CU-00004
      const nextId = await customerService.generateCustomerIdService();
      expect(nextId).toBe('CU-00004');
      
      // Create another customer
      await Customer.create({
        customerID: nextId,
        name: 'Next Customer',
        email: 'next@example.com',
        address: {
          street: '123 Next St',
          city: 'Next City',
          state: 'Next State',
          postalCode: '12345',
          country: 'Next Country'
        }
      });
      
      // Next ID should now be CU-00005
      const nextNextId = await customerService.generateCustomerIdService();
      expect(nextNextId).toBe('CU-00005');
    });
  });
});
