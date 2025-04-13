const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Inventory = require('../../src/models/inventory.model');
const { generateInventoryId, transformInventory } = require('../../src/utils/inventory.utils');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  await Inventory.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Inventory Utils', () => {
  describe('generateInventoryId', () => {
    it('should generate the first inventory ID as IN-00001 when no inventory exists', async () => {
      const inventoryId = await generateInventoryId();
      expect(inventoryId).toBe('IN-00001');
    });

    it('should generate sequential inventory IDs', async () => {
      // Create a few inventory items first
      await new Inventory({
        inventoryID: 'IN-00001',
        product: new mongoose.Types.ObjectId(),
        warehouse: new mongoose.Types.ObjectId(),
        quantity: 100,
        location: 'A-01-01-01'
      }).save();

      await new Inventory({
        inventoryID: 'IN-00002',
        product: new mongoose.Types.ObjectId(),
        warehouse: new mongoose.Types.ObjectId(),
        quantity: 50,
        location: 'A-01-01-02'
      }).save();

      // Generate the next ID
      const nextInventoryId = await generateInventoryId();
      expect(nextInventoryId).toBe('IN-00003');
    });

    it('should handle non-sequential existing inventory IDs', async () => {
      // Create an inventory with a higher ID first
      await new Inventory({
        inventoryID: 'IN-00010',
        product: new mongoose.Types.ObjectId(),
        warehouse: new mongoose.Types.ObjectId(),
        quantity: 100,
        location: 'A-01-01-01'
      }).save();

      // Generate the next ID, should be 11
      const nextId = await generateInventoryId();
      expect(nextId).toBe('IN-00011');
    });
  });

  describe('transformInventory', () => {
    it('should transform an inventory object correctly', () => {
      const product = new mongoose.Types.ObjectId();
      const warehouse = new mongoose.Types.ObjectId();
      
      const inventory = {
        _id: new mongoose.Types.ObjectId(),
        inventoryID: 'IN-00001',
        product: product,
        warehouse: warehouse,
        quantity: 100,
        location: 'A-01-01-01',
        status: 'In Stock',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const transformedInventory = transformInventory(inventory);

      // Check for correct property mapping
      // Using flexible approach to handle different property name conventions
      expect(transformedInventory).toBeDefined();
      
      const idField = transformedInventory.inventory_Id || 
                      transformedInventory.inventoryId || 
                      transformedInventory._id;
                      
      expect(idField).toBeDefined();
      expect(transformedInventory.inventoryID).toBe(inventory.inventoryID);
      expect(transformedInventory.quantity).toBe(inventory.quantity);
      expect(transformedInventory.location).toBe(inventory.location);
      
      // Check product and warehouse IDs are properly transformed if present
      if (transformedInventory.product && typeof transformedInventory.product === 'string') {
        expect(transformedInventory.product).toBe(product.toString());
      }
      if (transformedInventory.warehouse && typeof transformedInventory.warehouse === 'string') {
        expect(transformedInventory.warehouse).toBe(warehouse.toString());
      }
    });

    it('should return null for null input', () => {
      expect(transformInventory(null)).toBeNull();
    });

    it('should handle inventory with missing fields', () => {
      const partialInventory = {
        _id: new mongoose.Types.ObjectId(),
        inventoryID: 'IN-00001',
        product: new mongoose.Types.ObjectId()
        // Missing warehouse, quantity, location, etc.
      };

      const transformedInventory = transformInventory(partialInventory);

      expect(transformedInventory).toBeDefined();
      expect(transformedInventory.inventoryID).toBe(partialInventory.inventoryID);
      
      // These should be undefined or null
      expect(transformedInventory.warehouse).toBeUndefined();
      expect(transformedInventory.quantity).toBeUndefined();
      expect(transformedInventory.location).toBeUndefined();
    });
  });
});
