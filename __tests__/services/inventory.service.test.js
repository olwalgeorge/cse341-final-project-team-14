const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Inventory = require('../../src/models/inventory.model');
const inventoryService = require('../../src/services/inventory.service');

let mongoServer;
let testProduct1, testProduct2, testWarehouse1, testWarehouse2, testWarehouse3;

// Mock Product and Warehouse models needed for populate operations
const mockProductSchema = new mongoose.Schema({
  name: { type: String },
  productID: { type: String },
  sku: { type: String },
  category: { type: String }
});
const MockProduct = mongoose.model('Product', mockProductSchema);

const mockWarehouseSchema = new mongoose.Schema({
  name: { type: String },
  warehouseID: { type: String }
});
const MockWarehouse = mongoose.model('Warehouse', mockWarehouseSchema);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  
  // Create test ObjectIds for reference
  testProduct1 = new mongoose.Types.ObjectId();
  testProduct2 = new mongoose.Types.ObjectId();
  testWarehouse1 = new mongoose.Types.ObjectId();
  testWarehouse2 = new mongoose.Types.ObjectId();
  testWarehouse3 = new mongoose.Types.ObjectId();

  // Create mock product and warehouse documents
  await MockProduct.create([
    {
      _id: testProduct1,
      name: 'Test Product 1',
      productID: 'PR-00001',
      sku: 'SKU001',
      category: 'Test'
    },
    {
      _id: testProduct2,
      name: 'Test Product 2',
      productID: 'PR-00002',
      sku: 'SKU002',
      category: 'Test'
    }
  ]);

  await MockWarehouse.create([
    {
      _id: testWarehouse1,
      name: 'Test Warehouse 1',
      warehouseID: 'WH-00001'
    },
    {
      _id: testWarehouse2,
      name: 'Test Warehouse 2',
      warehouseID: 'WH-00002'
    },
    {
      _id: testWarehouse3,
      name: 'Test Warehouse 3',
      warehouseID: 'WH-00003'
    }
  ]);
});

beforeEach(async () => {
  // Clear existing inventory data
  await Inventory.deleteMany({});
  
  // Setup test inventory items - each with a unique product-warehouse combination
  await Inventory.create([
    {
      inventoryID: 'IN-00001',
      product: testProduct1,
      warehouse: testWarehouse1,
      quantity: 100,
      location: {
        aisle: 'A',
        rack: '01',
        bin: '01'
      },
      stockStatus: 'In Stock',
      minStockLevel: 10,
      maxStockLevel: 200
    },
    {
      inventoryID: 'IN-00002',
      product: testProduct2,
      warehouse: testWarehouse1,
      quantity: 10,
      location: {
        aisle: 'A',
        rack: '01',
        bin: '02'
      },
      stockStatus: 'Low Stock',
      minStockLevel: 15,
      maxStockLevel: 150
    },
    {
      inventoryID: 'IN-00003',
      product: testProduct1,
      warehouse: testWarehouse2,
      quantity: 0,
      location: {
        aisle: 'A',
        rack: '01',
        bin: '03'
      },
      stockStatus: 'Out of Stock',
      minStockLevel: 5,
      maxStockLevel: 100
    }
  ]);
});

afterEach(async () => {
  await Inventory.deleteMany({});
});

