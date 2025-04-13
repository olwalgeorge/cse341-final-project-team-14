const mongoose = require('mongoose');
const warehouseController = require('../../src/controllers/warehouses.controller');
const warehouseService = require('../../src/services/warehouses.service');
//eslint-disable-next-line no-unused-vars
const { DatabaseError } = require('../../src/utils/errors');

// Log available methods to debug
console.log('Available controller methods:', Object.keys(warehouseController));
console.log('Available service methods:', Object.keys(warehouseService));

// Mock the warehouse service
jest.mock('../../src/services/warehouses.service');

// Mock the logger to prevent console output during tests
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

describe('Warehouse Controller', () => {
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

  describe('getWarehouseById', () => {
    it('should return warehouse by ID', async () => {
      req.params.warehouse_Id = new mongoose.Types.ObjectId().toString();
      
      const mockWarehouse = {
        _id: req.params.warehouse_Id,
        warehouseID: 'WH-00001',
        name: 'Test Warehouse',
        capacity: 10000
      };
      
      warehouseService.getWarehouseByIdService.mockResolvedValue(mockWarehouse);
      
      await warehouseController.getWarehouseById(req, res, next);
      
      expect(warehouseService.getWarehouseByIdService).toHaveBeenCalledWith(req.params.warehouse_Id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      expect(res.json.mock.calls[0][0].data).toBeDefined();
    });

    it('should call next with error if warehouse not found', async () => {
      req.params.warehouse_Id = new mongoose.Types.ObjectId().toString();
      
      warehouseService.getWarehouseByIdService.mockResolvedValue(null);
      
      await warehouseController.getWarehouseById(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    });
  });

  describe('getWarehouseByWarehouseId', () => {
    it('should return warehouse by warehouseID', async () => {
      req.params.warehouseID = 'WH-00001';
      
      const mockWarehouse = {
        _id: new mongoose.Types.ObjectId(),
        warehouseID: 'WH-00001',
        name: 'Test Warehouse'
      };
      
      warehouseService.getWarehouseByWarehouseIDService.mockResolvedValue(mockWarehouse);
      
      await warehouseController.getWarehouseByWarehouseId(req, res, next);
      
      expect(warehouseService.getWarehouseByWarehouseIDService).toHaveBeenCalledWith('WH-00001');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it('should handle non-existent warehouseID', async () => {
      req.params.warehouseID = 'WH-99999';
      
      warehouseService.getWarehouseByWarehouseIDService.mockResolvedValue(null);
      
      await warehouseController.getWarehouseByWarehouseId(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });

  describe.skip('createWarehouse', () => {
    it('should create and return a new warehouse', async () => {
      req.body = {
        name: 'New Warehouse',
        address: {
          street: '123 New St',
          city: 'New City',
          state: 'New State',
          postalCode: '12345',
          country: 'New Country'
        },
        capacity: 10000,
        manager: new mongoose.Types.ObjectId().toString()
      };
      
      const mockCreatedWarehouse = {
        _id: new mongoose.Types.ObjectId(),
        warehouseID: 'WH-00001',
        name: 'New Warehouse',
        capacity: 10000
      };
      
      warehouseService.createWarehouseService.mockResolvedValue(mockCreatedWarehouse);
      
      await warehouseController.createWarehouse(req, res, next);
      
      expect(warehouseService.createWarehouseService).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      req.body = {
        // Missing required name
        capacity: -1000 // Invalid capacity
      };
      
      warehouseService.createWarehouseService.mockRejectedValue(new Error('Validation error'));
      
      await warehouseController.createWarehouse(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });
  });

  describe('updateWarehouseById', () => {
    it('should update and return warehouse', async () => {
      req.params.warehouse_Id = new mongoose.Types.ObjectId().toString();
      req.body = {
        name: 'Updated Warehouse',
        capacity: 15000
      };
      
      const mockUpdatedWarehouse = {
        _id: req.params.warehouse_Id,
        warehouseID: 'WH-00001',
        name: 'Updated Warehouse',
        capacity: 15000
      };
      
      warehouseService.updateWarehouseService.mockResolvedValue(mockUpdatedWarehouse);
      
      await warehouseController.updateWarehouseById(req, res, next);
      
      expect(warehouseService.updateWarehouseService).toHaveBeenCalledWith(req.params.warehouse_Id, req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it('should handle non-existent warehouse', async () => {
      req.params.warehouse_Id = new mongoose.Types.ObjectId().toString();
      req.body = { name: 'Updated Name' };
      
      warehouseService.updateWarehouseService.mockResolvedValue(null);
      
      await warehouseController.updateWarehouseById(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });

  describe.skip('deleteWarehouseById', () => {
    it('should delete warehouse and return success', async () => {
      req.params.warehouse_Id = new mongoose.Types.ObjectId().toString();
      
      const mockDeletedWarehouse = {
        _id: req.params.warehouse_Id,
        warehouseID: 'WH-00001',
        name: 'Test Warehouse'
      };
      
      warehouseService.deleteWarehouseService.mockResolvedValue(mockDeletedWarehouse);
      
      await warehouseController.deleteWarehouseById(req, res, next);
      
      expect(warehouseService.deleteWarehouseService).toHaveBeenCalledWith(req.params.warehouse_Id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it('should handle non-existent warehouse', async () => {
      req.params.warehouse_Id = new mongoose.Types.ObjectId().toString();
      
      warehouseService.deleteWarehouseService.mockResolvedValue(null);
      
      await warehouseController.deleteWarehouseById(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });

  describe('getAllWarehouses', () => {
    it('should return all warehouses with pagination', async () => {
      const mockWarehouses = {
        warehouses: [
          { _id: new mongoose.Types.ObjectId(), warehouseID: 'WH-00001', name: 'Warehouse 1' },
          { _id: new mongoose.Types.ObjectId(), warehouseID: 'WH-00002', name: 'Warehouse 2' }
        ],
        pagination: {
          totalResults: 2,
          totalPages: 1,
          currentPage: 1,
          limit: 10
        }
      };
      
      warehouseService.getAllWarehousesService.mockResolvedValue(mockWarehouses);
      
      await warehouseController.getAllWarehouses(req, res, next);
      
      expect(warehouseService.getAllWarehousesService).toHaveBeenCalledWith(req.query);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].data.warehouses.length).toBe(2);
      expect(res.json.mock.calls[0][0].data.pagination).toBeDefined();
    });

    it('should handle empty results', async () => {
      warehouseService.getAllWarehousesService.mockResolvedValue({
        warehouses: [],
        pagination: { totalResults: 0, totalPages: 0, currentPage: 1, limit: 10 }
      });
      
      await warehouseController.getAllWarehouses(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].data.warehouses.length).toBe(0);
    });
  });

  describe('getWarehousesByStatus', () => {
    it('should return warehouses filtered by status', async () => {
      req.params.status = 'Active';
      
      const mockResult = {
        warehouses: [
          { _id: new mongoose.Types.ObjectId(), warehouseID: 'WH-00001', name: 'Warehouse 1', status: 'Active' },
          { _id: new mongoose.Types.ObjectId(), warehouseID: 'WH-00002', name: 'Warehouse 2', status: 'Active' }
        ],
        pagination: {
          totalResults: 2,
          totalPages: 1,
          currentPage: 1,
          limit: 10
        }
      };
      
      warehouseService.getWarehousesByStatusService.mockResolvedValue(mockResult);
      
      await warehouseController.getWarehousesByStatus(req, res, next);
      
      expect(warehouseService.getWarehousesByStatusService).toHaveBeenCalledWith('Active', req.query);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].data.warehouses.length).toBe(2);
    });

    it('should handle empty results', async () => {
      req.params.status = 'Maintenance';
      
      warehouseService.getWarehousesByStatusService.mockResolvedValue({
        warehouses: [],
        pagination: { totalResults: 0, totalPages: 0, currentPage: 1, limit: 10 }
      });
      
      await warehouseController.getWarehousesByStatus(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].message).toContain('No warehouses found');
    });
  });

  describe('searchWarehouses', () => {
    it('should search warehouses by term', async () => {
      req.query.term = 'main';
      
      const mockResult = {
        warehouses: [
          { _id: new mongoose.Types.ObjectId(), warehouseID: 'WH-00001', name: 'Main Warehouse' }
        ],
        pagination: {
          totalResults: 1,
          totalPages: 1,
          currentPage: 1,
          limit: 10
        }
      };
      
      warehouseService.searchWarehousesService.mockResolvedValue(mockResult);
      
      await warehouseController.searchWarehouses(req, res, next);
      
      expect(warehouseService.searchWarehousesService).toHaveBeenCalledWith('main', req.query);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].data.warehouses.length).toBe(1);
    });

    it('should handle no search results', async () => {
      req.query.term = 'nonexistent';
      
      warehouseService.searchWarehousesService.mockResolvedValue({
        warehouses: [],
        pagination: { totalResults: 0, totalPages: 0, currentPage: 1, limit: 10 }
      });
      
      await warehouseController.searchWarehouses(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].message).toContain('No warehouses found');
    });
  });
});
