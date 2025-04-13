const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Warehouse = require('../../src/models/warehouse.model');
const warehouseService = require('../../src/services/warehouses.service');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

beforeEach(async () => {
  // Setup test warehouses
  await Warehouse.create([
    {
      warehouseID: 'WH-00001',
      name: 'Main Warehouse',
      address: {
        street: '123 Main St',
        city: 'Main City',
        state: 'Main State',
        postalCode: '12345',
        country: 'Main Country'
      },
      capacity: 10000,
      usedCapacity: 5000,
      manager: new mongoose.Types.ObjectId(),
      status: 'Active'
    },
    {
      warehouseID: 'WH-00002',
      name: 'Secondary Warehouse',
      address: {
        street: '456 Secondary St',
        city: 'Secondary City',
        state: 'Secondary State',
        postalCode: '54321',
        country: 'Secondary Country'
      },
      capacity: 8000,
      usedCapacity: 1000,
      manager: new mongoose.Types.ObjectId(),
      status: 'Active'
    },
    {
      warehouseID: 'WH-00003',
      name: 'Inactive Warehouse',
      address: {
        street: '789 Inactive St',
        city: 'Inactive City',
        state: 'Inactive State',
        postalCode: '67890',
        country: 'Inactive Country'
      },
      capacity: 5000,
      usedCapacity: 0,
      manager: new mongoose.Types.ObjectId(),
      status: 'Inactive'
    }
  ]);
});

