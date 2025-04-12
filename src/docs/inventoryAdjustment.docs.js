module.exports = {
  "/inventory-adjustments": {
    get: {
      tags: ["Inventory Adjustments"],
      summary: "Get all inventory adjustments",
      description: "Retrieve a list of all inventory adjustments with optional filtering, sorting, and pagination",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "query",
          name: "status",
          schema: { 
            type: "string",
            enum: ["Pending", "Approved", "Completed", "Rejected", "Canceled"] 
          },
          description: "Filter adjustments by status"
        },
        {
          in: "query",
          name: "adjustmentType",
          schema: { 
            type: "string",
            enum: ["Quantity Correction", "Inventory Count", "Write-Off", "Expired", "Damaged"] 
          },
          description: "Filter by adjustment type"
        },
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
          name: "requestedBy",
          schema: { type: "string" },
          description: "Filter by user who requested the adjustment"
        },
        {
          in: "query",
          name: "approvedBy",
          schema: { type: "string" },
          description: "Filter by user who approved the adjustment"
        },
        {
          in: "query",
          name: "fromDate",
          schema: { type: "string", format: "date" },
          description: "Filter adjustments after this date (inclusive)"
        },
        {
          in: "query",
          name: "toDate",
          schema: { type: "string", format: "date" },
          description: "Filter adjustments before this date (inclusive)"
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
                      adjustments: {
                        type: "array",
                        items: { $ref: "#/components/schemas/InventoryAdjustment" }
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
      tags: ["Inventory Adjustments"],
      summary: "Create a new inventory adjustment",
      description: "Create a new inventory adjustment record in the system",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/InventoryAdjustmentInput" }
          }
        }
      },
      responses: {
        "201": {
          description: "Inventory adjustment created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string" },
                  data: { $ref: "#/components/schemas/InventoryAdjustment" }
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
  "/inventory-adjustments/{_id}": {
    get: {
      tags: ["Inventory Adjustments"],
      summary: "Get inventory adjustment by ID",
      description: "Retrieve inventory adjustment details by MongoDB ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "_id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "MongoDB ID of the inventory adjustment"
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
                  data: { $ref: "#/components/schemas/InventoryAdjustment" }
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
      tags: ["Inventory Adjustments"],
      summary: "Update inventory adjustment",
      description: "Update inventory adjustment details by MongoDB ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "_id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "MongoDB ID of the inventory adjustment"
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/InventoryAdjustmentUpdate" }
          }
        }
      },
      responses: {
        "200": {
          description: "Inventory adjustment updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string" },
                  data: { $ref: "#/components/schemas/InventoryAdjustment" }
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
      tags: ["Inventory Adjustments"],
      summary: "Delete inventory adjustment",
      description: "Delete an inventory adjustment by MongoDB ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "_id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "MongoDB ID of the inventory adjustment to delete"
        }
      ],
      responses: {
        "200": {
          description: "Inventory adjustment deleted successfully",
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
  "/inventory-adjustments/adjustmentID/{adjustmentID}": {
    get: {
      tags: ["Inventory Adjustments"],
      summary: "Get inventory adjustment by adjustment ID",
      description: "Retrieve inventory adjustment details by adjustment ID (ADJ-XXXXX format)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "adjustmentID",
          in: "path",
          required: true,
          schema: { type: "string", pattern: "^ADJ-\\d{5}$" },
          description: "Adjustment ID in ADJ-XXXXX format"
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
                  data: { $ref: "#/components/schemas/InventoryAdjustment" }
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
  "/inventory-adjustments/{_id}/approve": {
    put: {
      tags: ["Inventory Adjustments"],
      summary: "Approve inventory adjustment",
      description: "Approve an inventory adjustment request and change its status to Approved",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "_id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "MongoDB ID of the inventory adjustment to approve"
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
                  example: "Adjustment approved based on physical count verification"
                }
              }
            }
          }
        }
      },
      responses: {
        "200": {
          description: "Inventory adjustment approved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string" },
                  data: { $ref: "#/components/schemas/InventoryAdjustment" }
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
  "/inventory-adjustments/{_id}/complete": {
    put: {
      tags: ["Inventory Adjustments"],
      summary: "Complete inventory adjustment",
      description: "Execute the inventory adjustment and update inventory quantities",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "_id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "MongoDB ID of the inventory adjustment to complete"
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
                  example: "Adjustment completed and inventory updated"
                }
              }
            }
          }
        }
      },
      responses: {
        "200": {
          description: "Inventory adjustment completed successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string" },
                  data: { $ref: "#/components/schemas/InventoryAdjustment" }
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
  "/inventory-adjustments/status/{status}": {
    get: {
      tags: ["Inventory Adjustments"],
      summary: "Get adjustments by status",
      description: "Retrieve inventory adjustments with a specific status",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "status",
          in: "path",
          required: true,
          schema: { 
            type: "string", 
            enum: ["Pending", "Approved", "Completed", "Rejected", "Canceled"]
          },
          description: "Adjustment status to filter by"
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
                      adjustments: {
                        type: "array",
                        items: { $ref: "#/components/schemas/InventoryAdjustment" }
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
  "/inventory-adjustments/type/{adjustmentType}": {
    get: {
      tags: ["Inventory Adjustments"],
      summary: "Get adjustments by type",
      description: "Retrieve inventory adjustments of a specific type",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "adjustmentType",
          in: "path",
          required: true,
          schema: { 
            type: "string", 
            enum: ["Quantity Correction", "Inventory Count", "Write-Off", "Expired", "Damaged"]
          },
          description: "Adjustment type to filter by"
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
                      adjustments: {
                        type: "array",
                        items: { $ref: "#/components/schemas/InventoryAdjustment" }
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
