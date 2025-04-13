const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Product = require('../../src/models/product.model');

let mongoServer;

// Connect to a new in-memory database before running tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

// Clear database after each test
afterEach(async () => {
  await Product.deleteMany({});
});

// Disconnect and close database after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Product Model', () => {
  describe('Schema Validation', () => {
    it('should create a valid product', async () => {
      const productData = {
        productID: 'PR-00001',
        name: 'Test Product',
        description: 'This is a test product',
        price: 29.99,
        category: 'Electronics',
        supplier: new mongoose.Types.ObjectId(),
        stockQuantity: 100,
        reorderLevel: 10,
        status: 'Active'
      };
      
      const validProduct = new Product(productData);
      const savedProduct = await validProduct.save();
      
      // Verify saved product
      expect(savedProduct._id).toBeDefined();
      expect(savedProduct.productID).toBe(productData.productID);
      expect(savedProduct.name).toBe(productData.name);
      expect(savedProduct.description).toBe(productData.description);
      expect(savedProduct.price).toBe(productData.price);
      expect(savedProduct.category).toBe(productData.category);
      expect(savedProduct.supplier.toString()).toBe(productData.supplier.toString());
      expect(savedProduct.stockQuantity).toBe(productData.stockQuantity);
      expect(savedProduct.reorderLevel).toBe(productData.reorderLevel);
      expect(savedProduct.status).toBe(productData.status);
      expect(savedProduct.createdAt).toBeDefined();
      expect(savedProduct.updatedAt).toBeDefined();
    });
    
    it('should fail on duplicate productID', async () => {
      // Create first product
      await new Product({
        productID: 'PR-00001',
        name: 'First Product',
        description: 'First test product',
        price: 19.99,
        category: 'Electronics',
        supplier: new mongoose.Types.ObjectId(),
        stockQuantity: 50
      }).save();
      
      // Try to create a second product with same productID
      const duplicateProduct = new Product({
        productID: 'PR-00001',
        name: 'Second Product',
        description: 'Second test product',
        price: 29.99,
        category: 'Electronics',
        supplier: new mongoose.Types.ObjectId(),
        stockQuantity: 100
      });
      
      await expect(duplicateProduct.save()).rejects.toThrow();
    });
    
    it('should fail with invalid productID format', async () => {
      const invalidProduct = new Product({
        productID: 'INVALID',  // Not matching PR-XXXXX pattern
        name: 'Test Product',
        description: 'This is a test product',
        price: 29.99,
        category: 'Electronics',
        supplier: new mongoose.Types.ObjectId(),
        stockQuantity: 100
      });
      
      await expect(invalidProduct.save()).rejects.toThrow();
    });
    
    it('should fail without required name', async () => {
      const invalidProduct = new Product({
        productID: 'PR-00001',
        // name is missing
        description: 'This is a test product',
        price: 29.99,
        category: 'Electronics',
        supplier: new mongoose.Types.ObjectId(),
        stockQuantity: 100
      });
      
      await expect(invalidProduct.save()).rejects.toThrow();
    });
    
    it('should fail with negative price', async () => {
      const invalidProduct = new Product({
        productID: 'PR-00001',
        name: 'Test Product',
        description: 'This is a test product',
        price: -10.99,  // Negative price
        category: 'Electronics',
        supplier: new mongoose.Types.ObjectId(),
        stockQuantity: 100
      });
      
      await expect(invalidProduct.save()).rejects.toThrow();
    });
    
    it('should fail with negative stock quantity', async () => {
      const invalidProduct = new Product({
        productID: 'PR-00001',
        name: 'Test Product',
        description: 'This is a test product',
        price: 29.99,
        category: 'Electronics',
        supplier: new mongoose.Types.ObjectId(),
        stockQuantity: -5  // Negative stock
      });
      
      await expect(invalidProduct.save()).rejects.toThrow();
    });
  });
  
  describe('Status Validation', () => {
    it('should accept valid status values', async () => {
      const validStatuses = ['Active', 'Inactive', 'Discontinued', 'Out of Stock'];
      
      for (const status of validStatuses) {
        const product = new Product({
          productID: `PR-0000${validStatuses.indexOf(status) + 1}`,
          name: `${status} Product`,
          description: `Product with ${status} status`,
          price: 29.99,
          category: 'Electronics',
          supplier: new mongoose.Types.ObjectId(),
          stockQuantity: 100,
          status: status
        });
        
        const savedProduct = await product.save();
        expect(savedProduct.status).toBe(status);
      }
    });
    
    it('should default to Active status if not provided', async () => {
      const product = new Product({
        productID: 'PR-00001',
        name: 'Test Product',
        description: 'This is a test product',
        price: 29.99,
        category: 'Electronics',
        supplier: new mongoose.Types.ObjectId(),
        stockQuantity: 100
        // status not provided
      });
      
      const savedProduct = await product.save();
      expect(savedProduct.status).toBe('Active');
    });
    
    it('should reject invalid status values', async () => {
      const product = new Product({
        productID: 'PR-00001',
        name: 'Test Product',
        description: 'This is a test product',
        price: 29.99,
        category: 'Electronics',
        supplier: new mongoose.Types.ObjectId(),
        stockQuantity: 100,
        status: 'InvalidStatus'
      });
      
      await expect(product.save()).rejects.toThrow();
    });
  });
  
  describe('Timestamps', () => {
    it('should set createdAt and updatedAt timestamps', async () => {
      const product = new Product({
        productID: 'PR-00001',
        name: 'Test Product',
        description: 'This is a test product',
        price: 29.99,
        category: 'Electronics',
        supplier: new mongoose.Types.ObjectId(),
        stockQuantity: 100
      });
      
      const savedProduct = await product.save();
      
      expect(savedProduct.createdAt).toBeInstanceOf(Date);
      expect(savedProduct.updatedAt).toBeInstanceOf(Date);
    });
    
    it('should update the updatedAt timestamp on update', async () => {
      const product = new Product({
        productID: 'PR-00001',
        name: 'Test Product',
        description: 'This is a test product',
        price: 29.99,
        category: 'Electronics',
        supplier: new mongoose.Types.ObjectId(),
        stockQuantity: 100
      });
      
      const savedProduct = await product.save();
      const originalUpdatedAt = savedProduct.updatedAt;
      
      // Wait a bit to ensure the timestamp changes
      await new Promise(resolve => setTimeout(resolve, 100));
      
      savedProduct.name = 'Updated Product';
      await savedProduct.save();
      
      expect(savedProduct.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});
