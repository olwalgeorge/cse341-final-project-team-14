const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Warehouse = require('../../src/models/warehouse.model');

let mongoServer;

// Connect to a new in-memory database before running tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

// Clear database after each test
afterEach(async () => {
  await Warehouse.deleteMany({});
});

// Disconnect and close database after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Warehouse Model', () => {
  describe('Schema Validation', () => {
    it('should create a valid warehouse', async () => {
      const warehouseData = {
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
        manager: new mongoose.Types.ObjectId(),
        status: 'Active'
      };
      
      const validWarehouse = new Warehouse(warehouseData);
      const savedWarehouse = await validWarehouse.save();
      
      // Verify saved warehouse
      expect(savedWarehouse._id).toBeDefined();
      expect(savedWarehouse.warehouseID).toBe(warehouseData.warehouseID);
      expect(savedWarehouse.name).toBe(warehouseData.name);
      expect(savedWarehouse.address.city).toBe(warehouseData.address.city);
      expect(savedWarehouse.capacity).toBe(warehouseData.capacity);
      expect(savedWarehouse.manager.toString()).toBe(warehouseData.manager.toString());
      expect(savedWarehouse.status).toBe(warehouseData.status);
      expect(savedWarehouse.createdAt).toBeDefined();
      expect(savedWarehouse.updatedAt).toBeDefined();
    });
    
    it('should fail on duplicate warehouseID', async () => {
      // Create first warehouse
      await new Warehouse({
        warehouseID: 'WH-00001',
        name: 'First Warehouse',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        },
        capacity: 5000,
        manager: new mongoose.Types.ObjectId()
      }).save();
      
      // Try to create a second warehouse with same warehouseID
      const duplicateWarehouse = new Warehouse({
        warehouseID: 'WH-00001',
        name: 'Second Warehouse',
        address: {
          street: '456 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        },
        capacity: 10000,
        manager: new mongoose.Types.ObjectId()
      });
      
      await expect(duplicateWarehouse.save()).rejects.toThrow();
    });
    
    it('should fail with invalid warehouseID format', async () => {
      const invalidWarehouse = new Warehouse({
        warehouseID: 'INVALID',  // Not matching WH-XXXXX pattern
        name: 'Test Warehouse',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        },
        capacity: 10000,
        manager: new mongoose.Types.ObjectId()
      });
      
      await expect(invalidWarehouse.save()).rejects.toThrow();
    });
    
    it('should fail without required name', async () => {
      const invalidWarehouse = new Warehouse({
        warehouseID: 'WH-00001',
        // name is missing
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        },
        capacity: 10000,
        manager: new mongoose.Types.ObjectId()
      });
      
      await expect(invalidWarehouse.save()).rejects.toThrow();
    });
    
    it('should fail with negative capacity', async () => {
      const invalidWarehouse = new Warehouse({
        warehouseID: 'WH-00001',
        name: 'Test Warehouse',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        },
        capacity: -1000,  // Negative capacity
        manager: new mongoose.Types.ObjectId()
      });
      
      await expect(invalidWarehouse.save()).rejects.toThrow();
    });
  });
  
  describe('Status Validation', () => {
    it('should accept valid status values', async () => {
      const validStatuses = ['Active', 'Inactive', 'Maintenance', 'Full'];
      
      for (const status of validStatuses) {
        const warehouse = new Warehouse({
          warehouseID: `WH-0000${validStatuses.indexOf(status) + 1}`,
          name: `${status} Warehouse`,
          address: {
            street: '123 Test St',
            city: 'Test City',
            state: 'Test State',
            postalCode: '12345',
            country: 'Test Country'
          },
          capacity: 10000,
          manager: new mongoose.Types.ObjectId(),
          status: status
        });
        
        const savedWarehouse = await warehouse.save();
        expect(savedWarehouse.status).toBe(status);
      }
    });
    
    it('should default to Active status if not provided', async () => {
      const warehouse = new Warehouse({
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
        manager: new mongoose.Types.ObjectId()
        // status not provided
      });
      
      const savedWarehouse = await warehouse.save();
      expect(savedWarehouse.status).toBe('Active');
    });
    
    it('should reject invalid status values', async () => {
      const warehouse = new Warehouse({
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
        manager: new mongoose.Types.ObjectId(),
        status: 'InvalidStatus'
      });
      
      await expect(warehouse.save()).rejects.toThrow();
    });
  });
  
  describe('Timestamps', () => {
    it('should set createdAt and updatedAt timestamps', async () => {
      const warehouse = new Warehouse({
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
        manager: new mongoose.Types.ObjectId()
      });
      
      const savedWarehouse = await warehouse.save();
      
      expect(savedWarehouse.createdAt).toBeInstanceOf(Date);
      expect(savedWarehouse.updatedAt).toBeInstanceOf(Date);
    });
    
    it('should update the updatedAt timestamp on update', async () => {
      const warehouse = new Warehouse({
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
        manager: new mongoose.Types.ObjectId()
      });
      
      const savedWarehouse = await warehouse.save();
      const originalUpdatedAt = savedWarehouse.updatedAt;
      
      // Wait a bit to ensure the timestamp changes
      await new Promise(resolve => setTimeout(resolve, 100));
      
      savedWarehouse.name = 'Updated Warehouse';
      await savedWarehouse.save();
      
      expect(savedWarehouse.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});