afterEach(async () => {
  await Warehouse.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Display available service methods for debugging
console.log('Available warehouse service methods:', Object.keys(warehouseService));

describe('Warehouse Service', () => {
  describe('getWarehouseByIdService', () => {
    it('should return a warehouse by MongoDB ID', async () => {
      const existingWarehouse = await Warehouse.findOne({ name: 'Main Warehouse' });
      
      const warehouse = await warehouseService.getWarehouseByIdService(existingWarehouse._id);
      
      expect(warehouse).not.toBeNull();
      expect(warehouse.name).toBe('Main Warehouse');
      expect(warehouse.warehouseID).toBe('WH-00001');
    });

    it('should return null for non-existent ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const warehouse = await warehouseService.getWarehouseByIdService(nonExistentId);
      
      expect(warehouse).toBeNull();
    });
  });

  describe('getWarehouseByWarehouseIDService', () => {
    it('should return a warehouse by warehouseID (WH-xxxxx format)', async () => {
      const warehouse = await warehouseService.getWarehouseByWarehouseIDService('WH-00002');
      
      expect(warehouse).not.toBeNull();
      expect(warehouse.name).toBe('Secondary Warehouse');
    });

    it('should return null for non-existent warehouseID', async () => {
      const warehouse = await warehouseService.getWarehouseByWarehouseIDService('WH-99999');
      
      expect(warehouse).toBeNull();
    });
  });

  describe('createWarehouseService', () => {
    it('should create a new warehouse', async () => {
      const newWarehouseData = {
        warehouseID: 'WH-00004',
        name: 'New Warehouse',
        address: {
          street: '111 New St',
          city: 'New City',
          state: 'New State',
          postalCode: '11111',
          country: 'New Country'
        },
        capacity: 12000,
        manager: new mongoose.Types.ObjectId()
      };
      
      const newWarehouse = await warehouseService.createWarehouseService(newWarehouseData);
      
      expect(newWarehouse).not.toBeNull();
      expect(newWarehouse.warehouseID).toBe('WH-00004');
      expect(newWarehouse.name).toBe('New Warehouse');
      expect(newWarehouse.capacity).toBe(12000);
      
      // Verify it was saved to the database
      const savedWarehouse = await Warehouse.findOne({ warehouseID: 'WH-00004' });
      expect(savedWarehouse).not.toBeNull();
    });
  });

  describe('updateWarehouseService', () => {
    it('should update warehouse fields', async () => {
      const existingWarehouse = await Warehouse.findOne({ name: 'Main Warehouse' });
      
      const updatedWarehouse = await warehouseService.updateWarehouseService(existingWarehouse._id, {
        name: 'Updated Main Warehouse',
        capacity: 15000,
        status: 'Maintenance'
      });
      
      expect(updatedWarehouse.name).toBe('Updated Main Warehouse');
      expect(updatedWarehouse.capacity).toBe(15000);
      expect(updatedWarehouse.status).toBe('Maintenance');
      expect(updatedWarehouse.warehouseID).toBe('WH-00001'); // unchanged
    });

    it('should return null for non-existent warehouse', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const result = await warehouseService.updateWarehouseService(nonExistentId, { name: 'Test' });
      
      expect(result).toBeNull();
    });
  });

  describe('deleteWarehouseService', () => {
    it('should delete a warehouse by ID', async () => {
      const existingWarehouse = await Warehouse.findOne({ name: 'Secondary Warehouse' });
      
      const deletedWarehouse = await warehouseService.deleteWarehouseService(existingWarehouse._id);
      
      expect(deletedWarehouse).not.toBeNull();
      expect(deletedWarehouse.name).toBe('Secondary Warehouse');
      
      // Verify warehouse is deleted
      const warehouseAfterDelete = await Warehouse.findById(existingWarehouse._id);
      expect(warehouseAfterDelete).toBeNull();
    });
  });

  describe('getAllWarehousesService', () => {
    it('should return all warehouses with pagination', async () => {
      const result = await warehouseService.getAllWarehousesService();
      
      expect(result.warehouses.length).toBe(3);
      expect(result.pagination).toBeDefined();
    });

    it('should apply status filter', async () => {
      const result = await warehouseService.getAllWarehousesService({ status: 'Inactive' });
      
      expect(result.warehouses.length).toBe(1);
      expect(result.warehouses[0].name).toBe('Inactive Warehouse');
    });

    it('should apply city filter', async () => {
      const result = await warehouseService.getAllWarehousesService({ city: 'Main City' });
      
      expect(result.warehouses.length).toBe(1);
      expect(result.warehouses[0].name).toBe('Main Warehouse');
    });

    it('should apply sorting', async () => {
      const result = await warehouseService.getAllWarehousesService({ sort: '-capacity' }); // descending capacity
      
      expect(result.warehouses[0].name).toBe('Main Warehouse');
      expect(result.warehouses[2].name).toBe('Inactive Warehouse');
    });
  });

  describe('searchWarehousesService', () => {
    it('should search warehouses by term', async () => {
      const result = await warehouseService.searchWarehousesService('main');
      
      expect(result.warehouses.length).toBe(1);
      expect(result.warehouses[0].name).toBe('Main Warehouse');
    });

    it('should return empty array for no matches', async () => {
      const result = await warehouseService.searchWarehousesService('nonexistent');
      
      expect(result.warehouses.length).toBe(0);
    });

    it('should match partial terms', async () => {
      const result = await warehouseService.searchWarehousesService('second');
      
      expect(result.warehouses.length).toBe(1);
      expect(result.warehouses[0].name).toBe('Secondary Warehouse');
    });
  });

  describe('getWarehousesByStatusService', () => {
    it('should return warehouses filtered by status', async () => {
      const result = await warehouseService.getWarehousesByStatusService('Inactive');
      
      expect(result.warehouses.length).toBe(1);
      expect(result.warehouses[0].name).toBe('Inactive Warehouse');
    });

    it('should handle empty results', async () => {
      const result = await warehouseService.getWarehousesByStatusService('Maintenance');
      
      expect(result.warehouses.length).toBe(0);
    });
  });

  describe('generateWarehouseIdService', () => {
    it('should generate sequential warehouse IDs', async () => {
      // Next ID should be WH-00004
      const nextId = await warehouseService.generateWarehouseIdService();
      expect(nextId).toBe('WH-00004');
      
      // Create another warehouse
      await Warehouse.create({
        warehouseID: nextId,
        name: 'Next Warehouse',
        address: {
          street: '123 Next St',
          city: 'Next City',
          state: 'Next State',
          postalCode: '12345',
          country: 'Next Country'
        },
        capacity: 7000,
        manager: new mongoose.Types.ObjectId()
      });
      
      // Next ID should now be WH-00005
      const nextNextId = await warehouseService.generateWarehouseIdService();
      expect(nextNextId).toBe('WH-00005');
    });
  });
});
