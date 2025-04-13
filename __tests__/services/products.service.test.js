const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Product = require('../../src/models/product.model');
const productService = require('../../src/services/products.service');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

beforeEach(async () => {
  // Setup test products
  const supplierId = new mongoose.Types.ObjectId();
  await Product.create([
    {
      productID: 'PR-00001',
      name: 'Laptop',
      description: 'High-performance laptop',
      price: 999.99,
      category: 'Electronics',
      supplier: supplierId,
      stockQuantity: 50,
      reorderLevel: 10,
      status: 'Active'
    },
    {
      productID: 'PR-00002',
      name: 'Smartphone',
      description: 'Latest smartphone model',
      price: 699.99,
      category: 'Electronics',
      supplier: supplierId,
      stockQuantity: 100,
      reorderLevel: 20,
      status: 'Active'
    },
    {
      productID: 'PR-00003',
      name: 'Discontinued Product',
      description: 'This product is no longer available',
      price: 199.99,
      category: 'Electronics',
      supplier: supplierId,
      stockQuantity: 0,
      reorderLevel: 10,
      status: 'Discontinued'
    }
  ]);
});

afterEach(async () => {
  await Product.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Display available service methods for debugging
console.log('Available product service methods:', Object.keys(productService));

describe('Product Service', () => {
  describe('getProductByIdService', () => {
    it('should return a product by MongoDB ID', async () => {
      const existingProduct = await Product.findOne({ name: 'Laptop' });
      
      const product = await productService.getProductByIdService(existingProduct._id);
      
      expect(product).not.toBeNull();
      expect(product.name).toBe('Laptop');
      expect(product.productID).toBe('PR-00001');
    });

    it('should return null for non-existent ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const product = await productService.getProductByIdService(nonExistentId);
      
      expect(product).toBeNull();
    });
  });

  describe('getProductByProductIDService', () => {
    it('should return a product by productID (PR-xxxxx format)', async () => {
      const product = await productService.getProductByProductIDService('PR-00002');
      
      expect(product).not.toBeNull();
      expect(product.name).toBe('Smartphone');
    });

    it('should return null for non-existent productID', async () => {
      const product = await productService.getProductByProductIDService('PR-99999');
      
      expect(product).toBeNull();
    });
  });

  describe('createProductService', () => {
    it('should create a new product', async () => {
      const newProductData = {
        productID: 'PR-00004',
        name: 'New Product',
        description: 'Brand new product',
        price: 49.99,
        category: 'Accessories',
        supplier: new mongoose.Types.ObjectId(),
        stockQuantity: 200,
        reorderLevel: 30
      };
      
      const newProduct = await productService.createProductService(newProductData);
      
      expect(newProduct).not.toBeNull();
      expect(newProduct.productID).toBe('PR-00004');
      expect(newProduct.name).toBe('New Product');
      expect(newProduct.price).toBe(49.99);
      
      // Verify it was saved to the database
      const savedProduct = await Product.findOne({ productID: 'PR-00004' });
      expect(savedProduct).not.toBeNull();
    });
  });

  describe('updateProductService', () => {
    it('should update product fields', async () => {
      const existingProduct = await Product.findOne({ name: 'Laptop' });
      
      const updatedProduct = await productService.updateProductService(existingProduct._id, {
        name: 'Updated Laptop',
        price: 1099.99,
        stockQuantity: 60
      });
      
      expect(updatedProduct.name).toBe('Updated Laptop');
      expect(updatedProduct.price).toBe(1099.99);
      expect(updatedProduct.stockQuantity).toBe(60);
      expect(updatedProduct.productID).toBe('PR-00001'); // unchanged
    });

    it('should return null for non-existent product', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const result = await productService.updateProductService(nonExistentId, { name: 'Test' });
      
      expect(result).toBeNull();
    });
  });

  describe('deleteProductService', () => {
    it('should delete a product by ID', async () => {
      const existingProduct = await Product.findOne({ name: 'Smartphone' });
      
      const deletedProduct = await productService.deleteProductService(existingProduct._id);
      
      expect(deletedProduct).not.toBeNull();
      expect(deletedProduct.name).toBe('Smartphone');
      
      // Verify product is deleted
      const productAfterDelete = await Product.findById(existingProduct._id);
      expect(productAfterDelete).toBeNull();
    });
  });

  describe('getAllProductsService', () => {
    it('should return all products with pagination', async () => {
      const result = await productService.getAllProductsService();
      
      expect(result.products.length).toBe(3);
      expect(result.pagination).toBeDefined();
    });

    it('should apply status filter', async () => {
      const result = await productService.getAllProductsService({ status: 'Discontinued' });
      
      expect(result.products.length).toBe(1);
      expect(result.products[0].name).toBe('Discontinued Product');
    });

    it('should apply category filter', async () => {
      const result = await productService.getAllProductsService({ category: 'Electronics' });
      
      expect(result.products.length).toBe(3);
    });

    it('should apply sorting', async () => {
      const result = await productService.getAllProductsService({ sort: '-price' }); // descending price
      
      expect(result.products[0].name).toBe('Laptop');
      expect(result.products[2].name).toBe('Discontinued Product');
    });
  });

  describe('searchProductsService', () => {
    it('should search products by term', async () => {
      const result = await productService.searchProductsService('laptop');
      
      expect(result.products.length).toBe(1);
      expect(result.products[0].name).toBe('Laptop');
    });

    it('should return empty array for no matches', async () => {
      const result = await productService.searchProductsService('nonexistent');
      
      expect(result.products.length).toBe(0);
    });

    it('should match partial terms', async () => {
      const result = await productService.searchProductsService('smart');
      
      expect(result.products.length).toBe(1);
      expect(result.products[0].name).toBe('Smartphone');
    });
  });

  describe('getProductsByCategoryService', () => {
    it('should return products filtered by category', async () => {
      const result = await productService.getProductsByCategoryService('Electronics');
      
      expect(result.products.length).toBe(3);
    });

    it('should handle empty results', async () => {
      const result = await productService.getProductsByCategoryService('Clothing');
      
      expect(result.products.length).toBe(0);
    });
  });

  describe('getProductsByStatusService', () => {
    it('should return products filtered by status', async () => {
      const result = await productService.getProductsByStatusService('Discontinued');
      
      expect(result.products.length).toBe(1);
      expect(result.products[0].name).toBe('Discontinued Product');
    });

    it('should handle empty results', async () => {
      const result = await productService.getProductsByStatusService('Out of Stock');
      
      expect(result.products.length).toBe(0);
    });
  });

  describe('generateProductIdService', () => {
    it('should generate sequential product IDs', async () => {
      // Next ID should be PR-00004
      const nextId = await productService.generateProductIdService();
      expect(nextId).toBe('PR-00004');
      
      // Create another product
      await Product.create({
        productID: nextId,
        name: 'Next Product',
        description: 'Next test product',
        price: 29.99,
        category: 'Accessories',
        supplier: new mongoose.Types.ObjectId(),
        stockQuantity: 50
      });
      
      // Next ID should now be PR-00005
      const nextNextId = await productService.generateProductIdService();
      expect(nextNextId).toBe('PR-00005');
    });
  });
});
