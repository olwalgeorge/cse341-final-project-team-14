module.exports = {
  "/warehouses": {
    get: {
      tags: ["Warehouses"],
      summary: "Get all warehouses",
      description: "Retrieve a list of all warehouses with optional filtering, sorting, and pagination",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "query",
          name: "name",
          schema: { type: "string" },
          description: "Filter warehouses by name (case-insensitive partial match)"
        },
        {
          in: "query",
          name: "status",
          schema: { 
            type: "string",
            enum: ["Active", "Inactive", "Maintenance"] 
          },
          description: "Filter warehouses by status"
        },
        {
          in: "query",
          name: "minCapacity",
          schema: { type: "integer" },
          description: "Filter warehouses by minimum capacity"
        },
        {
          in: "query",
          name: "maxCapacity",
          schema: { type: "integer" },
          description: "Filter warehouses by maximum capacity"
        },
        {
          in: "query",
          name: "city",
          schema: { type: "string" },
          description: "Filter warehouses by city"
        },
        {
          in: "query",
          name: "state",
          schema: { type: "string" },
          description: "Filter warehouses by state/province"
        },
        {
          in: "query",
          name: "country",
          schema: { type: "string" },
          description: "Filter warehouses by country"
        },
        {
          in: "query",
          name: "postalCode",
          schema: { type: "string" },
          description: "Filter warehouses by postal code"
        },
        {
          in: "query",
          name: "contactName",
          schema: { type: "string" },
          description: "Filter warehouses by contact name"
        },
        {
          in: "query",
          name: "contactEmail",
          schema: { type: "string" },
          description: "Filter warehouses by contact email"
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
          schema: { type: "string", default: "name" },
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
                      warehouses: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Warehouse" }
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
      tags: ["Warehouses"],
      summary: "Create a new warehouse",
      description: "Create a new warehouse record in the system",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/WarehouseInput" }
          }
        }
      },
      responses: {
        "201": {
          description: "Warehouse created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string" },
                  data: { $ref: "#/components/schemas/Warehouse" }
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
      tags: ["Warehouses"],
      summary: "Delete all warehouses",
      description: "Delete all warehouses from the system (use with caution)",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "All warehouses deleted successfully",
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
  "/warehouses/{_id}": {
    get: {
      tags: ["Warehouses"],
      summary: "Get warehouse by ID",
      description: "Retrieve warehouse details by MongoDB ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "_id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "MongoDB ID of the warehouse"
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
                  data: { $ref: "#/components/schemas/Warehouse" }
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
      tags: ["Warehouses"],
      summary: "Update warehouse",
      description: "Update warehouse details by MongoDB ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "_id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "MongoDB ID of the warehouse"
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/WarehouseUpdate" }
          }
        }
      },
      responses: {
        "200": {
          description: "Warehouse updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string" },
                  data: { $ref: "#/components/schemas/Warehouse" }
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
      tags: ["Warehouses"],
      summary: "Delete warehouse",
      description: "Delete a warehouse by MongoDB ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "_id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "MongoDB ID of the warehouse to delete"
        }
      ],
      responses: {
        "200": {
          description: "Warehouse deleted successfully",
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
  "/warehouses/warehouseID/{warehouseID}": {
    get: {
      tags: ["Warehouses"],
      summary: "Get warehouse by warehouse ID",
      description: "Retrieve warehouse details by warehouse ID (WH-XXXXX format)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "warehouseID",
          in: "path",
          required: true,
          schema: { type: "string", pattern: "^WH-\\d{5}$" },
          description: "Warehouse ID in WH-XXXXX format"
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
                  data: { $ref: "#/components/schemas/Warehouse" }
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
  "/warehouses/name/{name}": {
    get: {
      tags: ["Warehouses"],
      summary: "Get warehouse by name",
      description: "Retrieve warehouse details by warehouse name",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "name",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Exact warehouse name"
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
                  data: { $ref: "#/components/schemas/Warehouse" }
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
  }
};
