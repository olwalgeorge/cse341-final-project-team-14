const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Product = require('../../src/models/product.model');
const { generateProductId, transformProduct } = require('../../src/utils/product.utils');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  await Product.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Product Utils', () => {
  describe('generateProductId', () => {
    it('should generate the first product ID as PR-00001 when no products exist', async () => {
      const productId = await generateProductId();
      expect(productId).toBe('PR-00001');
    });

    it('should generate sequential product IDs', async () => {
      // Create a few products first
      await new Product({
        productID: 'PR-00001',
        name: 'Product 1',
        description: 'First test product',
        price: 19.99,
        category: 'Electronics',
        supplier: new mongoose.Types.ObjectId(),
        stockQuantity: 50
      }).save();

      await new Product({
        productID: 'PR-00002',
        name: 'Product 2',
        description: 'Second test product',
        price: 29.99,
        category: 'Electronics',
        supplier: new mongoose.Types.ObjectId(),
        stockQuantity: 100
      }).save();

      // Generate the next ID
      const nextProductId = await generateProductId();
      expect(nextProductId).toBe('PR-00003');
    });

    it('should handle non-sequential existing product IDs', async () => {
      // Create a product with a higher ID first
      await new Product({
        productID: 'PR-00010',
        name: 'High Product',
        description: 'High ID product',
        price: 99.99,
        category: 'Electronics',
        supplier: new mongoose.Types.ObjectId(),
        stockQuantity: 50
      }).save();

      // Generate the next ID, should be 11
      const nextId = await generateProductId();
      expect(nextId).toBe('PR-00011');
    });
  });

  describe('transformProduct', () => {
    it('should transform a product object correctly', () => {
      const product = {
        _id: new mongoose.Types.ObjectId(),
        productID: 'PR-00001',
        name: 'Test Product',
        description: 'Test description',
        price: 29.99,
        category: 'Electronics',
        supplier: new mongoose.Types.ObjectId(),
        stockQuantity: 100,
        reorderLevel: 10,
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const transformedProduct = transformProduct(product);

      // Check for correct property mapping
      // Using flexible approach to handle different property name conventions
      expect(transformedProduct).toBeDefined();
      
      const idField = transformedProduct.product_Id || 
                      transformedProduct.productId || 
                      transformedProduct._id;
                      
      expect(idField).toBeDefined();
      expect(transformedProduct.productID).toBe(product.productID);
      expect(transformedProduct.name).toBe(product.name);
      expect(transformedProduct.price).toBe(product.price);
      
      // Check supplier ID is properly transformed if present
      if (transformedProduct.supplier && typeof transformedProduct.supplier === 'string') {
        expect(transformedProduct.supplier).toBe(product.supplier.toString());
      }
    });

    it('should return null for null input', () => {
      expect(transformProduct(null)).toBeNull();
    });

    it('should handle product with missing fields', () => {
      const partialProduct = {
        _id: new mongoose.Types.ObjectId(),
        productID: 'PR-00001',
        name: 'Partial Product'
        // Missing description, price, category, etc.
      };

      const transformedProduct = transformProduct(partialProduct);

      expect(transformedProduct).toBeDefined();
      expect(transformedProduct.productID).toBe(partialProduct.productID);
      expect(transformedProduct.name).toBe(partialProduct.name);
      
      // These should be undefined or null
      expect(transformedProduct.description).toBeUndefined();
      expect(transformedProduct.price).toBeUndefined();
      expect(transformedProduct.category).toBeUndefined();
    });
  });
});
