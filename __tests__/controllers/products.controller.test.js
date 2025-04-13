const mongoose = require('mongoose');
const productController = require('../../src/controllers/products.controller');
const productService = require('../../src/services/products.service');
//eslint-disable-next-line no-unused-vars
const { DatabaseError } = require('../../src/utils/errors');

// Log available methods to debug
console.log('Available controller methods:', Object.keys(productController));
console.log('Available service methods:', Object.keys(productService));

// Mock the product service
jest.mock('../../src/services/products.service');

// Mock the logger to prevent console output during tests
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

describe('Product Controller', () => {
  // Mock express request and response
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {},
      query: {},
      body: {},
      user: {
        _id: new mongoose.Types.ObjectId(),
        username: 'testuser',
        email: 'test@example.com',
        userID: 'SM-00001',
        role: 'ADMIN'
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('getProductById', () => {
    it('should return product by ID', async () => {
      req.params.product_Id = new mongoose.Types.ObjectId().toString();
      
      const mockProduct = {
        _id: req.params.product_Id,
        productID: 'PR-00001',
        name: 'Test Product',
        price: 29.99
      };
      
      productService.getProductByIdService.mockResolvedValue(mockProduct);
      
      await productController.getProductById(req, res, next);
      
      expect(productService.getProductByIdService).toHaveBeenCalledWith(req.params.product_Id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      expect(res.json.mock.calls[0][0].data).toBeDefined();
    });

    it('should call next with error if product not found', async () => {
      req.params.product_Id = new mongoose.Types.ObjectId().toString();
      
      productService.getProductByIdService.mockResolvedValue(null);
      
      await productController.getProductById(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    });
  });

  describe('getProductByProductId', () => {
    it('should return product by productID', async () => {
      req.params.productID = 'PR-00001';
      
      const mockProduct = {
        _id: new mongoose.Types.ObjectId(),
        productID: 'PR-00001',
        name: 'Test Product'
      };
      
      productService.getProductByProductIDService.mockResolvedValue(mockProduct);
      
      await productController.getProductByProductId(req, res, next);
      
      expect(productService.getProductByProductIDService).toHaveBeenCalledWith('PR-00001');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it('should handle non-existent productID', async () => {
      req.params.productID = 'PR-99999';
      
      productService.getProductByProductIDService.mockResolvedValue(null);
      
      await productController.getProductByProductId(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });

  describe.skip('createProduct', () => {
    it('should create and return a new product', async () => {
      req.body = {
        name: 'New Product',
        description: 'Brand new product',
        price: 49.99,
        category: 'Accessories',
        supplier: new mongoose.Types.ObjectId().toString(),
        stockQuantity: 200
      };
      
      const mockCreatedProduct = {
        _id: new mongoose.Types.ObjectId(),
        productID: 'PR-00001',
        name: 'New Product',
        price: 49.99
      };
      
      productService.createProductService.mockResolvedValue(mockCreatedProduct);
      
      await productController.createProduct(req, res, next);
      
      expect(productService.createProductService).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      req.body = {
        // Missing required name
        price: -10.99 // Invalid price
      };
      
      productService.createProductService.mockRejectedValue(new Error('Validation error'));
      
      await productController.createProduct(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });
  });

  describe('updateProductById', () => {
    it('should update and return product', async () => {
      req.params.product_Id = new mongoose.Types.ObjectId().toString();
      req.body = {
        name: 'Updated Product',
        price: 59.99
      };
      
      const mockUpdatedProduct = {
        _id: req.params.product_Id,
        productID: 'PR-00001',
        name: 'Updated Product',
        price: 59.99
      };
      
      productService.updateProductService.mockResolvedValue(mockUpdatedProduct);
      
      await productController.updateProductById(req, res, next);
      
      expect(productService.updateProductService).toHaveBeenCalledWith(req.params.product_Id, req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it('should handle non-existent product', async () => {
      req.params.product_Id = new mongoose.Types.ObjectId().toString();
      req.body = { name: 'Updated Name' };
      
      productService.updateProductService.mockResolvedValue(null);
      
      await productController.updateProductById(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });

  describe.skip('deleteProductById', () => {
    it('should delete product and return success', async () => {
      req.params.product_Id = new mongoose.Types.ObjectId().toString();
      
      const mockDeletedProduct = {
        _id: req.params.product_Id,
        productID: 'PR-00001',
        name: 'Test Product'
      };
      
      productService.deleteProductService.mockResolvedValue(mockDeletedProduct);
      
      await productController.deleteProductById(req, res, next);
      
      expect(productService.deleteProductService).toHaveBeenCalledWith(req.params.product_Id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it('should handle non-existent product', async () => {
      req.params.product_Id = new mongoose.Types.ObjectId().toString();
      
      productService.deleteProductService.mockResolvedValue(null);
      
      await productController.deleteProductById(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });

  describe('getAllProducts', () => {
    it('should return all products with pagination', async () => {
      const mockProducts = {
        products: [
          { _id: new mongoose.Types.ObjectId(), productID: 'PR-00001', name: 'Product 1' },
          { _id: new mongoose.Types.ObjectId(), productID: 'PR-00002', name: 'Product 2' }
        ],
        pagination: {
          totalResults: 2,
          totalPages: 1,
          currentPage: 1,
          limit: 10
        }
      };
      
      productService.getAllProductsService.mockResolvedValue(mockProducts);
      
      await productController.getAllProducts(req, res, next);
      
      expect(productService.getAllProductsService).toHaveBeenCalledWith(req.query);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].data.products.length).toBe(2);
      expect(res.json.mock.calls[0][0].data.pagination).toBeDefined();
    });

    it('should handle empty results', async () => {
      productService.getAllProductsService.mockResolvedValue({
        products: [],
        pagination: { totalResults: 0, totalPages: 0, currentPage: 1, limit: 10 }
      });
      
      await productController.getAllProducts(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].data.products.length).toBe(0);
    });
  });

  describe('getProductsByCategory', () => {
    it('should return products filtered by category', async () => {
      req.params.category = 'Electronics';
      
      const mockResult = {
        products: [
          { _id: new mongoose.Types.ObjectId(), productID: 'PR-00001', name: 'Product 1', category: 'Electronics' },
          { _id: new mongoose.Types.ObjectId(), productID: 'PR-00002', name: 'Product 2', category: 'Electronics' }
        ],
        pagination: {
          totalResults: 2,
          totalPages: 1,
          currentPage: 1,
          limit: 10
        }
      };
      
      productService.getProductsByCategoryService.mockResolvedValue(mockResult);
      
      await productController.getProductsByCategory(req, res, next);
      
      expect(productService.getProductsByCategoryService).toHaveBeenCalledWith('Electronics', req.query);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].data.products.length).toBe(2);
    });

    it('should handle empty results', async () => {
      req.params.category = 'Clothing';
      
      productService.getProductsByCategoryService.mockResolvedValue({
        products: [],
        pagination: { totalResults: 0, totalPages: 0, currentPage: 1, limit: 10 }
      });
      
      await productController.getProductsByCategory(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].message).toContain('No products found');
    });
  });

  describe('getProductsByStatus', () => {
    it('should return products filtered by status', async () => {
      req.params.status = 'Active';
      
      const mockResult = {
        products: [
          { _id: new mongoose.Types.ObjectId(), productID: 'PR-00001', name: 'Product 1', status: 'Active' },
          { _id: new mongoose.Types.ObjectId(), productID: 'PR-00002', name: 'Product 2', status: 'Active' }
        ],
        pagination: {
          totalResults: 2,
          totalPages: 1,
          currentPage: 1,
          limit: 10
        }
      };
      
      productService.getProductsByStatusService.mockResolvedValue(mockResult);
      
      await productController.getProductsByStatus(req, res, next);
      
      expect(productService.getProductsByStatusService).toHaveBeenCalledWith('Active', req.query);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].data.products.length).toBe(2);
    });

    it('should handle empty results', async () => {
      req.params.status = 'Out of Stock';
      
      productService.getProductsByStatusService.mockResolvedValue({
        products: [],
        pagination: { totalResults: 0, totalPages: 0, currentPage: 1, limit: 10 }
      });
      
      await productController.getProductsByStatus(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].message).toContain('No products found');
    });
  });

  describe('searchProducts', () => {
    it('should search products by term', async () => {
      req.query.term = 'laptop';
      
      const mockResult = {
        products: [
          { _id: new mongoose.Types.ObjectId(), productID: 'PR-00001', name: 'Laptop' }
        ],
        pagination: {
          totalResults: 1,
          totalPages: 1,
          currentPage: 1,
          limit: 10
        }
      };
      
      productService.searchProductsService.mockResolvedValue(mockResult);
      
      await productController.searchProducts(req, res, next);
      
      expect(productService.searchProductsService).toHaveBeenCalledWith('laptop', req.query);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].data.products.length).toBe(1);
    });

    it('should handle no search results', async () => {
      req.query.term = 'nonexistent';
      
      productService.searchProductsService.mockResolvedValue({
        products: [],
        pagination: { totalResults: 0, totalPages: 0, currentPage: 1, limit: 10 }
      });
      
      await productController.searchProducts(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].message).toContain('No products found');
    });
  });
});
