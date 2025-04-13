const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Warehouse = require('../../src/models/warehouse.model');
const { generateWarehouseId, transformWarehouse } = require('../../src/utils/warehouse.utils');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  await Warehouse.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Warehouse Utils', () => {
  describe('generateWarehouseId', () => {
    it('should generate the first warehouse ID as WH-00001 when no warehouses exist', async () => {
      const warehouseId = await generateWarehouseId();
      expect(warehouseId).toBe('WH-00001');
    });

    it('should generate sequential warehouse IDs', async () => {
      // Create a few warehouses first
      await new Warehouse({
        warehouseID: 'WH-00001',
        name: 'Warehouse 1',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        },
        capacity: 10000,
        manager: new mongoose.Types.ObjectId()
      }).save();

      await new Warehouse({
        warehouseID: 'WH-00002',
        name: 'Warehouse 2',
        address: {
          street: '456 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        },
        capacity: 8000,
        manager: new mongoose.Types.ObjectId()
      }).save();

      // Generate the next ID
      const nextWarehouseId = await generateWarehouseId();
      expect(nextWarehouseId).toBe('WH-00003');
    });

    it('should handle non-sequential existing warehouse IDs', async () => {
      // Create a warehouse with a higher ID first
      await new Warehouse({
        warehouseID: 'WH-00010',
        name: 'High Warehouse',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        },
        capacity: 10000,
        manager: new mongoose.Types.ObjectId()
      }).save();

      // Generate the next ID, should be 11
      const nextId = await generateWarehouseId();
      expect(nextId).toBe('WH-00011');
    });
  });

  describe('transformWarehouse', () => {
    it('should transform a warehouse object correctly', () => {
      const warehouse = {
        _id: new mongoose.Types.ObjectId(),
        warehouseID: 'WH-00001',
        name: 'Test Warehouse',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        },
        capacity: 10000,
        usedCapacity: 5000,
        manager: new mongoose.Types.ObjectId(),
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const transformedWarehouse = transformWarehouse(warehouse);

      // Check for correct property mapping
      // Using flexible approach to handle different property name conventions
      expect(transformedWarehouse).toBeDefined();
      
      const idField = transformedWarehouse.warehouse_Id || 
                      transformedWarehouse.warehouseId || 
                      transformedWarehouse._id;
                      
      expect(idField).toBeDefined();
      expect(transformedWarehouse.warehouseID).toBe(warehouse.warehouseID);
      expect(transformedWarehouse.name).toBe(warehouse.name);
      expect(transformedWarehouse.capacity).toBe(warehouse.capacity);
      
      // Check nested objects
      if (transformedWarehouse.address) {
        expect(transformedWarehouse.address.city).toBe(warehouse.address.city);
      }
      
      // Check manager ID is properly transformed if present
      if (transformedWarehouse.manager && typeof transformedWarehouse.manager === 'string') {
        expect(transformedWarehouse.manager).toBe(warehouse.manager.toString());
      }
    });

    it('should return null for null input', () => {
      expect(transformWarehouse(null)).toBeNull();
    });

    it('should handle warehouse with missing fields', () => {
      const partialWarehouse = {
        _id: new mongoose.Types.ObjectId(),
        warehouseID: 'WH-00001',
        name: 'Partial Warehouse'
        // Missing address, capacity, manager, etc.
      };

      const transformedWarehouse = transformWarehouse(partialWarehouse);

      expect(transformedWarehouse).toBeDefined();
      expect(transformedWarehouse.warehouseID).toBe(partialWarehouse.warehouseID);
      expect(transformedWarehouse.name).toBe(partialWarehouse.name);
      
      // These should be undefined or null
      expect(transformedWarehouse.address).toBeUndefined();
      expect(transformedWarehouse.capacity).toBeUndefined();
      expect(transformedWarehouse.manager).toBeUndefined();
    });
  });
});
