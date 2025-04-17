// src/utils/apiFeatures.js

/**
 * API Features Utility
 * Provides standardized methods for filtering, pagination, and sorting
 * for use across all service modules
 */

const { createLogger } = require('./logger');
const logger = createLogger('APIFeatures');

class APIFeatures {
  /**
   * Build a MongoDB filter object from query params and custom filter mapping
   * 
   * @param {Object} query - The query parameters from the request
   * @param {Object} customFilters - Mapping of query params to DB fields
   * @returns {Object} - MongoDB filter object
   * 
   * Example customFilters:
   * {
   *   category: 'category', // direct mapping
   *   minPrice: {
   *     field: 'price',
   *     transform: (value) => ({ $gte: parseFloat(value) })
   *   }
   * }
   */
  static buildFilter(query, customFilters = {}) {
    try {
      const filter = {};
      
      // Process each query parameter based on custom filter mapping
      for (const [key, value] of Object.entries(query)) {
        // Skip pagination and sorting related parameters
        if (['page', 'limit', 'sort', 'order', 'fields'].includes(key)) continue;
        
        // If there's a custom filter mapping for this query parameter
        if (customFilters[key]) {
          const customFilter = customFilters[key];
          
          // If the mapping is a string, use it directly as the field name
          if (typeof customFilter === 'string') {
            filter[customFilter] = value;
          } 
          // If the mapping is an object with field and transform, use the transform function
          else if (typeof customFilter === 'object' && customFilter.field) {
            if (customFilter.transform && typeof customFilter.transform === 'function') {
              const transformedValue = customFilter.transform(value);
              filter[customFilter.field] = transformedValue;
            } else {
              filter[customFilter.field] = value;
            }
          }
        } else {
          // For all other query parameters not in the custom mapping, use them as-is
          // This is optional and can be disabled for security reasons
          filter[key] = value;
        }
      }

      logger.debug('Built filter:', filter);
      return filter;
    } catch (error) {
      logger.error('Error building filter:', error);
      return {};
    }
  }

  /**
   * Get pagination parameters from query
   * 
   * @param {Object} query - The query parameters from the request
   * @param {Object} options - Additional options for pagination
   * @returns {Object} - Pagination parameters { skip, limit, page }
   */
  static getPagination(query, options = {}) {
    try {
      const defaultLimit = options.defaultLimit || 10;
      const maxLimit = options.maxLimit || 100;
      
      let page = parseInt(query.page) || 1;
      let limit = parseInt(query.limit) || defaultLimit;
      
      // Ensure page is at least 1
      page = Math.max(1, page);
      
      // Ensure limit is within bounds
      limit = Math.min(Math.max(1, limit), maxLimit);
      
      const skip = (page - 1) * limit;
      
      return {
        page,
        limit,
        skip,
        isFirstPage: page === 1,
        pageSize: limit
      };
    } catch (error) {
      logger.error('Error getting pagination parameters:', error);
      return { page: 1, limit: 10, skip: 0, isFirstPage: true, pageSize: 10 };
    }
  }

  /**
   * Get sort parameters from query
   * 
   * @param {Object} query - The query parameters from the request
   * @param {String} defaultSort - Default sort field with direction (e.g., 'name' or '-createdAt')
   * @returns {Object} - MongoDB sort object
   */
  static getSort(query, defaultSort = 'createdAt') {
    try {
      // Handle sort and order parameters separately (common in Swagger UI)
      if (query.sort && query.order) {
        const sortObj = {};
        const sortField = query.sort;
        const sortOrder = query.order === 'desc' ? -1 : 1;
        sortObj[sortField] = sortOrder;
        logger.debug('Using sort field and order:', { field: sortField, order: sortOrder });
        return sortObj;
      }
      
      // Handle comma-separated sort parameter (e.g., sort=name,-age)
      let sortStr = query.sort || defaultSort;
      
      // Convert sortStr to MongoDB sort object
      const sortFields = sortStr.split(',');
      const sortObj = {};
      
      for (const field of sortFields) {
        if (field.startsWith('-')) {
          sortObj[field.substring(1)] = -1;
        } else {
          sortObj[field] = 1;
        }
      }
      
      logger.debug('Using sort object:', sortObj);
      return sortObj;
    } catch (error) {
      logger.error('Error getting sort parameters:', error);
      
      // Fallback to default sort
      const defaultSortObj = {};
      const defaultField = defaultSort.startsWith('-') 
        ? defaultSort.substring(1) 
        : defaultSort;
      
      defaultSortObj[defaultField] = defaultSort.startsWith('-') ? -1 : 1;
      logger.debug('Using default sort:', defaultSortObj);
      return defaultSortObj;
    }
  }

  /**
   * Generate pagination result object with page navigation URLs
   * 
   * @param {Number} total - Total number of documents
   * @param {Object} pagination - Pagination object from getPagination
   * @param {Object} req - Express request object (optional)
   * @returns {Object} - Enhanced pagination result for response
   */
  static paginationResult(total, pagination, req = null) {
    const { page, limit } = pagination;
    
    const totalPages = Math.ceil(total / limit) || 1; // Ensure at least 1 page
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    const isLastPage = page >= totalPages;
    
    let result = {
      total,
      totalPages,
      currentPage: page,
      pageSize: limit,
      hasNextPage,
      hasPrevPage,
      isFirstPage: page === 1,
      isLastPage,
      count: Math.min(limit, Math.max(0, total - (page - 1) * limit)) // Items on current page
    };

    // Generate navigation URLs if request object is provided
    if (req) {
      try {
        // Create a copy of the current query parameters
        const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
        const queryParams = new URLSearchParams(req.query);
        
        // Function to create URL with updated page parameter
        const createPageUrl = (pageNum) => {
          const params = new URLSearchParams(queryParams);
          params.set('page', pageNum);
          return `${baseUrl}?${params.toString()}`;
        };
        
        // Add navigation URLs to result
        if (hasNextPage) {
          result.nextPage = createPageUrl(page + 1);
        }
        
        if (hasPrevPage) {
          result.prevPage = createPageUrl(page - 1);
        }
        
        result.firstPage = createPageUrl(1);
        result.lastPage = createPageUrl(totalPages);
        result.currentUrl = createPageUrl(page);
      } catch (error) {
        logger.error('Error generating pagination URLs:', error);
      }
    }
    
    return result;
  }

  /**
   * Apply pagination to a MongoDB query
   * 
   * @param {Object} query - MongoDB query
   * @param {Object} pagination - Pagination object from getPagination
   * @returns {Object} - Modified MongoDB query with pagination applied
   */
  static applyPagination(query, pagination) {
    return query.skip(pagination.skip).limit(pagination.limit);
  }

  /**
   * Create a field selection string from query
   * 
   * @param {Object} query - The query parameters from the request
   * @returns {String} - Field selection string for MongoDB
   */
  static getFieldSelection(query) {
    try {
      return query.fields ? query.fields.split(',').join(' ') : '';
    } catch (error) {
      logger.error('Error getting field selection:', error);
      return '';
    }
  }
}

module.exports = APIFeatures;
