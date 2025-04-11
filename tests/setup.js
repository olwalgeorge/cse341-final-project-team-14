const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Setup before all tests
beforeAll(async () => {
  // Create MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  // Connect to in-memory database
  await mongoose.connect(uri);
});

// Clear database between tests
beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Disconnect and close after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Mock user ID generator to return predictable values in tests
jest.mock('../src/utils/user.utils', () => {
  const originalModule = jest.requireActual('../src/utils/user.utils');
  return {
    ...originalModule,
    generateuserID: jest.fn(() => 'SM-00001')
  };
});

// Mock supplier ID generator
jest.mock('../src/utils/supplier.utils', () => {
  const originalModule = jest.requireActual('../src/utils/supplier.utils');
  return {
    ...originalModule,
    generateSupplierId: jest.fn(() => 'SP-00001')
  };
});

// Mock product ID generator
jest.mock('../src/utils/product.utils', () => {
  const originalModule = jest.requireActual('../src/utils/product.utils');
  return {
    ...originalModule,
    generateProductId: jest.fn(() => 'PR-00001')
  };
});

// Mock order ID generator
jest.mock('../src/utils/order.utils', () => {
  const originalModule = jest.requireActual('../src/utils/order.utils');
  return {
    ...originalModule,
    generateOrderId: jest.fn(() => 'OR-00001')
  };
});

// Mock purchase ID generator
jest.mock('../src/utils/purchase.utils', () => {
  const originalModule = jest.requireActual('../src/utils/purchase.utils');
  return {
    ...originalModule,
    generatePurchaseId: jest.fn(() => 'PU-00001')
  };
});

// Mock customer ID generator
jest.mock('../src/utils/customer.utils', () => {
  const originalModule = jest.requireActual('../src/utils/customer.utils');
  return {
    ...originalModule,
    generateCustomerId: jest.fn(() => 'CU-00001')
  };
});

// Mock inventory ID generator
jest.mock('../src/utils/inventory.utils', () => {
  const originalModule = jest.requireActual('../src/utils/inventory.utils');
  return {
    ...originalModule,
    generateInventoryId: jest.fn(() => 'IN-00001')
  };
});

// Mock warehouse ID generator
jest.mock('../src/utils/warehouse.utils', () => {
  const originalModule = jest.requireActual('../src/utils/warehouse.utils');
  return {
    ...originalModule,
    generateWarehouseId: jest.fn(() => 'WH-00001')
  };
});

// Mock inventory transaction ID generator
jest.mock('../src/utils/inventoryTransaction.utils', () => {
  const originalModule = jest.requireActual('../src/utils/inventoryTransaction.utils');
  return {
    ...originalModule,
    generateTransactionId: jest.fn(() => 'IT-00001')
  };
});