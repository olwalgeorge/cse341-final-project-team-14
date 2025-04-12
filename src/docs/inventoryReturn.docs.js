module.exports = {
  "/inventory-returns": {
    get: {
      tags: ["Inventory Returns"],
      summary: "Get all inventory returns",
      description: "Retrieve a list of all inventory returns with optional filtering, sorting, and pagination",
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
      description: "Create a new inventory return record in the system",
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
    }
  },
  "/inventory-returns/{_id}": {
    get: {
      tags: ["Inventory Returns"],
      summary: "Get inventory return by ID",
      description: "Retrieve inventory return details by MongoDB ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "_id",
          in: "path",
          required: true,
          schema: { type: "string" },
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
      description: "Update inventory return details by MongoDB ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "_id",
          in: "path",
          required: true,
          schema: { type: "string" },
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
      description: "Delete an inventory return by MongoDB ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "_id",
          in: "path",
          required: true,
          schema: { type: "string" },
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
      description: "Retrieve inventory return details by return ID (RET-XXXXX format)",
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
  "/inventory-returns/{_id}/approve": {
    put: {
      tags: ["Inventory Returns"],
      summary: "Approve inventory return",
      description: "Approve an inventory return request and change its status to Approved",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "_id",
          in: "path",
          required: true,
          schema: { type: "string" },
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
  "/inventory-returns/{_id}/complete": {
    put: {
      tags: ["Inventory Returns"],
      summary: "Complete inventory return",
      description: "Mark an inventory return as completed and update inventory accordingly",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "_id",
          in: "path",
          required: true,
          schema: { type: "string" },
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
      description: "Retrieve inventory returns with a specific status",
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
      description: "Retrieve inventory returns of a specific type",
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
  }
};
