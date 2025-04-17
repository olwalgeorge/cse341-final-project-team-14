module.exports = {
  "/inventory-returns": {
    get: {
      tags: ["Inventory Returns"],
      summary: "Get all inventory returns",
      description: "Retrieve a list of all inventory returns with optional filtering, sorting, and pagination. Requires authentication.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "query",
          name: "status",
          schema: { 
            type: "string",
            enum: ["Draft", "Pending", "Approved", "Completed", "Rejected", "Canceled"] 
          },
          description: "Filter returns by status"
        },
        {
          in: "query",
          name: "returnType",
          schema: { 
            type: "string",
            enum: ["Customer Return", "Supplier Return", "Damaged Goods", "Defective Product"] 
          },
          description: "Filter by return type"
        },
        {
          in: "query",
          name: "product",
          schema: { type: "string" },
          description: "Filter by product ID"
        },
        {
          in: "query",
          name: "customer",
          schema: { type: "string" },
          description: "Filter by customer ID (for customer returns)"
        },
        {
          in: "query",
          name: "supplier",
          schema: { type: "string" },
          description: "Filter by supplier ID (for supplier returns)"
        },
        {
          in: "query",
          name: "warehouse",
          schema: { type: "string" },
          description: "Filter by warehouse ID"
        },
        {
          in: "query",
          name: "referenceOrder",
          schema: { type: "string" },
          description: "Filter by reference order ID"
        },
        {
          in: "query",
          name: "referencePurchase",
          schema: { type: "string" },
          description: "Filter by reference purchase ID"
        },
        {
          in: "query",
          name: "fromDate",
          schema: { type: "string", format: "date" },
          description: "Filter returns after this date (inclusive)"
        },
        {
          in: "query",
          name: "toDate",
          schema: { type: "string", format: "date" },
          description: "Filter returns before this date (inclusive)"
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
          schema: { type: "string", default: "-createdAt" },
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
                      returns: {
                        type: "array",
                        items: { $ref: "#/components/schemas/InventoryReturn" }
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
      tags: ["Inventory Returns"],
      summary: "Create a new inventory return",
      description: "Create a new inventory return record in the system. Requires authentication.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/InventoryReturnInput" }
          }
        }
      },
      responses: {
        "201": {
          description: "Inventory return created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string" },
                  data: { $ref: "#/components/schemas/InventoryReturn" }
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
      tags: ["Inventory Returns"],
      summary: "Delete all inventory returns",
      description: "Delete all inventory returns from the system (use with caution). Requires authentication.",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "All inventory returns deleted successfully",
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
  "/inventory-returns/{return_Id}": {
    get: {
      tags: ["Inventory Returns"],
      summary: "Get inventory return by ID",
      description: "Retrieve inventory return details by MongoDB ID. Requires authentication. The return_Id parameter is the MongoDB ObjectId (24 character hexadecimal) that uniquely identifies an inventory return in the database.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "return_Id",
          in: "path",
          required: true,
          schema: { 
            type: "string",
            pattern: "^[a-f\\d]{24}$" 
          },
          example: "64f5a7b3c5dc0d34f85d969e",
          description: "MongoDB ID of the inventory return"
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
                  data: { $ref: "#/components/schemas/InventoryReturn" }
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
      tags: ["Inventory Returns"],
      summary: "Update inventory return",
      description: "Update inventory return details by MongoDB ID. Requires authentication. The return_Id parameter is the MongoDB ObjectId (24 character hexadecimal) that uniquely identifies an inventory return in the database.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "return_Id",
          in: "path",
          required: true,
          schema: { 
            type: "string",
            pattern: "^[a-f\\d]{24}$" 
          },
          example: "64f5a7b3c5dc0d34f85d969e",
          description: "MongoDB ID of the inventory return"
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/InventoryReturnUpdate" }
          }
        }
      },
      responses: {
        "200": {
          description: "Inventory return updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string" },
                  data: { $ref: "#/components/schemas/InventoryReturn" }
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
      tags: ["Inventory Returns"],
      summary: "Delete inventory return",
      description: "Delete an inventory return by MongoDB ID. Requires authentication. The return_Id parameter is the MongoDB ObjectId (24 character hexadecimal) that uniquely identifies an inventory return in the database.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "return_Id",
          in: "path",
          required: true,
          schema: { 
            type: "string",
            pattern: "^[a-f\\d]{24}$" 
          },
          example: "64f5a7b3c5dc0d34f85d969e",
          description: "MongoDB ID of the inventory return to delete"
        }
      ],
      responses: {
        "200": {
          description: "Inventory return deleted successfully",
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
  "/inventory-returns/returnID/{returnID}": {
    get: {
      tags: ["Inventory Returns"],
      summary: "Get inventory return by return ID",
      description: "Retrieve inventory return details by return ID (RET-XXXXX format). Requires authentication.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "returnID",
          in: "path",
          required: true,
          schema: { type: "string", pattern: "^RET-\\d{5}$" },
          description: "Return ID in RET-XXXXX format"
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
                  data: { $ref: "#/components/schemas/InventoryReturn" }
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
  "/inventory-returns/{return_Id}/approve": {
    put: {
      tags: ["Inventory Returns"],
      summary: "Approve inventory return",
      description: "Approve an inventory return request and change its status to Approved. Requires authentication. The return_Id parameter is the MongoDB ObjectId (24 character hexadecimal) that uniquely identifies an inventory return in the database.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "return_Id",
          in: "path",
          required: true,
          schema: { 
            type: "string",
            pattern: "^[a-f\\d]{24}$" 
          },
          example: "64f5a7b3c5dc0d34f85d969e",
          description: "MongoDB ID of the inventory return to approve"
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                notes: {
                  type: "string",
                  example: "Return approved after quality verification"
                }
              }
            }
          }
        }
      },
      responses: {
        "200": {
          description: "Inventory return approved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string" },
                  data: { $ref: "#/components/schemas/InventoryReturn" }
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
    }
  },
  "/inventory-returns/{return_Id}/complete": {
    put: {
      tags: ["Inventory Returns"],
      summary: "Complete inventory return",
      description: "Mark an inventory return as completed and update inventory accordingly. Requires authentication. The return_Id parameter is the MongoDB ObjectId (24 character hexadecimal) that uniquely identifies an inventory return in the database.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "return_Id",
          in: "path",
          required: true,
          schema: { 
            type: "string",
            pattern: "^[a-f\\d]{24}$" 
          },
          example: "64f5a7b3c5dc0d34f85d969e",
          description: "MongoDB ID of the inventory return to complete"
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                actualReturnedItems: {
                  type: "array",
                  items: {
                    type: "object",
                    required: ["product", "quantity", "condition"],
                    properties: {
                      product: { type: "string", example: "67f8ec8aaf6bfc397a056b7f" },
                      quantity: { type: "number", example: 2 },
                      condition: { 
                        type: "string", 
                        enum: ["Good", "Damaged", "Defective", "Expired"],
                        example: "Good" 
                      },
                      notes: { type: "string", example: "Minor packaging damage" }
                    }
                  }
                },
                notes: {
                  type: "string",
                  example: "All items received as expected"
                }
              }
            }
          }
        }
      },
      responses: {
        "200": {
          description: "Inventory return completed successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string" },
                  data: { $ref: "#/components/schemas/InventoryReturn" }
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
    }
  },
  "/inventory-returns/status/{status}": {
    get: {
      tags: ["Inventory Returns"],
      summary: "Get returns by status",
      description: "Retrieve inventory returns with a specific status. Requires authentication.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "status",
          in: "path",
          required: true,
          schema: { 
            type: "string", 
            enum: ["Draft", "Pending", "Approved", "Completed", "Rejected", "Canceled"]
          },
          description: "Return status to filter by"
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
          schema: { type: "string", default: "-createdAt" },
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
                      returns: {
                        type: "array",
                        items: { $ref: "#/components/schemas/InventoryReturn" }
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
  },
  "/inventory-returns/type/{returnType}": {
    get: {
      tags: ["Inventory Returns"],
      summary: "Get returns by type",
      description: "Retrieve inventory returns of a specific type. Requires authentication.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "returnType",
          in: "path",
          required: true,
          schema: { 
            type: "string", 
            enum: ["Customer Return", "Supplier Return", "Damaged Goods", "Defective Product"]
          },
          description: "Return type to filter by"
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
          schema: { type: "string", default: "-createdAt" },
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
                      returns: {
                        type: "array",
                        items: { $ref: "#/components/schemas/InventoryReturn" }
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
  },
  "/inventory-returns/warehouse/{warehouseId}": {
    get: {
      tags: ["Inventory Returns"],
      summary: "Get returns by warehouse",
      description: "Retrieve inventory returns for a specific warehouse. Requires authentication. The warehouseId parameter is the MongoDB ObjectId that identifies a warehouse in the database.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "warehouseId",
          in: "path",
          required: true,
          schema: { 
            type: "string",
            pattern: "^[a-f\\d]{24}$" 
          },
          example: "64f5a7b3c5dc0d34f85d969e",
          description: "MongoDB ID of the warehouse"
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
          schema: { type: "string", default: "-createdAt" },
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
                      returns: {
                        type: "array",
                        items: { $ref: "#/components/schemas/InventoryReturn" }
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
  },
  "/inventory-returns/supplier/{supplierId}": {
    get: {
      tags: ["Inventory Returns"],
      summary: "Get returns by supplier",
      description: "Retrieve inventory returns for a specific supplier. Requires authentication. The supplierId parameter is the MongoDB ObjectId that identifies a supplier in the database.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "supplierId",
          in: "path",
          required: true,
          schema: { 
            type: "string",
            pattern: "^[a-f\\d]{24}$" 
          },
          example: "64f5a7b3c5dc0d34f85d969e",
          description: "MongoDB ID of the supplier"
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
          schema: { type: "string", default: "-createdAt" },
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
                      returns: {
                        type: "array",
                        items: { $ref: "#/components/schemas/InventoryReturn" }
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
  },
  "/inventory-returns/date-range/{fromDate}/{toDate}": {
    get: {
      tags: ["Inventory Returns"],
      summary: "Get returns by date range",
      description: "Retrieve inventory returns within a specific date range. Requires authentication.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "fromDate",
          in: "path",
          required: true,
          schema: { 
            type: "string",
            format: "date" 
          },
          example: "2023-01-01",
          description: "Start date (YYYY-MM-DD)"
        },
        {
          name: "toDate",
          in: "path",
          required: true,
          schema: { 
            type: "string",
            format: "date" 
          },
          example: "2023-12-31",
          description: "End date (YYYY-MM-DD)"
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
          schema: { type: "string", default: "-createdAt" },
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
                      returns: {
                        type: "array",
                        items: { $ref: "#/components/schemas/InventoryReturn" }
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
