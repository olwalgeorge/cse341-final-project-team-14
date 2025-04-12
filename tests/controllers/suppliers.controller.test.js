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
const supplierUtils = require('../../src/utils/supplier.utils');
const DatabaseError = require('../../src/utils/errors/DatabaseError');

// Mock the necessary modules and functions
jest.mock('../../src/services/suppliers.service');
jest.mock('../../src/utils/logger');
jest.mock('express-async-handler', () => (fn) => fn);
jest.mock('../../src/utils/response', () => jest.fn());

// Create a manual mock for supplier.utils instead of using jest.mock()
jest.mock('../../src/utils/supplier.utils', () => ({
  generateSupplierId: jest.fn().mockResolvedValue('SP-00001'),
  transformSupplier: jest.fn(supplier => {
    if (!supplier) return null;
    return {
      supplier_Id: supplier._id,
      supplierID: supplier.supplierID,
      name: supplier.name,
      contact: supplier.contact,
      address: supplier.address
    };
  })
}));

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
        },
        status: 'ACTIVE' // Include status
      };
      
      const createdSupplier = {
        _id: new mongoose.Types.ObjectId(),
        supplierID: 'SP-00001',
        status: 'ACTIVE', // Include status
        ...supplierData
      };
      
      // Configure mocks
      mockRequest.body = supplierData;
      supplierService.createSupplierService.mockResolvedValue(createdSupplier);
      
      // Execute controller function
      await createSupplier(mockRequest, mockResponse, mockNext);
      
      // Verify results
      expect(supplierUtils.generateSupplierId).toHaveBeenCalled();
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

  describe('getSupplierBySupplierID', () => {
    it('should get a supplier by supplierID', async () => {
      // Mock data
      const mockSupplier = {
        _id: new mongoose.Types.ObjectId(),
        supplierID: 'SP-00001',
        name: 'Test Supplier'
      };
      
      // Configure mocks
      mockRequest.params.supplierID = 'SP-00001';
      supplierService.getSupplierBySupplierIdService = jest.fn().mockResolvedValue(mockSupplier);
      
      // Execute controller function
      await getSupplierBySupplierID(mockRequest, mockResponse, mockNext);
      
      // Verify results
      expect(sendResponse).toHaveBeenCalled();
      expect(supplierService.getSupplierBySupplierIdService).toHaveBeenCalledWith('SP-00001');
    });

    it('should return 404 if supplier not found by supplierID', async () => {
      // Configure mocks
      mockRequest.params.supplierID = 'SP-99999';
      supplierService.getSupplierBySupplierIdService = jest.fn().mockResolvedValue(null);
      
      // Execute controller function
      await getSupplierBySupplierID(mockRequest, mockResponse, mockNext);
      
      // Verify next was called with DatabaseError
      expect(mockNext).toHaveBeenCalledWith(expect.any(DatabaseError));
    });
  });

  describe('updateSupplierById', () => {
    it('should update a supplier by ID', async () => {
      // Mock data
      const supplierId = new mongoose.Types.ObjectId();
      const updateData = {
        name: 'Updated Supplier',
        contact: {
          phone: '9876543210',
          email: 'updated@supplier.com'
        },
        status: 'INACTIVE' // Include status update
      };
      
      const updatedSupplier = {
        _id: supplierId,
        supplierID: 'SP-00001',
        name: 'Updated Supplier',
        contact: {
          phone: '9876543210',
          email: 'updated@supplier.com'
        },
        status: 'INACTIVE', // Include updated status
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        }
      };
      
      // Configure mocks
      mockRequest.params._id = supplierId.toString();
      mockRequest.body = updateData;
      supplierService.updateSupplierService = jest.fn().mockResolvedValue(updatedSupplier);
      
      // Execute controller function
      await updateSupplierById(mockRequest, mockResponse, mockNext);
      
      // Verify results
      expect(supplierService.updateSupplierService).toHaveBeenCalledWith(
        supplierId.toString(),
        updateData
      );
      expect(sendResponse).toHaveBeenCalledWith(
        mockResponse,
        200,
        'Supplier updated successfully',
        expect.anything()
      );
    });

    it('should return 404 if supplier to update not found', async () => {
      // Configure mocks
      mockRequest.params._id = new mongoose.Types.ObjectId().toString();
      mockRequest.body = { name: 'Updated Name' };
      supplierService.updateSupplierService = jest.fn().mockResolvedValue(null);
      
      // Execute controller function
      await updateSupplierById(mockRequest, mockResponse, mockNext);
      
      // Verify next was called with DatabaseError
      expect(mockNext).toHaveBeenCalledWith(expect.any(DatabaseError));
    });
  });

  describe('deleteSupplierById', () => {
    it('should delete a supplier by ID', async () => {
      // Mock data
      const supplierId = new mongoose.Types.ObjectId();
      const deleteResult = { acknowledged: true, deletedCount: 1 };
      
      // Configure mocks
      mockRequest.params._id = supplierId.toString();
      supplierService.deleteSupplierService = jest.fn().mockResolvedValue(deleteResult);
      
      // Execute controller function
      await deleteSupplierById(mockRequest, mockResponse, mockNext);
      
      // Verify results
      expect(supplierService.deleteSupplierService).toHaveBeenCalledWith(supplierId.toString());
      expect(sendResponse).toHaveBeenCalledWith(
        mockResponse,
        200,
        'Supplier deleted successfully',
        null
      );
    });

    it('should return 404 if supplier to delete not found', async () => {
      // Configure mocks
      mockRequest.params._id = new mongoose.Types.ObjectId().toString();
      supplierService.deleteSupplierService = jest.fn().mockResolvedValue({ acknowledged: true, deletedCount: 0 });
      
      // Execute controller function
      await deleteSupplierById(mockRequest, mockResponse, mockNext);
      
      // Verify next was called with DatabaseError
      expect(mockNext).toHaveBeenCalledWith(expect.any(DatabaseError));
    });
  });
});