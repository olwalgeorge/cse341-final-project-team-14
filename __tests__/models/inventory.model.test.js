const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Mock the Product and Warehouse models before requiring Inventory
// This prevents the "Schema hasn't been registered for model" error
jest.mock('../../src/models/product.model', () => {
  return function() {
    return {
      name: 'Test Product',
      description: 'Test Description',
      sellingPrice: 100,
      category: 'Test Category',
      sku: 'TEST-SKU',
      productID: 'PR-00001'
    };
  };
});

jest.mock('../../src/models/warehouse.model', () => {
  return function() {
    return {
      name: 'Test Warehouse',
      warehouseID: 'WH-00001',
      status: 'Active'
    };
  };
});

const Inventory = require('../../src/models/inventory.model');

let mongoServer;

// Connect to a new in-memory database before running tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

// Clear database after each test
afterEach(async () => {
  await Inventory.deleteMany({});
});

// Disconnect and close database after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Inventory Model', () => {
  describe('Schema Validation', () => {
    it('should create a valid inventory record', async () => {
      const inventoryData = {
        inventoryID: 'IN-00001',
        product: new mongoose.Types.ObjectId(),
        warehouse: new mongoose.Types.ObjectId(),
        quantity: 100,
        minStockLevel: 10,
        maxStockLevel: 200,
        location: {
          aisle: 'A1',
          rack: 'R2',
          bin: 'B3'
        },
        stockStatus: 'In Stock',
        lastStockCheck: new Date()
      };
      
      const validInventory = new Inventory(inventoryData);
      const savedInventory = await validInventory.save();
      
      // Verify saved inventory
      expect(savedInventory._id).toBeDefined();
      expect(savedInventory.inventoryID).toBe(inventoryData.inventoryID);
      expect(savedInventory.product.toString()).toBe(inventoryData.product.toString());
      expect(savedInventory.warehouse.toString()).toBe(inventoryData.warehouse.toString());
      expect(savedInventory.quantity).toBe(inventoryData.quantity);
      expect(savedInventory.location.aisle).toBe(inventoryData.location.aisle);
      expect(savedInventory.location.rack).toBe(inventoryData.location.rack);
      expect(savedInventory.location.bin).toBe(inventoryData.location.bin);
      expect(savedInventory.stockStatus).toBe(inventoryData.stockStatus);
      expect(savedInventory.createdAt).toBeDefined();
      expect(savedInventory.updatedAt).toBeDefined();
    });
    
    it('should fail on duplicate inventoryID', async () => {
      // Create first inventory
      await new Inventory({
        inventoryID: 'IN-00001',
        product: new mongoose.Types.ObjectId(),
        warehouse: new mongoose.Types.ObjectId(),
        quantity: 50,
        minStockLevel: 10,
        maxStockLevel: 100
      }).save();
      
      // Try to create a second inventory with same inventoryID
      const duplicateInventory = new Inventory({
        inventoryID: 'IN-00001',
        product: new mongoose.Types.ObjectId(),
        warehouse: new mongoose.Types.ObjectId(),
        quantity: 100,
        minStockLevel: 10,
        maxStockLevel: 100
      });
      
      await expect(duplicateInventory.save()).rejects.toThrow();
    });
    
    it('should fail with invalid inventoryID format', async () => {
      const invalidInventory = new Inventory({
        inventoryID: 'INVALID',  // Not matching IN-XXXXX pattern
        product: new mongoose.Types.ObjectId(),
        warehouse: new mongoose.Types.ObjectId(),
        quantity: 100,
        minStockLevel: 10,
        maxStockLevel: 100
      });
      
      await expect(invalidInventory.save()).rejects.toThrow();
    });
    
    it('should fail without required product', async () => {
      const invalidInventory = new Inventory({
        inventoryID: 'IN-00001',
        // product is missing
        warehouse: new mongoose.Types.ObjectId(),
        quantity: 100,
        minStockLevel: 10,
        maxStockLevel: 100
      });
      
      await expect(invalidInventory.save()).rejects.toThrow();
    });
    
    it('should fail without required warehouse', async () => {
      const invalidInventory = new Inventory({
        inventoryID: 'IN-00001',
        product: new mongoose.Types.ObjectId(),
        // warehouse is missing
        quantity: 100,
        minStockLevel: 10,
        maxStockLevel: 100
      });
      
      await expect(invalidInventory.save()).rejects.toThrow();
    });
    
    it('should fail with negative quantity', async () => {
      const invalidInventory = new Inventory({
        inventoryID: 'IN-00001',
        product: new mongoose.Types.ObjectId(),
        warehouse: new mongoose.Types.ObjectId(),
        quantity: -10,  // Negative quantity
        minStockLevel: 10,
        maxStockLevel: 100
      });
      
      await expect(invalidInventory.save()).rejects.toThrow();
    });
  });
  
  describe('Status Validation', () => {
    it('should accept valid status values', async () => {
      const validStatuses = ['In Stock', 'Low Stock', 'Out of Stock', 'Overstocked'];
      
      for (const status of validStatuses) {
        const inventory = new Inventory({
          inventoryID: `IN-0000${validStatuses.indexOf(status) + 1}`,
          product: new mongoose.Types.ObjectId(),
          warehouse: new mongoose.Types.ObjectId(),
          quantity: 100,
          minStockLevel: 10,
          maxStockLevel: 100
          // Not setting stockStatus directly, as it's computed based on quantity and stock levels
        });
        
        // Set quantity to trigger different stock statuses
        if (status === 'Low Stock') {
          inventory.quantity = 5; // Below minStockLevel
        } else if (status === 'Out of Stock') {
          inventory.quantity = 0;
        } else if (status === 'Overstocked') {
          inventory.quantity = 200; // Above maxStockLevel
        }
        
        const savedInventory = await inventory.save();
        
        // Verify the status is set correctly by the pre-save hook
        if (inventory.quantity === 0) {
          expect(savedInventory.stockStatus).toBe('Out of Stock');
        } else if (inventory.quantity < inventory.minStockLevel) {
          expect(savedInventory.stockStatus).toBe('Low Stock');
        } else if (inventory.quantity > inventory.maxStockLevel) {
          expect(savedInventory.stockStatus).toBe('Overstocked');
        } else {
          expect(savedInventory.stockStatus).toBe('In Stock');
        }
      }
    });
    
    it('should default to In Stock status if not provided', async () => {
      const inventory = new Inventory({
        inventoryID: 'IN-00001',
        product: new mongoose.Types.ObjectId(),
        warehouse: new mongoose.Types.ObjectId(),
        quantity: 100,
        minStockLevel: 10,
        maxStockLevel: 100
        // stockStatus not provided
      });
      
      const savedInventory = await inventory.save();
      expect(savedInventory.stockStatus).toBe('In Stock');
    });
    
    it('should reject invalid status values', async () => {
      const inventory = new Inventory({
        inventoryID: 'IN-00001',
        product: new mongoose.Types.ObjectId(),
        warehouse: new mongoose.Types.ObjectId(),
        quantity: 100,
        minStockLevel: 10,
        maxStockLevel: 100,
        stockStatus: 'InvalidStatus'  // Invalid status
      });
      
      // Modify the test to expect a validation error
      try {
        await inventory.validate();
        // If validation passes, fail the test
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.errors.stockStatus).toBeDefined();
      }
    });
  });
  
  describe('Timestamps', () => {
    it('should set createdAt and updatedAt timestamps', async () => {
      const inventory = new Inventory({
        inventoryID: 'IN-00001',
        product: new mongoose.Types.ObjectId(),
        warehouse: new mongoose.Types.ObjectId(),
        quantity: 100,
        minStockLevel: 10,
        maxStockLevel: 100
      });
      
      const savedInventory = await inventory.save();
      
      expect(savedInventory.createdAt).toBeInstanceOf(Date);
      expect(savedInventory.updatedAt).toBeInstanceOf(Date);
    });
    
    it('should update the updatedAt timestamp on update', async () => {
      const inventory = new Inventory({
        inventoryID: 'IN-00001',
        product: new mongoose.Types.ObjectId(),
        warehouse: new mongoose.Types.ObjectId(),
        quantity: 100,
        minStockLevel: 10,
        maxStockLevel: 100
      });
      
      const savedInventory = await inventory.save();
      const originalUpdatedAt = savedInventory.updatedAt;
      
      // Wait a bit to ensure the timestamp changes
      await new Promise(resolve => setTimeout(resolve, 100));
      
      savedInventory.quantity = 90;
      await savedInventory.save();
      
      expect(savedInventory.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});
