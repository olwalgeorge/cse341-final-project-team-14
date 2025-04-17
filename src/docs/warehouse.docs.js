module.exports = {
  "/warehouses": {
    get: {
      tags: ["Warehouses"],
      summary: "Get all warehouses",
      description: "Retrieve a list of all warehouses with optional filtering, sorting, and pagination. Requires authentication.",
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
        "401": { 
          $ref: "#/components/responses/Unauthorized",
          description: "Authentication token is missing, invalid, or expired"
        },
        "403": {
          description: "Forbidden - Insufficient permissions to access warehouse data",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Forbidden",
                error: ["Insufficient permissions to access this resource"],
                errorCode: "FORBIDDEN_ERROR",
                statusCode: 403
              }
            }
          }
        },
        "500": { 
          $ref: "#/components/responses/ServerError",
          description: "An unexpected error occurred on the server" 
        }
      }
    },
    post: {
      tags: ["Warehouses"],
      summary: "Create a new warehouse",
      description: "Create a new warehouse record in the system. Requires ADMIN or MANAGER role.",
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
        "400": { 
          description: "Validation error in warehouse data",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              examples: {
                invalidID: {
                  summary: "Invalid warehouse ID format",
                  value: {
                    success: false,
                    message: "Validation failed",
                    error: ["Warehouse ID must be in format WH-XXXXX"],
                    errorCode: "VALIDATION_ERROR",
                    statusCode: 400
                  }
                },
                invalidCapacity: {
                  summary: "Invalid capacity value",
                  value: {
                    success: false,
                    message: "Validation failed",
                    error: ["Capacity cannot be negative"],
                    errorCode: "VALIDATION_ERROR",
                    statusCode: 400
                  }
                }
              }
            }
          }
        },
        "401": { 
          $ref: "#/components/responses/Unauthorized",
          description: "Authentication token is missing, invalid, or expired" 
        },
        "409": { 
          description: "Conflict - Warehouse with the same identifier already exists",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Conflict",
                error: ["Warehouse with this warehouseID already exists"],
                errorCode: "CONFLICT_ERROR",
                statusCode: 409
              }
            }
          }
        },
        "500": { 
          $ref: "#/components/responses/ServerError",
          description: "An unexpected error occurred on the server" 
        }
      }
    },
    delete: {
      tags: ["Warehouses"],
      summary: "Delete all warehouses",
      description: "Delete all warehouses from the system (use with caution). Restricted to ADMIN role only.",
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
  "/warehouses/{warehouse_Id}": {
    get: {
      tags: ["Warehouses"],
      summary: "Get warehouse by ID",
      description: "Retrieve warehouse details by MongoDB ID. Requires authentication. The warehouse_Id parameter is the MongoDB ObjectId (24 character hexadecimal) that uniquely identifies a warehouse in the database.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "warehouse_Id",
          in: "path",
          required: true,
          schema: { 
            type: "string",
            pattern: "^[a-f\\d]{24}$" 
          },
          example: "64f5a7b3c5dc0d34f85d969e",
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
        "400": { 
          description: "Invalid MongoDB ID format",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Validation failed",
                error: ["Invalid MongoDB ID format"],
                errorCode: "VALIDATION_ERROR",
                statusCode: 400
              }
            }
          }
        },
        "401": { 
          $ref: "#/components/responses/Unauthorized",
          description: "Authentication token is missing, invalid, or expired" 
        },
        "404": { 
          description: "Warehouse not found with the specified ID",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Warehouse not found",
                error: ["No warehouse found with this ID"],
                errorCode: "NOT_FOUND_ERROR",
                statusCode: 404
              }
            }
          }
        },
        "500": { 
          $ref: "#/components/responses/ServerError",
          description: "An unexpected error occurred on the server" 
        }
      }
    },
    put: {
      tags: ["Warehouses"],
      summary: "Update warehouse",
      description: "Update warehouse details by MongoDB ID. Requires ADMIN or MANAGER role. The warehouse_Id parameter is the MongoDB ObjectId (24 character hexadecimal) that uniquely identifies a warehouse in the database.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "warehouse_Id",
          in: "path",
          required: true,
          schema: { 
            type: "string",
            pattern: "^[a-f\\d]{24}$" 
          },
          example: "64f5a7b3c5dc0d34f85d969e",
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
        "400": { 
          description: "Validation error in warehouse update data or invalid MongoDB ID",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              examples: {
                invalidID: {
                  summary: "Invalid MongoDB ID",
                  value: {
                    success: false,
                    message: "Validation failed",
                    error: ["Invalid MongoDB ID format"],
                    errorCode: "VALIDATION_ERROR",
                    statusCode: 400
                  }
                },
                invalidData: {
                  summary: "Invalid warehouse data",
                  value: {
                    success: false,
                    message: "Validation failed",
                    error: ["Contact email must be a valid email address"],
                    errorCode: "VALIDATION_ERROR",
                    statusCode: 400
                  }
                }
              }
            }
          }
        },
        "401": { 
          $ref: "#/components/responses/Unauthorized",
          description: "Authentication token is missing, invalid, or expired" 
        },
        "404": { 
          description: "Warehouse not found with the specified ID",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Warehouse not found",
                error: ["No warehouse found with this ID"],
                errorCode: "NOT_FOUND_ERROR",
                statusCode: 404
              }
            }
          }
        },
        "500": { 
          $ref: "#/components/responses/ServerError",
          description: "An unexpected error occurred on the server" 
        }
      }
    },
    delete: {
      tags: ["Warehouses"],
      summary: "Delete warehouse",
      description: "Delete a warehouse by MongoDB ID. Restricted to ADMIN role only. The warehouse_Id parameter is the MongoDB ObjectId (24 character hexadecimal) that uniquely identifies a warehouse in the database.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "warehouse_Id",
          in: "path",
          required: true,
          schema: { 
            type: "string",
            pattern: "^[a-f\\d]{24}$" 
          },
          example: "64f5a7b3c5dc0d34f85d969e",
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
        "400": { 
          description: "Invalid MongoDB ID format",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Validation failed",
                error: ["Invalid MongoDB ID format"],
                errorCode: "VALIDATION_ERROR",
                statusCode: 400
              }
            }
          }
        },
        "401": { 
          $ref: "#/components/responses/Unauthorized",
          description: "Authentication token is missing, invalid, or expired" 
        },
        "404": { 
          description: "Warehouse not found with the specified ID",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Warehouse not found",
                error: ["No warehouse found with this ID"],
                errorCode: "NOT_FOUND_ERROR",
                statusCode: 404
              }
            }
          }
        },
        "500": { 
          $ref: "#/components/responses/ServerError",
          description: "An unexpected error occurred on the server" 
        }
      }
    }
  },
  "/warehouses/warehouseID/{warehouseID}": {
    get: {
      tags: ["Warehouses"],
      summary: "Get warehouse by warehouse ID",
      description: "Retrieve warehouse details by warehouse ID (WH-XXXXX format). Requires authentication.",
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
        "400": { 
          description: "Invalid warehouse ID format",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Validation failed",
                error: ["Warehouse ID must be in format WH-XXXXX"],
                errorCode: "VALIDATION_ERROR",
                statusCode: 400
              }
            }
          }
        },
        "401": { 
          $ref: "#/components/responses/Unauthorized",
          description: "Authentication token is missing, invalid, or expired" 
        },
        "404": { 
          description: "Warehouse not found with the specified ID",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Warehouse not found",
                error: ["No warehouse found with this ID"],
                errorCode: "NOT_FOUND_ERROR",
                statusCode: 404
              }
            }
          }
        },
        "500": { 
          $ref: "#/components/responses/ServerError",
          description: "An unexpected error occurred on the server" 
        }
      }
    }
  },
  "/warehouses/name/{name}": {
    get: {
      tags: ["Warehouses"],
      summary: "Get warehouse by name",
      description: "Retrieve warehouse details by warehouse name. Requires authentication.",
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
        "401": { 
          $ref: "#/components/responses/Unauthorized",
          description: "Authentication token is missing, invalid, or expired" 
        },
        "404": { 
          description: "Warehouse not found with the specified name",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Warehouse not found",
                error: ["No warehouse found with this name"],
                errorCode: "NOT_FOUND_ERROR",
                statusCode: 404
              }
            }
          }
        },
        "500": { 
          $ref: "#/components/responses/ServerError",
          description: "An unexpected error occurred on the server" 
        }
      }
    }
  }
};
