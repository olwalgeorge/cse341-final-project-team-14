const mongoose = require('mongoose');
const {
  getAllSuppliers,
  getSupplierById,
  getSupplierBySupplierID,
  createSupplier,
  updateSupplierById,
  deleteSupplierById
} = require('../../src/controllers/suppliers.controller');
const supplierService = require('../../src/services/suppliers.service');
const { generateSupplierId, transformSupplier } = require('../../src/utils/supplier.utils');
const DatabaseError = require('../../src/utils/errors/DatabaseError');

// Mock the necessary modules and functions
jest.mock('../../src/services/suppliers.service');
jest.mock('../../src/utils/supplier.utils');
jest.mock('../../src/utils/logger');
jest.mock('express-async-handler', () => (fn) => fn);
jest.mock('../../src/utils/response', () => jest.fn());

describe('Suppliers Controller Tests', () => {
  let mockRequest;
  let mockResponse;
  let mockNext;
  const sendResponse = require('../../src/utils/response');

  beforeEach(() => {
    mockRequest = {
      params: {},
      query: {},
      body: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Set up the standard mocks
    generateSupplierId.mockResolvedValue('SP-00001');
    transformSupplier.mockImplementation(supplier => ({
      supplier_Id: supplier._id,
      supplierID: supplier.supplierID,
      name: supplier.name,
      contact: supplier.contact,
      address: supplier.address
    }));
  });

  describe('getAllSuppliers', () => {
    it('should get all suppliers with pagination', async () => {
      // Mock data
      const mockSuppliers = [
        {
          _id: new mongoose.Types.ObjectId(),
          supplierID: 'SP-00001',
          name: 'Test Supplier 1'
        },
        {
          _id: new mongoose.Types.ObjectId(),
          supplierID: 'SP-00002',
          name: 'Test Supplier 2'
        }
      ];
      
      const mockPagination = {
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1
      };
      
      // Configure mock
      supplierService.getAllSuppliersService.mockResolvedValue({
        suppliers: mockSuppliers,
        pagination: mockPagination
      });
      
      // Execute controller function
      await getAllSuppliers(mockRequest, mockResponse, mockNext);
      
      // Verify results
      expect(sendResponse).toHaveBeenCalledWith(
        mockResponse,
        200,
        'Suppliers retrieved successfully',
        {
          suppliers: expect.any(Array),
          pagination: mockPagination
        }
      );
      expect(supplierService.getAllSuppliersService).toHaveBeenCalledWith(mockRequest.query);
    });

    it('should handle errors', async () => {
      // Configure mock to throw an error
      const errorMessage = 'Database error';
      supplierService.getAllSuppliersService.mockRejectedValue(new Error(errorMessage));
      
      // Execute controller function
      await getAllSuppliers(mockRequest, mockResponse, mockNext);
      
      // Verify next was called with the error
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockNext.mock.calls[0][0].message).toBe(errorMessage);
    });
  });

  describe('getSupplierById', () => {
    it('should get a supplier by ID', async () => {
      // Mock data
      const supplierId = new mongoose.Types.ObjectId();
      const mockSupplier = {
        _id: supplierId,
        supplierID: 'SP-00001',
        name: 'Test Supplier'
      };
      
      // Configure mocks
      mockRequest.params._id = supplierId.toString();
      supplierService.getSupplierByIdService.mockResolvedValue(mockSupplier);
      
      // Execute controller function
      await getSupplierById(mockRequest, mockResponse, mockNext);
      
      // Verify results
      expect(sendResponse).toHaveBeenCalled();
      expect(supplierService.getSupplierByIdService).toHaveBeenCalledWith(supplierId.toString());
    });

    it('should return 404 if supplier not found', async () => {
      // Configure mocks
      mockRequest.params._id = new mongoose.Types.ObjectId().toString();
      supplierService.getSupplierByIdService.mockResolvedValue(null);
      
      // Execute controller function
      await getSupplierById(mockRequest, mockResponse, mockNext);
      
      // Verify next was called with DatabaseError
      expect(mockNext).toHaveBeenCalledWith(expect.any(DatabaseError));
    });
  });

  describe('createSupplier', () => {
    it('should create a new supplier', async () => {
      // Mock data
      const supplierData = {
        name: 'New Supplier',
        contact: {
          phone: '1234567890',
          email: 'new@supplier.com'
        },
        address: {
          street: '123 New St',
          city: 'New City',
          state: 'New State',
          postalCode: '12345',
          country: 'New Country'
        }
      };
      
      const createdSupplier = {
        _id: new mongoose.Types.ObjectId(),
        supplierID: 'SP-00001',
        ...supplierData
      };
      
      // Configure mocks
      mockRequest.body = supplierData;
      supplierService.createSupplierService.mockResolvedValue(createdSupplier);
      
      // Execute controller function
      await createSupplier(mockRequest, mockResponse, mockNext);
      
      // Verify results
      expect(generateSupplierId).toHaveBeenCalled();
      expect(supplierService.createSupplierService).toHaveBeenCalledWith(
        expect.objectContaining({
          ...supplierData,
          supplierID: 'SP-00001'
        })
      );
      expect(sendResponse).toHaveBeenCalledWith(
        mockResponse,
        201,
        'Supplier created successfully',
        expect.anything()
      );
    });
  });
});