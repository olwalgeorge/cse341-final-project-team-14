const APIFeatures = require('../../src/utils/apiFeatures');

describe('APIFeatures Utility Tests', () => {
  describe('buildFilter', () => {
    it('should build a filter object from query parameters', () => {
      const query = {
        name: 'Test',
        page: 1,
        limit: 10,
        minPrice: '100',
        maxPrice: '1000',
        category: 'Electronics'
      };
      
      const customFilters = {
        name: {
          field: 'name',
          transform: (value) => ({ $regex: value, $options: 'i' })
        },
        minPrice: {
          field: 'price',
          transform: (value) => ({ $gte: parseFloat(value) })
        },
        maxPrice: {
          field: 'price',
          transform: (value) => ({ $lte: parseFloat(value) })
        },
        category: 'category'
      };
      
      const filter = APIFeatures.buildFilter(query, customFilters);
      
      // Expected filter structure
      expect(filter).toEqual({
        name: { $regex: 'Test', $options: 'i' },
        price: { $gte: 100, $lte: 1000 },
        category: 'Electronics'
      });
      
      // Pagination parameters should be excluded
      expect(filter.page).toBeUndefined();
      expect(filter.limit).toBeUndefined();
    });

    it('should handle empty query parameters', () => {
      const filter = APIFeatures.buildFilter({}, {});
      expect(filter).toEqual({});
    });

    it('should handle invalid transformation functions', () => {
      const query = { price: 'invalid' };
      
      const customFilters = {
        price: {
          field: 'price',
          transform: () => { throw new Error('Test error'); }
        }
      };
      
      // Should not throw and return an empty object
      const filter = APIFeatures.buildFilter(query, customFilters);
      expect(filter).toEqual({});
    });
  });

  describe('getPagination', () => {
    it('should extract pagination parameters from query', () => {
      const query = {
        page: '2',
        limit: '20'
      };
      
      const pagination = APIFeatures.getPagination(query);
      
      // Expected pagination structure
      expect(pagination).toEqual({
        page: 2,
        limit: 20,
        skip: 20, // (page-1) * limit
        isFirstPage: false,
        pageSize: 20
      });
    });

    it('should use default values for missing pagination parameters', () => {
      const pagination = APIFeatures.getPagination({});
      
      // Default pagination structure
      expect(pagination).toEqual({
        page: 1,
        limit: 10,
        skip: 0,
        isFirstPage: true,
        pageSize: 10
      });
    });

    it('should enforce minimum page value of 1', () => {
      const query = {
        page: '-1',
        limit: '20'
      };
      
      const pagination = APIFeatures.getPagination(query);
      expect(pagination.page).toBe(1);
      expect(pagination.skip).toBe(0);
    });

    it('should enforce minimum and maximum limit values', () => {
      // Test with limit below minimum
      let query = { limit: '0' };
      let pagination = APIFeatures.getPagination(query);
      expect(pagination.limit).toBe(1); // Should be set to minimum of 1
      
      // Test with limit above maximum
      query = { limit: '1000' };
      pagination = APIFeatures.getPagination(query, { maxLimit: 100 });
      expect(pagination.limit).toBe(100); // Should be capped at maxLimit
    });
  });

  describe('getSort', () => {
    it('should convert sort string to MongoDB sort object', () => {
      const query = {
        sort: 'name,-createdAt'
      };
      
      const sort = APIFeatures.getSort(query);
      
      // Expected sort structure
      expect(sort).toEqual({
        name: 1,
        createdAt: -1
      });
    });

    it('should use default sort when sort parameter is missing', () => {
      const sort = APIFeatures.getSort({}, 'createdAt');
      
      // Should use default sort
      expect(sort).toEqual({
        createdAt: 1
      });
    });

    it('should handle default sort with descending order', () => {
      const sort = APIFeatures.getSort({}, '-updatedAt');
      
      // Should use default sort with descending order
      expect(sort).toEqual({
        updatedAt: -1
      });
    });
  });

  describe('paginationResult', () => {
    it('should generate pagination result object', () => {
      const pagination = {
        page: 2,
        limit: 10,
        skip: 10
      };
      
      const total = 35; // Total records
      
      const result = APIFeatures.paginationResult(total, pagination);
      
      // Expected pagination result structure
      expect(result).toEqual({
        total: 35,
        totalPages: 4,
        currentPage: 2,
        pageSize: 10,
        hasNextPage: true,
        hasPrevPage: true,
        isFirstPage: false,
        isLastPage: false,
        count: 10 // Items on current page
      });
    });

    it('should handle last page with fewer items', () => {
      const pagination = {
        page: 4,
        limit: 10,
        skip: 30
      };
      
      const total = 35; // Total records, last page has 5 items
      
      const result = APIFeatures.paginationResult(total, pagination);
      
      expect(result.isLastPage).toBe(true);
      expect(result.hasNextPage).toBe(false);
      expect(result.count).toBe(5); // Only 5 items on last page
    });

    it('should generate navigation URLs when request object is provided', () => {
      const pagination = {
        page: 2,
        limit: 10,
        skip: 10
      };
      
      const total = 35;
      
      const mockReq = {
        protocol: 'http',
        get: jest.fn().mockReturnValue('example.com'),
        baseUrl: '/api',
        path: '/users',
        query: {
          page: '2',
          limit: '10',
          search: 'test'
        }
      };
      
      const result = APIFeatures.paginationResult(total, pagination, mockReq);
      
      // Should include navigation URLs
      expect(result.nextPage).toContain('http://example.com/api/users?');
      expect(result.nextPage).toContain('page=3');
      expect(result.prevPage).toContain('page=1');
      expect(result.firstPage).toContain('page=1');
      expect(result.lastPage).toContain('page=4');
      
      // Should preserve other query parameters
      expect(result.nextPage).toContain('search=test');
    });
  });
});
