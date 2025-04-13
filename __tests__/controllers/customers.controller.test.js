const mongoose = require('mongoose');
const customerController = require('../../src/controllers/customers.controller');
const customerService = require('../../src/services/customers.service');
//eslint-disable-next-line no-unused-vars
const { DatabaseError } = require('../../src/utils/errors');

// Log available methods to debug
console.log('Available controller methods:', Object.keys(customerController));
console.log('Available service methods:', Object.keys(customerService));

// Mock the customer service
jest.mock('../../src/services/customers.service');

// Mock the logger to prevent console output during tests
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

describe('Customer Controller', () => {
  // Mock express request and response
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {},
      query: {},
      body: {},
      user: {
        _id: new mongoose.Types.ObjectId(),
        username: 'testuser',
        email: 'test@example.com',
        userID: 'SM-00001',
        role: 'ADMIN'
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('getCustomerById', () => {
    it('should return customer by ID', async () => {
      req.params.customer_Id = new mongoose.Types.ObjectId().toString();
      
      const mockCustomer = {
        _id: req.params.customer_Id,
        customerID: 'CU-00001',
        name: 'Test Customer',
        email: 'test@example.com'
      };
      
      customerService.getCustomerByIdService.mockResolvedValue(mockCustomer);
      
      await customerController.getCustomerById(req, res, next);
      
      expect(customerService.getCustomerByIdService).toHaveBeenCalledWith(req.params.customer_Id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      expect(res.json.mock.calls[0][0].data).toBeDefined();
    });

    it('should call next with error if customer not found', async () => {
      req.params.customer_Id = new mongoose.Types.ObjectId().toString();
      
      customerService.getCustomerByIdService.mockResolvedValue(null);
      
      await customerController.getCustomerById(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    });
  });

  describe('getCustomerByCustomerId', () => {
    it('should return customer by customerID', async () => {
      req.params.customerID = 'CU-00001';
      
      const mockCustomer = {
        _id: new mongoose.Types.ObjectId(),
        customerID: 'CU-00001',
        name: 'Test Customer'
      };
      
      customerService.getCustomerByCustomerIDService.mockResolvedValue(mockCustomer);
      
      await customerController.getCustomerByCustomerId(req, res, next);
      
      expect(customerService.getCustomerByCustomerIDService).toHaveBeenCalledWith('CU-00001');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it('should handle non-existent customerID', async () => {
      req.params.customerID = 'CU-99999';
      
      customerService.getCustomerByCustomerIDService.mockResolvedValue(null);
      
      await customerController.getCustomerByCustomerId(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });

  describe.skip('createCustomer', () => {
    it('should create and return a new customer', async () => {
      req.body = {
        name: 'New Customer',
        email: 'new@example.com',
        phone: '1234567890',
        address: {
          street: '123 New St',
          city: 'New City',
          state: 'New State',
          postalCode: '12345',
          country: 'New Country'
        },
        type: 'Individual'
      };
      
      const mockCreatedCustomer = {
        _id: new mongoose.Types.ObjectId(),
        customerID: 'CU-00001',
        name: 'New Customer',
        email: 'new@example.com'
      };
      
      customerService.createCustomerService.mockResolvedValue(mockCreatedCustomer);
      
      await customerController.createCustomer(req, res, next);
      
      expect(customerService.createCustomerService).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      req.body = {
        // Missing required name
        email: 'new@example.com'
      };
      
      customerService.createCustomerService.mockRejectedValue(new Error('Validation error'));
      
      await customerController.createCustomer(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });
  });

  describe('updateCustomerById', () => {
    it('should update and return customer', async () => {
      req.params.customer_Id = new mongoose.Types.ObjectId().toString();
      req.body = {
        name: 'Updated Customer',
        email: 'updated@example.com'
      };
      
      const mockUpdatedCustomer = {
        _id: req.params.customer_Id,
        customerID: 'CU-00001',
        name: 'Updated Customer',
        email: 'updated@example.com'
      };
      
      customerService.updateCustomerService.mockResolvedValue(mockUpdatedCustomer);
      
      await customerController.updateCustomerById(req, res, next);
      
      expect(customerService.updateCustomerService).toHaveBeenCalledWith(req.params.customer_Id, req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it('should handle non-existent customer', async () => {
      req.params.customer_Id = new mongoose.Types.ObjectId().toString();
      req.body = { name: 'Updated Name' };
      
      customerService.updateCustomerService.mockResolvedValue(null);
      
      await customerController.updateCustomerById(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });

  describe.skip('deleteCustomerById', () => {
    it('should delete customer and return success', async () => {
      req.params.customer_Id = new mongoose.Types.ObjectId().toString();
      
      const mockDeletedCustomer = {
        _id: req.params.customer_Id,
        customerID: 'CU-00001',
        name: 'Test Customer'
      };
      
      customerService.deleteCustomerService.mockResolvedValue(mockDeletedCustomer);
      
      await customerController.deleteCustomerById(req, res, next);
      
      expect(customerService.deleteCustomerService).toHaveBeenCalledWith(req.params.customer_Id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it('should handle non-existent customer', async () => {
      req.params.customer_Id = new mongoose.Types.ObjectId().toString();
      
      customerService.deleteCustomerService.mockResolvedValue(null);
      
      await customerController.deleteCustomerById(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });

  describe('getAllCustomers', () => {
    it('should return all customers with pagination', async () => {
      const mockCustomers = {
        customers: [
          { _id: new mongoose.Types.ObjectId(), customerID: 'CU-00001', name: 'Customer 1' },
          { _id: new mongoose.Types.ObjectId(), customerID: 'CU-00002', name: 'Customer 2' }
        ],
        pagination: {
          totalResults: 2,
          totalPages: 1,
          currentPage: 1,
          limit: 10
        }
      };
      
      customerService.getAllCustomersService.mockResolvedValue(mockCustomers);
      
      await customerController.getAllCustomers(req, res, next);
      
      expect(customerService.getAllCustomersService).toHaveBeenCalledWith(req.query);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].data.customers.length).toBe(2);
      expect(res.json.mock.calls[0][0].data.pagination).toBeDefined();
    });

    it('should handle empty results', async () => {
      customerService.getAllCustomersService.mockResolvedValue({
        customers: [],
        pagination: { totalResults: 0, totalPages: 0, currentPage: 1, limit: 10 }
      });
      
      await customerController.getAllCustomers(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].data.customers.length).toBe(0);
    });
  });

  describe('getCustomersByType', () => {
    it('should return customers filtered by type', async () => {
      req.params.type = 'Business';
      
      const mockResult = {
        customers: [
          { _id: new mongoose.Types.ObjectId(), customerID: 'CU-00001', name: 'Business 1', type: 'Business' },
          { _id: new mongoose.Types.ObjectId(), customerID: 'CU-00002', name: 'Business 2', type: 'Business' }
        ],
        pagination: {
          totalResults: 2,
          totalPages: 1,
          currentPage: 1,
          limit: 10
        }
      };
      
      customerService.getCustomersByTypeService.mockResolvedValue(mockResult);
      
      await customerController.getCustomersByType(req, res, next);
      
      expect(customerService.getCustomersByTypeService).toHaveBeenCalledWith('Business', req.query);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].data.customers.length).toBe(2);
    });

    it('should handle empty results', async () => {
      req.params.type = 'Government';
      
      customerService.getCustomersByTypeService.mockResolvedValue({
        customers: [],
        pagination: { totalResults: 0, totalPages: 0, currentPage: 1, limit: 10 }
      });
      
      await customerController.getCustomersByType(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].message).toContain('No customers found');
    });
  });

  describe('getCustomersByStatus', () => {
    it('should return customers filtered by status', async () => {
      req.params.status = 'Active';
      
      const mockResult = {
        customers: [
          { _id: new mongoose.Types.ObjectId(), customerID: 'CU-00001', name: 'Customer 1', status: 'Active' },
          { _id: new mongoose.Types.ObjectId(), customerID: 'CU-00002', name: 'Customer 2', status: 'Active' }
        ],
        pagination: {
          totalResults: 2,
          totalPages: 1,
          currentPage: 1,
          limit: 10
        }
      };
      
      customerService.getCustomersByStatusService.mockResolvedValue(mockResult);
      
      await customerController.getCustomersByStatus(req, res, next);
      
      expect(customerService.getCustomersByStatusService).toHaveBeenCalledWith('Active', req.query);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].data.customers.length).toBe(2);
    });

    it('should handle empty results', async () => {
      req.params.status = 'Blocked';
      
      customerService.getCustomersByStatusService.mockResolvedValue({
        customers: [],
        pagination: { totalResults: 0, totalPages: 0, currentPage: 1, limit: 10 }
      });
      
      await customerController.getCustomersByStatus(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].message).toContain('No customers found');
    });
  });

  describe('searchCustomers', () => {
    it('should search customers by term', async () => {
      req.query.term = 'business';
      
      const mockResult = {
        customers: [
          { _id: new mongoose.Types.ObjectId(), customerID: 'CU-00001', name: 'Business Customer' }
        ],
        pagination: {
          totalResults: 1,
          totalPages: 1,
          currentPage: 1,
          limit: 10
        }
      };
      
      customerService.searchCustomersService.mockResolvedValue(mockResult);
      
      await customerController.searchCustomers(req, res, next);
      
      expect(customerService.searchCustomersService).toHaveBeenCalledWith('business', req.query);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].data.customers.length).toBe(1);
    });

    it('should handle no search results', async () => {
      req.query.term = 'nonexistent';
      
      customerService.searchCustomersService.mockResolvedValue({
        customers: [],
        pagination: { totalResults: 0, totalPages: 0, currentPage: 1, limit: 10 }
      });
      
      await customerController.searchCustomers(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].message).toContain('No customers found');
    });
  });
});
