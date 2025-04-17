const productRoutes = {
  "/products": {
    get: {
      tags: ["Products"],
      summary: "Get all products",
      description: "Retrieve a paginated list of all products with optional filtering, sorting and pagination (requires authentication)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "query",
          name: "category",
          schema: { 
            type: "string",
            enum: ["Electronics", "Clothing", "Food", "Furniture", "Other"]
          },
          description: "Filter products by category"
        },
        {
          in: "query",
          name: "minPrice",
          schema: { type: "number", minimum: 0 },
          description: "Filter products with selling price greater than or equal to this value"
        },
        {
          in: "query",
          name: "maxPrice",
          schema: { type: "number", minimum: 0 },
          description: "Filter products with selling price less than or equal to this value"
        },
        {
          in: "query",
          name: "supplier",
          schema: { type: "string" },
          description: "Filter products by supplier ID (MongoDB ObjectID or SP-XXXXX format)"
        },
        {
          in: "query",
          name: "sku",
          schema: { type: "string" },
          description: "Filter products by SKU (exact match)"
        },
        {
          in: "query",
          name: "tags",
          schema: { type: "string" },
          description: "Filter products by tag (comma separated for multiple tags, products matching ANY tag will be returned)"
        },
        {
          in: "query",
          name: "createdAfter",
          schema: { type: "string", format: "date-time" },
          example: "2023-01-01T00:00:00Z",
          description: "Filter products created on or after this date (ISO format)"
        },
        {
          in: "query",
          name: "createdBefore",
          schema: { type: "string", format: "date-time" },
          example: "2023-12-31T23:59:59Z",
          description: "Filter products created on or before this date (ISO format)"
        },
        {
          in: "query",
          name: "page",
          schema: { 
            type: "integer",
            default: 1,
            minimum: 1 
          },
          description: "Page number for pagination"
        },
        {
          in: "query",
          name: "limit",
          schema: { 
            type: "integer", 
            default: 10,
            minimum: 1,
            maximum: 100
          },
          description: "Number of products per page (max 100)"
        },
        {
          in: "query",
          name: "sort",
          schema: { 
            type: "string",
            enum: ["name", "sellingPrice", "costPrice", "category", "sku", "createdAt", "updatedAt"],
            default: "name"
          },
          description: "Field to sort by"
        },
        {
          in: "query",
          name: "order",
          schema: { 
            type: "string",
            enum: ["asc", "desc"],
            default: "asc"
          },
          description: "Sort order (ascending or descending)"
        }
      ],
      responses: {
        200: {
          description: "Products retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Products retrieved successfully" },
                  data: {
                    type: "object",
                    properties: {
                      products: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Product" }
                      },
                      pagination: { $ref: "#/components/schemas/Pagination" }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: "Bad request - Invalid query parameters",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Validation failed",
                error: ["minPrice must be a positive number", "Invalid sort field"],
                errorCode: "VALIDATION_ERROR",
                statusCode: 400
              }
            }
          }
        },
        401: { 
          $ref: "#/components/responses/UnauthorizedError",
          description: "Authentication token is missing, invalid, or expired" 
        },
        500: { 
          $ref: "#/components/responses/ServerError",
          description: "An unexpected error occurred on the server" 
        }
      }
    },
    post: {
      tags: ["Products"],
      summary: "Create a new product",
      description: "Create a new product in the system (requires ADMIN or MANAGER role)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ProductInput" },
            example: {
              name: "iPad Air",
              description: "Latest iPad Air with M1 chip",
              sellingPrice: 599.99,
              costPrice: 399.99,
              category: "Electronics",
              supplier: "64f5a7b3c5dc0d34f85d969f",
              sku: "APPL-IPAD-AIR",
              tags: ["tablet", "apple", "ipad"],
              images: ["https://example.com/images/ipad-air.jpg"],
              unit: "pcs"
            }
          }
        }
      },
      responses: {
        201: {
          description: "Product created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Product created successfully" },
                  data: { $ref: "#/components/schemas/Product" }
                }
              }
            }
          }
        },
        400: {
          description: "Bad request - Validation error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Validation failed",
                error: [
                  "Product name is required",
                  "Selling price must be a positive number",
                  "Cost price must be a positive number",
                  "Invalid category"
                ],
                errorCode: "VALIDATION_ERROR",
                statusCode: 400
              }
            }
          }
        },
        401: { 
          $ref: "#/components/responses/UnauthorizedError",
          description: "Authentication token is missing, invalid, or expired"
        },
        403: {
          description: "Forbidden - Insufficient permissions to create products",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Forbidden",
                error: ["Only ADMIN and MANAGER roles can create products"],
                errorCode: "FORBIDDEN_ERROR",
                statusCode: 403
              }
            }
          }
        },
        409: {
          description: "Conflict - SKU already exists",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Conflict",
                error: ["Product SKU already exists"],
                errorCode: "CONFLICT_ERROR",
                statusCode: 409
              }
            }
          }
        },
        500: { $ref: "#/components/responses/ServerError" }
      }
    },
    delete: {
      tags: ["Products"],
      summary: "Delete all products",
      description: "Delete all products from the system (use with caution, requires ADMIN role)",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "All products deleted successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "All products deleted successfully" },
                  data: {
                    type: "object",
                    properties: {
                      deletedCount: { type: "integer", example: 42 }
                    }
                  }
                }
              }
            }
          }
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        403: {
          description: "Forbidden - Insufficient permissions to delete all products",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Forbidden",
                error: ["Only ADMIN role can delete all products"],
                errorCode: "FORBIDDEN_ERROR",
                statusCode: 403
              }
            }
          }
        },
        500: { $ref: "#/components/responses/ServerError" }
      }
    }
  },
  "/products/search": {
    get: {
      tags: ["Products"],
      summary: "Search products",
      description: "Search products by text (searches in name, description, and tags) (requires authentication)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "query",
          name: "term",
          required: true,
          schema: { type: "string" },
          description: "Search term"
        },
        {
          in: "query",
          name: "page",
          schema: { 
            type: "integer",
            default: 1,
            minimum: 1 
          },
          description: "Page number for pagination"
        },
        {
          in: "query",
          name: "limit",
          schema: { 
            type: "integer", 
            default: 10,
            minimum: 1,
            maximum: 100
          },
          description: "Number of products per page (max 100)"
        }
      ],
      responses: {
        200: {
          description: "Search successful",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Found 5 products matching 'macbook'" },
                  data: {
                    type: "object",
                    properties: {
                      products: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Product" }
                      },
                      pagination: { $ref: "#/components/schemas/Pagination" }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: "Bad request - Missing required parameters",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Bad Request",
                error: ["Search term is required"],
                errorCode: "VALIDATION_ERROR",
                statusCode: 400
              }
            }
          }
        },
        500: { $ref: "#/components/responses/ServerError" }
      }
    }
  },
  "/products/productID/{productID}": {
    get: {
      tags: ["Products"],
      summary: "Get product by product ID",
      description: "Retrieve product details by product ID (PR-XXXXX format) (requires authentication)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "productID",
          required: true,
          schema: { 
            type: "string",
            pattern: "^PR-\\d{5}$"
          },
          example: "PR-00001",
          description: "Product ID in PR-XXXXX format"
        }
      ],
      responses: {
        200: {
          description: "Product retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Product retrieved successfully" },
                  data: { $ref: "#/components/schemas/Product" }
                }
              }
            }
          }
        },
        400: {
          description: "Bad request - Invalid product ID format",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Bad Request",
                error: ["Invalid product ID format. Expected format: PR-XXXXX"],
                errorCode: "VALIDATION_ERROR",
                statusCode: 400
              }
            }
          }
        },
        404: {
          description: "Product not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Not Found",
                error: ["Product with ID PR-00999 not found"],
                errorCode: "NOT_FOUND_ERROR",
                statusCode: 404
              }
            }
          }
        },
        500: { $ref: "#/components/responses/ServerError" }
      }
    }
  },
  "/products/category/{category}": {
    get: {
      tags: ["Products"],
      summary: "Get products by category",
      description: "Retrieve products that belong to a specific category with pagination (requires authentication)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "category",
          required: true,
          schema: { 
            type: "string",
            enum: ["Electronics", "Clothing", "Food", "Furniture", "Other"]
          },
          description: "Product category"
        },
        {
          in: "query",
          name: "page",
          schema: { 
            type: "integer",
            default: 1,
            minimum: 1 
          },
          description: "Page number for pagination"
        },
        {
          in: "query",
          name: "limit",
          schema: { 
            type: "integer", 
            default: 10,
            minimum: 1,
            maximum: 100
          },
          description: "Number of products per page (max 100)"
        },
        {
          in: "query",
          name: "sort",
          schema: { type: "string", default: "name" },
          description: "Sort field (prefix with - for descending order)"
        }
      ],
      responses: {
        200: {
          description: "Products retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Products in category 'Electronics' retrieved successfully" },
                  data: {
                    type: "object",
                    properties: {
                      products: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Product" }
                      },
                      pagination: { $ref: "#/components/schemas/Pagination" }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: "Bad request - Invalid category",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Bad Request",
                error: ["Invalid category. Must be one of: Electronics, Clothing, Food, Furniture, Other"],
                errorCode: "VALIDATION_ERROR",
                statusCode: 400
              }
            }
          }
        },
        500: { $ref: "#/components/responses/ServerError" }
      }
    }
  },
  "/products/supplier/{supplierID}": {
    get: {
      tags: ["Products"],
      summary: "Get products by supplier",
      description: "Retrieve products that are supplied by a specific supplier with pagination (requires authentication)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "supplierID",
          required: true,
          schema: { 
            type: "string",
            pattern: "^(SP-\\d{5}|[a-f\\d]{24})$"
          },
          example: "SP-00001",
          description: "Supplier ID (can be MongoDB ObjectID or supplierID in SP-XXXXX format)"
        },
        {
          in: "query",
          name: "page",
          schema: { 
            type: "integer",
            default: 1,
            minimum: 1 
          },
          description: "Page number for pagination"
        },
        {
          in: "query",
          name: "limit",
          schema: { 
            type: "integer", 
            default: 10,
            minimum: 1,
            maximum: 100
          },
          description: "Number of products per page (max 100)"
        },
        {
          in: "query",
          name: "sort",
          schema: { type: "string", default: "name" },
          description: "Sort field (prefix with - for descending order)"
        }
      ],
      responses: {
        200: {
          description: "Products retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Products from supplier retrieved successfully" },
                  data: {
                    type: "object",
                    properties: {
                      products: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Product" }
                      },
                      pagination: { $ref: "#/components/schemas/Pagination" }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: "Bad request - Invalid supplier ID",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Bad Request",
                error: ["Invalid supplier ID format"],
                errorCode: "VALIDATION_ERROR",
                statusCode: 400
              }
            }
          }
        },
        404: {
          description: "Supplier not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Not Found",
                error: ["Supplier not found"],
                errorCode: "NOT_FOUND_ERROR",
                statusCode: 404
              }
            }
          }
        },
        500: { $ref: "#/components/responses/ServerError" }
      }
    }
  },
  "/products/{product_Id}": {
    get: {
      tags: ["Products"],
      summary: "Get product by MongoDB ID",
      description: "Retrieve product details by MongoDB ObjectID (requires authentication)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "product_Id",
          in: "path",
          required: true,
          schema: { 
            type: "string", 
            pattern: "^[a-f\\d]{24}$" 
          },
          example: "64f5a7b3c5dc0d34f85d969e",
          description: "MongoDB ObjectID of the product"
        }
      ],
      responses: {
        200: {
          description: "Product retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Product retrieved successfully" },
                  data: { $ref: "#/components/schemas/Product" }
                }
              }
            }
          }
        },
        400: {
          description: "Bad request - Invalid MongoDB ID",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Bad Request",
                error: ["Invalid MongoDB ID format"],
                errorCode: "VALIDATION_ERROR",
                statusCode: 400
              }
            }
          }
        },
        404: { 
          $ref: "#/components/responses/NotFound",
          description: "Product not found with the specified ID"
        },
        500: { $ref: "#/components/responses/ServerError" }
      }
    },
    put: {
      tags: ["Products"],
      summary: "Update product",
      description: "Update product details by MongoDB ID (requires ADMIN or MANAGER role)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "product_Id",
          required: true,
          schema: { 
            type: "string",
            pattern: "^[a-f\\d]{24}$"
          },
          example: "64f5a7b3c5dc0d34f85d969e",
          description: "MongoDB ObjectID of the product to update"
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ProductUpdate" },
            example: {
              name: "MacBook Pro M3 Max",
              description: "Updated MacBook Pro with M3 Max chip",
              sellingPrice: 2999.99,
              costPrice: 2299.99,
              tags: ["laptop", "apple", "macbook", "pro", "m3", "max"]
            }
          }
        }
      },
      responses: {
        200: {
          description: "Product updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Product updated successfully" },
                  data: { $ref: "#/components/schemas/Product" }
                }
              }
            }
          }
        },
        400: {
          description: "Bad request - Validation error in update data",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Validation failed",
                error: ["Selling price must be a positive number", "Invalid category"],
                errorCode: "VALIDATION_ERROR",
                statusCode: 400
              }
            }
          }
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        403: {
          description: "Forbidden - Insufficient permissions to update products",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Forbidden",
                error: ["Only ADMIN and MANAGER roles can update products"],
                errorCode: "FORBIDDEN_ERROR",
                statusCode: 403
              }
            }
          }
        },
        404: { 
          $ref: "#/components/responses/NotFound",
          description: "Product not found with the specified ID"
        },
        409: {
          description: "Conflict - SKU already exists",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Conflict",
                error: ["The updated SKU already exists on another product"],
                errorCode: "CONFLICT_ERROR",
                statusCode: 409
              }
            }
          }
        },
        500: { $ref: "#/components/responses/ServerError" }
      }
    },
    delete: {
      tags: ["Products"],
      summary: "Delete product",
      description: "Delete product by MongoDB ID (requires ADMIN role)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "product_Id",
          required: true,
          schema: { 
            type: "string",
            pattern: "^[a-f\\d]{24}$"
          },
          example: "64f5a7b3c5dc0d34f85d969e",
          description: "MongoDB ObjectID of the product to delete"
        }
      ],
      responses: {
        200: {
          description: "Product deleted successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Product deleted successfully" }
                }
              }
            }
          }
        },
        400: {
          description: "Bad request - Invalid MongoDB ID",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Bad Request",
                error: ["Invalid MongoDB ID format"],
                errorCode: "VALIDATION_ERROR",
                statusCode: 400
              }
            }
          }
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        403: {
          description: "Forbidden - Insufficient permissions to delete products",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Forbidden",
                error: ["Only ADMIN role can delete products"],
                errorCode: "FORBIDDEN_ERROR",
                statusCode: 403
              }
            }
          }
        },
        404: { 
          $ref: "#/components/responses/NotFound",
          description: "Product not found with the specified ID"
        },
        500: { $ref: "#/components/responses/ServerError" }
      }
    }
  }
};

module.exports = productRoutes;
