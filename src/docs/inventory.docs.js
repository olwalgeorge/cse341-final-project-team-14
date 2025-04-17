module.exports = {
  "/inventory": {
    get: {
      tags: ["Inventory"],
      summary: "Get all inventory items",
      description: "Retrieve a list of all inventory items with optional filtering, sorting, and pagination",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "query",
          name: "product",
          schema: { type: "string" },
          description: "Filter by product ID"
        },
        {
          in: "query",
          name: "warehouse",
          schema: { type: "string" },
          description: "Filter by warehouse ID"
        },
        {
          in: "query",
          name: "stockStatus",
          schema: { 
            type: "string",
            enum: ["In Stock", "Low Stock", "Out of Stock", "Overstock"] 
          },
          description: "Filter by inventory stock status"
        },
        {
          in: "query",
          name: "minQuantity",
          schema: { type: "integer" },
          description: "Filter by minimum quantity available"
        },
        {
          in: "query",
          name: "maxQuantity",
          schema: { type: "integer" },
          description: "Filter by maximum quantity available"
        },
        {
          in: "query",
          name: "lastStockCheckFrom",
          schema: { type: "string", format: "date" },
          description: "Filter items with last stock check after this date"
        },
        {
          in: "query",
          name: "lastStockCheckTo",
          schema: { type: "string", format: "date" },
          description: "Filter items with last stock check before this date"
        },
        {
          in: "query",
          name: "page",
          schema: { type: "integer", default: 1 },
          description: "Page number for pagination"
        },
        {
          in: "query",
          name: "limit",
          schema: { type: "integer", default: 10 },
          description: "Number of records per page"
        },
        {
          in: "query",
          name: "sort",
          schema: { type: "string", default: "product" },
          description: "Sort fields (comma separated), prefix with - for descending order"
        }
      ],
      responses: {
        "200": {
          description: "Successful operation",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string" },
                  data: {
                    type: "object",
                    properties: {
                      inventory: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Inventory" }
                      },
                      pagination: { $ref: "#/components/schemas/Pagination" }
                    }
                  }
                }
              }
            }
          }
        },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "500": { $ref: "#/components/responses/ServerError" }
      }
    },
    post: {
      tags: ["Inventory"],
      summary: "Create a new inventory item",
      description: "Create a new inventory item record in the system",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/InventoryInput" }
          }
        }
      },
      responses: {
        "201": {
          description: "Inventory item created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string" },
                  data: { $ref: "#/components/schemas/Inventory" }
                }
              }
            }
          }
        },
        "400": { $ref: "#/components/responses/BadRequest" },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "500": { $ref: "#/components/responses/ServerError" }
      }
    },
    delete: {
      tags: ["Inventory"],
      summary: "Delete all inventory items",
      description: "Delete all inventory items from the system (use with caution)",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "All inventory items deleted successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string" }
                }
              }
            }
          }
        },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "500": { $ref: "#/components/responses/ServerError" }
      }
    }
  },
  "/inventory/{inventory_Id}": {
    get: {
      tags: ["Inventory"],
      summary: "Get inventory item by ID",
      description: "Retrieve inventory item details by MongoDB ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "inventory_Id",
          in: "path",
          required: true,
          schema: { 
            type: "string",
            pattern: "^[a-f\\d]{24}$" 
          },
          example: "64f5a7b3c5dc0d34f85d969e",
          description: "MongoDB ID of the inventory item"
        }
      ],
      responses: {
        "200": {
          description: "Successful operation",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string" },
                  data: { $ref: "#/components/schemas/Inventory" }
                }
              }
            }
          }
        },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "404": { $ref: "#/components/responses/NotFound" },
        "500": { $ref: "#/components/responses/ServerError" }
      }
    },
    put: {
      tags: ["Inventory"],
      summary: "Update inventory item",
      description: "Update inventory item details by MongoDB ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "inventory_Id",
          in: "path",
          required: true,
          schema: { 
            type: "string",
            pattern: "^[a-f\\d]{24}$" 
          },
          example: "64f5a7b3c5dc0d34f85d969e",
          description: "MongoDB ID of the inventory item"
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/InventoryUpdate" }
          }
        }
      },
      responses: {
        "200": {
          description: "Inventory item updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string" },
                  data: { $ref: "#/components/schemas/Inventory" }
                }
              }
            }
          }
        },
        "400": { $ref: "#/components/responses/BadRequest" },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "404": { $ref: "#/components/responses/NotFound" },
        "500": { $ref: "#/components/responses/ServerError" }
      }
    },
    delete: {
      tags: ["Inventory"],
      summary: "Delete inventory item",
      description: "Delete an inventory item by MongoDB ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "inventory_Id",
          in: "path",
          required: true,
          schema: { 
            type: "string",
            pattern: "^[a-f\\d]{24}$" 
          },
          example: "64f5a7b3c5dc0d34f85d969e",
          description: "MongoDB ID of the inventory item to delete"
        }
      ],
      responses: {
        "200": {
          description: "Inventory item deleted successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string" }
                }
              }
            }
          }
        },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "404": { $ref: "#/components/responses/NotFound" },
        "500": { $ref: "#/components/responses/ServerError" }
      }
    }
  },
  "/inventory/inventoryID/{inventoryID}": {
    get: {
      tags: ["Inventory"],
      summary: "Get inventory item by inventory ID",
      description: "Retrieve inventory item details by inventory ID (IN-XXXXX format)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "inventoryID",
          in: "path",
          required: true,
          schema: { type: "string", pattern: "^IN-\\d{5}$" },
          description: "Inventory ID in IN-XXXXX format"
        }
      ],
      responses: {
        "200": {
          description: "Successful operation",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string" },
                  data: { $ref: "#/components/schemas/Inventory" }
                }
              }
            }
          }
        },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "404": { $ref: "#/components/responses/NotFound" },
        "500": { $ref: "#/components/responses/ServerError" }
      }
    }
  },
  "/inventory/product/{productId}": {
    get: {
      tags: ["Inventory"],
      summary: "Get inventory by product",
      description: "Retrieve inventory across all warehouses for a specific product",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "productId",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "MongoDB ID of the product"
        }
      ],
      responses: {
        "200": {
          description: "Successful operation",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string" },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Inventory" }
                  }
                }
              }
            }
          }
        },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "500": { $ref: "#/components/responses/ServerError" }
      }
    }
  },
  "/inventory/warehouse/{warehouseId}": {
    get: {
      tags: ["Inventory"],
      summary: "Get inventory by warehouse",
      description: "Retrieve all inventory items for a specific warehouse",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "warehouseId",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "MongoDB ID of the warehouse"
        },
        {
          in: "query",
          name: "stockStatus",
          schema: { 
            type: "string",
            enum: ["In Stock", "Low Stock", "Out of Stock", "Overstock"] 
          },
          description: "Filter by inventory stock status"
        },
        {
          in: "query",
          name: "page",
          schema: { type: "integer", default: 1 },
          description: "Page number for pagination"
        },
        {
          in: "query",
          name: "limit",
          schema: { type: "integer", default: 10 },
          description: "Number of records per page"
        },
        {
          in: "query",
          name: "sort",
          schema: { type: "string", default: "product" },
          description: "Sort fields (comma separated), prefix with - for descending order"
        }
      ],
      responses: {
        "200": {
          description: "Successful operation",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string" },
                  data: {
                    type: "object",
                    properties: {
                      inventory: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Inventory" }
                      },
                      pagination: { $ref: "#/components/schemas/Pagination" }
                    }
                  }
                }
              }
            }
          }
        },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "500": { $ref: "#/components/responses/ServerError" }
      }
    }
  },
  "/inventory/status/{stockStatus}": {
    get: {
      tags: ["Inventory"],
      summary: "Get inventory by stock status",
      description: "Retrieve inventory items with a specific stock status",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "stockStatus",
          in: "path",
          required: true,
          schema: { 
            type: "string",
            enum: ["In Stock", "Low Stock", "Out of Stock", "Overstock"] 
          },
          description: "Stock status to filter by"
        },
        {
          in: "query",
          name: "page",
          schema: { type: "integer", default: 1 },
          description: "Page number for pagination"
        },
        {
          in: "query",
          name: "limit",
          schema: { type: "integer", default: 10 },
          description: "Number of records per page"
        },
        {
          in: "query",
          name: "sort",
          schema: { type: "string", default: "product" },
          description: "Sort fields (comma separated), prefix with - for descending order"
        }
      ],
      responses: {
        "200": {
          description: "Successful operation",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string" },
                  data: {
                    type: "object",
                    properties: {
                      inventory: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Inventory" }
                      },
                      pagination: { $ref: "#/components/schemas/Pagination" }
                    }
                  }
                }
              }
            }
          }
        },
        "400": { $ref: "#/components/responses/BadRequest" },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "500": { $ref: "#/components/responses/ServerError" }
      }
    }
  }
};