afterAll(async () => {
  // Clean up all models
  await MockProduct.deleteMany({});
  await MockWarehouse.deleteMany({});
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Inventory Service', () => {
  describe('getInventoryByIdService', () => {
    it('should return an inventory item by MongoDB ID', async () => {
      const existingInventory = await Inventory.findOne({ inventoryID: 'IN-00001' });
      
      const inventory = await inventoryService.getInventoryByIdService(existingInventory._id);
      
      expect(inventory).not.toBeNull();
      expect(inventory.inventoryID).toBe('IN-00001');
      expect(inventory.quantity).toBe(100);
    });

    it('should return null for non-existent ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const inventory = await inventoryService.getInventoryByIdService(nonExistentId);
      
      expect(inventory).toBeNull();
    });
  });

  describe('getInventoryByInventoryIDService', () => {
    it('should return an inventory item by inventoryID (IN-xxxxx format)', async () => {
      const inventory = await inventoryService.getInventoryByInventoryIDService('IN-00002');
      
      expect(inventory).not.toBeNull();
      expect(inventory.quantity).toBe(10);
      expect(inventory.stockStatus).toBe('Low Stock');
    });

    it('should return null for non-existent inventoryID', async () => {
      const inventory = await inventoryService.getInventoryByInventoryIDService('IN-99999');
      
      expect(inventory).toBeNull();
    });
  });

  describe('createInventoryService', () => {
    it('should create a new inventory item', async () => {
      const newInventoryData = {
        inventoryID: 'IN-00004',
        product: testProduct2,
        warehouse: testWarehouse2,
        quantity: 50,
        location: {
          aisle: 'B',
          rack: '01',
          bin: '01'
        },
        minStockLevel: 10,
        maxStockLevel: 100,
        stockStatus: 'In Stock'
      };
      
      const newInventory = await inventoryService.createInventoryService(newInventoryData);
      
      expect(newInventory).not.toBeNull();
      expect(newInventory.inventoryID).toBe('IN-00004');
      expect(newInventory.quantity).toBe(50);
      expect(newInventory.location.aisle).toBe('B');
      expect(newInventory.location.rack).toBe('01');
      expect(newInventory.location.bin).toBe('01');
      
      // Verify it was saved to the database
      const savedInventory = await Inventory.findOne({ inventoryID: 'IN-00004' });
      expect(savedInventory).not.toBeNull();
    });
  });

  describe('updateInventoryService', () => {
    it('should update inventory fields', async () => {
      const existingInventory = await Inventory.findOne({ inventoryID: 'IN-00001' });
      
      const updatedInventory = await inventoryService.updateInventoryService(existingInventory._id, {
        quantity: 75,
        stockStatus: 'Low Stock'
      });
      
      expect(updatedInventory.quantity).toBe(75);
      expect(updatedInventory.stockStatus).toBe('Low Stock');
      expect(updatedInventory.inventoryID).toBe('IN-00001'); // unchanged
    });

    it('should return null for non-existent inventory', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const result = await inventoryService.updateInventoryService(nonExistentId, { quantity: 50 });
      
      expect(result).toBeNull();
    });
  });

  describe('deleteInventoryService', () => {
    it('should delete an inventory item by ID', async () => {
      const existingInventory = await Inventory.findOne({ inventoryID: 'IN-00002' });
      const inventoryId = existingInventory._id;
      
      const deleteResult = await inventoryService.deleteInventoryService(inventoryId);
      
      // Check if deletion was successful
      expect(deleteResult.acknowledged).toBe(true);
      expect(deleteResult.deletedCount).toBe(1);
      
      // Verify inventory is deleted
      const inventoryAfterDelete = await Inventory.findById(inventoryId);
      expect(inventoryAfterDelete).toBeNull();
    });
  });

  describe('getAllInventoryService', () => {
    it('should return all inventory items with pagination', async () => {
      const result = await inventoryService.getAllInventoryService();
      
      expect(result.inventoryItems.length).toBe(3);
      expect(result.pagination).toBeDefined();
    });

    it('should apply status filter', async () => {
      const result = await inventoryService.getAllInventoryService({ stockStatus: 'Low Stock' });
      
      expect(result.inventoryItems.length).toBe(1);
      expect(result.inventoryItems[0].inventoryID).toBe('IN-00002');
    });

    it('should apply warehouse filter', async () => {
      const result = await inventoryService.getAllInventoryService({ warehouse: testWarehouse1 });
      
      expect(result.inventoryItems.length).toBe(2);
    });
    
    it('should apply product filter', async () => {
      const result = await inventoryService.getAllInventoryService({ product: testProduct1 });
      
      expect(result.inventoryItems.length).toBe(2);
      expect(result.inventoryItems[0].product._id.toString()).toBe(testProduct1.toString());
    });

    it('should apply sorting', async () => {
      const result = await inventoryService.getAllInventoryService({ sort: '-quantity' }); // descending quantity
      
      expect(result.inventoryItems[0].quantity).toBe(100);
      expect(result.inventoryItems[2].quantity).toBe(0);
    });
  });

  describe('getInventoryByProductService', () => {
    it('should return inventory items for a specific product', async () => {
      const result = await inventoryService.getInventoryByProductService(testProduct1);
      
      expect(result.inventoryItems.length).toBe(2);
      expect(result.inventoryItems[0].product._id.toString()).toBe(testProduct1.toString());
      expect(result.inventoryItems[1].product._id.toString()).toBe(testProduct1.toString());
    });

    it('should handle empty results', async () => {
      const nonExistentProductId = new mongoose.Types.ObjectId();
      const result = await inventoryService.getInventoryByProductService(nonExistentProductId);
      
      expect(result.inventoryItems.length).toBe(0);
    });
  });

  describe('getInventoryByWarehouseService', () => {
    it('should return inventory items for a specific warehouse', async () => {
      const result = await inventoryService.getInventoryByWarehouseService(testWarehouse1);
      
      expect(result.inventoryItems.length).toBe(2);
      expect(result.inventoryItems[0].warehouse._id.toString()).toBe(testWarehouse1.toString());
    });

    it('should handle empty results', async () => {
      const nonExistentWarehouseId = new mongoose.Types.ObjectId();
      const result = await inventoryService.getInventoryByWarehouseService(nonExistentWarehouseId);
      
      expect(result.inventoryItems.length).toBe(0);
    });
  });

  describe('getInventoryByStockStatusService', () => {
    it('should return inventory items filtered by status', async () => {
      const result = await inventoryService.getInventoryByStockStatusService('Out of Stock');
      
      expect(result.inventoryItems.length).toBe(1);
      expect(result.inventoryItems[0].stockStatus).toBe('Out of Stock');
      expect(result.inventoryItems[0].inventoryID).toBe('IN-00003');
    });

    it('should handle empty results', async () => {
      const result = await inventoryService.getInventoryByStockStatusService('Overstocked');
      
      expect(result.inventoryItems.length).toBe(0);
    });
  });

  describe('generateInventoryId', () => {
    it('should generate sequential inventory IDs', async () => {
      // Import the utility directly
      const { generateInventoryId } = require('../../src/utils/inventory.utils');
      
      // Next ID should be IN-00004
      const nextId = await generateInventoryId();
      expect(nextId).toBe('IN-00004');
      
      // Create another inventory
      await Inventory.create({
        inventoryID: nextId,
        product: testProduct2,
        warehouse: testWarehouse3,
        quantity: 25,
        location: {
          aisle: 'B',
          rack: '02',
          bin: '01'
        },
        minStockLevel: 5,
        maxStockLevel: 50
      });
      
      // Next ID should now be IN-00005
      const nextNextId = await generateInventoryId();
      expect(nextNextId).toBe('IN-00005');
    });
  });
});
