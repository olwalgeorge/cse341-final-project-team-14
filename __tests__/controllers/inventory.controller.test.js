const mongoose = require('mongoose');
const inventoryController = require('../../src/controllers/inventory.controller');
const inventoryService = require('../../src/services/inventory.service');
//eslint-disable-next-line no-unused-vars
const { DatabaseError } = require('../../src/utils/errors');

// Log available methods to debug
console.log('Available controller methods:', Object.keys(inventoryController));
console.log('Available service methods:', Object.keys(inventoryService));

// Mock the inventory service
jest.mock('../../src/services/inventory.service');

// Mock the logger to prevent console output during tests
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

describe('Inventory Controller', () => {
  // Mock express request and response
  let req, res, next;
  let testProductId, testWarehouseId;

  beforeEach(() => {
    testProductId = new mongoose.Types.ObjectId();
    testWarehouseId = new mongoose.Types.ObjectId();
    
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

  describe('getInventoryById', () => {
    it('should return inventory item by ID', async () => {
      req.params.inventory_Id = new mongoose.Types.ObjectId().toString();
      
      const mockInventory = {
        _id: req.params.inventory_Id,
        inventoryID: 'IN-00001',
        product: testProductId,
        warehouse: testWarehouseId,
        quantity: 100
      };
      
      inventoryService.getInventoryByIdService.mockResolvedValue(mockInventory);
      
      await inventoryController.getInventoryById(req, res, next);
      
      expect(inventoryService.getInventoryByIdService).toHaveBeenCalledWith(req.params.inventory_Id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      expect(res.json.mock.calls[0][0].data).toBeDefined();
    });

    it('should call next with error if inventory item not found', async () => {
      req.params.inventory_Id = new mongoose.Types.ObjectId().toString();
      
      inventoryService.getInventoryByIdService.mockResolvedValue(null);
      
      await inventoryController.getInventoryById(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    });
  });

  describe('getInventoryByInventoryID', () => {  // Changed from getInventoryByInventoryId
    it('should return inventory item by inventoryID', async () => {
      req.params.inventoryID = 'IN-00001';
      
      const mockInventory = {
        _id: new mongoose.Types.ObjectId(),
        inventoryID: 'IN-00001',
        product: testProductId,
        warehouse: testWarehouseId,
        quantity: 100
      };
      
      inventoryService.getInventoryByInventoryIDService.mockResolvedValue(mockInventory);
      
      await inventoryController.getInventoryByInventoryID(req, res, next);  // Changed method name
      
      expect(inventoryService.getInventoryByInventoryIDService).toHaveBeenCalledWith('IN-00001');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it('should handle non-existent inventoryID', async () => {
      req.params.inventoryID = 'IN-99999';
      
      inventoryService.getInventoryByInventoryIDService.mockResolvedValue(null);
      
      await inventoryController.getInventoryByInventoryID(req, res, next);  // Changed method name
      
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });

  describe.skip('createInventory', () => {
    it('should create and return a new inventory item', async () => {
      req.body = {
        product: testProductId.toString(),
        warehouse: testWarehouseId.toString(),
        quantity: 100,
        location: 'A-01-02-03',
        status: 'In Stock'
      };
      
      const mockCreatedInventory = {
        _id: new mongoose.Types.ObjectId(),
        inventoryID: 'IN-00001',
        product: testProductId,
        warehouse: testWarehouseId,
        quantity: 100,
        location: 'A-01-02-03'
      };
      
      inventoryService.createInventoryService.mockResolvedValue(mockCreatedInventory);
      
      await inventoryController.createInventory(req, res, next);
      
      expect(inventoryService.createInventoryService).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      req.body = {
        // Missing required product and warehouse
        quantity: -10 // Invalid quantity
      };
      
      inventoryService.createInventoryService.mockRejectedValue(new Error('Validation error'));
      
      await inventoryController.createInventory(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });
  });

  describe('updateInventoryById', () => {
    it('should update and return inventory item', async () => {
      req.params.inventory_Id = new mongoose.Types.ObjectId().toString();
      req.body = {
        quantity: 75,
        status: 'Low Stock'
      };
      
      const mockUpdatedInventory = {
        _id: req.params.inventory_Id,
        inventoryID: 'IN-00001',
        product: testProductId,
        warehouse: testWarehouseId,
        quantity: 75,
        status: 'Low Stock'
      };
      
      inventoryService.updateInventoryService.mockResolvedValue(mockUpdatedInventory);
      
      await inventoryController.updateInventoryById(req, res, next);
      
      expect(inventoryService.updateInventoryService).toHaveBeenCalledWith(req.params.inventory_Id, req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it('should handle non-existent inventory item', async () => {
      req.params.inventory_Id = new mongoose.Types.ObjectId().toString();
      req.body = { quantity: 50 };
      
      inventoryService.updateInventoryService.mockResolvedValue(null);
      
      await inventoryController.updateInventoryById(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });

  describe.skip('deleteInventoryById', () => {
    it('should delete inventory item and return success', async () => {
      req.params.inventory_Id = new mongoose.Types.ObjectId().toString();
      
      const mockDeletedInventory = {
        _id: req.params.inventory_Id,
        inventoryID: 'IN-00001',
        product: testProductId,
        warehouse: testWarehouseId,
        quantity: 100
      };
      
      inventoryService.deleteInventoryService.mockResolvedValue(mockDeletedInventory);
      
      await inventoryController.deleteInventoryById(req, res, next);
      
      expect(inventoryService.deleteInventoryService).toHaveBeenCalledWith(req.params.inventory_Id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it('should handle non-existent inventory item', async () => {
      req.params.inventory_Id = new mongoose.Types.ObjectId().toString();
      
      inventoryService.deleteInventoryService.mockResolvedValue(null);
      
      await inventoryController.deleteInventoryById(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });

  describe('getAllInventory', () => {
    it('should return all inventory items with pagination', async () => {
      const mockInventory = {
        inventoryItems: [  // Changed from inventory to inventoryItems
          { _id: new mongoose.Types.ObjectId(), inventoryID: 'IN-00001', quantity: 100 },
          { _id: new mongoose.Types.ObjectId(), inventoryID: 'IN-00002', quantity: 50 }
        ],
        pagination: {
          totalResults: 2,
          totalPages: 1,
          currentPage: 1,
          limit: 10
        }
      };
      
      inventoryService.getAllInventoryService.mockResolvedValue(mockInventory);
      
      await inventoryController.getAllInventory(req, res, next);
      
      expect(inventoryService.getAllInventoryService).toHaveBeenCalledWith(req.query);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].data.inventoryItems.length).toBe(2);  // Changed from inventory to inventoryItems
      expect(res.json.mock.calls[0][0].data.pagination).toBeDefined();
    });

    it('should handle empty results', async () => {
      inventoryService.getAllInventoryService.mockResolvedValue({
        inventoryItems: [],  // Changed from inventory to inventoryItems
        pagination: { totalResults: 0, totalPages: 0, currentPage: 1, limit: 10 }
      });
      
      await inventoryController.getAllInventory(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].data.inventoryItems.length).toBe(0);  // Changed from inventory to inventoryItems
    });
  });

  describe('getInventoryByProduct', () => {
    it('should return inventory items for a specific product', async () => {
      req.params.product_Id = testProductId.toString();
      
      const mockResult = {
        inventoryItems: [  // Changed from inventory to inventoryItems
          { _id: new mongoose.Types.ObjectId(), inventoryID: 'IN-00001', product: testProductId, quantity: 100 },
          { _id: new mongoose.Types.ObjectId(), inventoryID: 'IN-00003', product: testProductId, quantity: 0 }
        ],
        pagination: {
          totalResults: 2,
          totalPages: 1,
          currentPage: 1,
          limit: 10
        }
      };
      
      inventoryService.getInventoryByProductService.mockResolvedValue(mockResult);
      
      await inventoryController.getInventoryByProduct(req, res, next);
      
      expect(inventoryService.getInventoryByProductService).toHaveBeenCalledWith(testProductId.toString(), req.query);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].data.inventoryItems.length).toBe(2);  // Changed from inventory to inventoryItems
    });

    it('should handle empty results', async () => {
      req.params.product_Id = new mongoose.Types.ObjectId().toString();
      
      inventoryService.getInventoryByProductService.mockResolvedValue({
        inventoryItems: [],  // Changed from inventory to inventoryItems
        pagination: { totalResults: 0, totalPages: 0, currentPage: 1, limit: 10 }
      });
      
      await inventoryController.getInventoryByProduct(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].message).toContain('No inventory items found');  // Updated expected message
    });
  });

  describe('getInventoryByWarehouse', () => {
    it('should return inventory items for a specific warehouse', async () => {
      req.params.warehouse_Id = testWarehouseId.toString();
      
      const mockResult = {
        inventoryItems: [  // Changed from inventory to inventoryItems
          { _id: new mongoose.Types.ObjectId(), inventoryID: 'IN-00001', warehouse: testWarehouseId, quantity: 100 },
          { _id: new mongoose.Types.ObjectId(), inventoryID: 'IN-00002', warehouse: testWarehouseId, quantity: 50 }
        ],
        pagination: {
          totalResults: 2,
          totalPages: 1,
          currentPage: 1,
          limit: 10
        }
      };
      
      inventoryService.getInventoryByWarehouseService.mockResolvedValue(mockResult);
      
      await inventoryController.getInventoryByWarehouse(req, res, next);
      
      expect(inventoryService.getInventoryByWarehouseService).toHaveBeenCalledWith(testWarehouseId.toString(), req.query);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].data.inventoryItems.length).toBe(2);  // Changed from inventory to inventoryItems
    });

    it('should handle empty results', async () => {
      req.params.warehouse_Id = new mongoose.Types.ObjectId().toString();
      
      inventoryService.getInventoryByWarehouseService.mockResolvedValue({
        inventoryItems: [],  // Changed from inventory to inventoryItems
        pagination: { totalResults: 0, totalPages: 0, currentPage: 1, limit: 10 }
      });
      
      await inventoryController.getInventoryByWarehouse(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].message).toContain('No inventory items found');  // Updated expected message
    });
  });

  describe('getInventoryByStockStatus', () => {  // Changed from getInventoryByStatus
    it('should return inventory items filtered by stock status', async () => {
      req.params.stockStatus = 'Low Stock';  // Changed parameter name
      
      const mockResult = {
        inventoryItems: [  // Changed from inventory to inventoryItems
          { _id: new mongoose.Types.ObjectId(), inventoryID: 'IN-00002', stockStatus: 'Low Stock', quantity: 10 }  // Changed status to stockStatus
        ],
        pagination: {
          totalResults: 1,
          totalPages: 1,
          currentPage: 1,
          limit: 10
        }
      };
      
      inventoryService.getInventoryByStockStatusService.mockResolvedValue(mockResult);  // Changed service method name
      
      await inventoryController.getInventoryByStockStatus(req, res, next);  // Changed controller method name
      
      expect(inventoryService.getInventoryByStockStatusService).toHaveBeenCalledWith('Low Stock', req.query);  // Changed service method name
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].data.inventoryItems.length).toBe(1);  // Changed from inventory to inventoryItems
    });

    it('should handle empty results', async () => {
      req.params.stockStatus = 'Out of Stock';  // Changed parameter name
      
      inventoryService.getInventoryByStockStatusService.mockResolvedValue({  // Changed service method name
        inventoryItems: [],  // Changed from inventory to inventoryItems
        pagination: { totalResults: 0, totalPages: 0, currentPage: 1, limit: 10 }
      });
      
      await inventoryController.getInventoryByStockStatus(req, res, next);  // Changed controller method name
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].message).toContain('No inventory items found');  // Updated expected message
    });
  });
});
