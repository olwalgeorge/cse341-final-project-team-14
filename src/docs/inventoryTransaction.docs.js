module.exports = {
  "/inventory-transactions": {
    get: {
      tags: ["Inventory Transactions"],
      summary: "Get all inventory transactions",
      description: "Retrieve a list of all inventory transactions with optional filtering, sorting, and pagination. Requires authentication.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "query",
          name: "transactionType",
          schema: {
            type: "string",
            enum: [
              "Adjustment",
              "Purchase",
              "Sale",
              "Return",
              "Transfer In",
              "Transfer Out",
              "Damaged",
              "Expired",
              "Initial"
            ]
          },
          description: "Filter by transaction type"
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
          name: "fromWarehouse",
          schema: { type: "string" },
          description: "Filter by source warehouse (for transfers)"
        },
        {
          in: "query",
          name: "toWarehouse",
          schema: { type: "string" },
          description: "Filter by destination warehouse (for transfers)"
        },
        {
          in: "query",
          name: "documentType",
          schema: {
            type: "string",
            enum: [
              "Purchase", 
              "Order", 
              "InventoryAdjustment", 
              "InventoryTransfer", 
              "InventoryReturn"
            ]
          },
          description: "Filter by reference document type"
        },
        {
          in: "query",
          name: "fromDate",
          schema: { type: "string", format: "date" },
          description: "Filter transactions after this date (inclusive)"
        },
        {
          in: "query",
          name: "toDate",
          schema: { type: "string", format: "date" },
          description: "Filter transactions before this date (inclusive)"
        },
        {
          in: "query",
          name: "minChange",
          schema: { type: "integer" },
          description: "Filter by minimum quantity change"
        },
        {
          in: "query",
          name: "maxChange",
          schema: { type: "integer" },
          description: "Filter by maximum quantity change"
        },
        {
          in: "query",
          name: "performedBy",
          schema: { type: "string" },
          description: "Filter by user who performed the transaction"
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
          schema: { type: "string", default: "-transactionDate" },
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
                      transactions: {
                        type: "array",
                        items: { $ref: "#/components/schemas/InventoryTransaction" }
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
        "403": { $ref: "#/components/responses/Forbidden" },
        "500": { $ref: "#/components/responses/ServerError" }
      }
    },
    post: {
      tags: ["Inventory Transactions"],
      summary: "Create a new inventory transaction",
      description: "Create a new inventory transaction record in the system. Requires MANAGER or ADMIN role.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/InventoryTransactionInput" }
          }
        }
      },
      responses: {
        "201": {
          description: "Inventory transaction created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string" },
                  data: { $ref: "#/components/schemas/InventoryTransaction" }
                }
              }
            }
          }
        },
        "400": { $ref: "#/components/responses/BadRequest" },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "403": { $ref: "#/components/responses/Forbidden" },
        "500": { $ref: "#/components/responses/ServerError" }
      }
    },
    delete: {
      tags: ["Inventory Transactions"],
      summary: "Delete all inventory transactions",
      description: "Delete all inventory transactions from the system (use with caution). Restricted to ADMIN role only.",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "All inventory transactions deleted successfully",
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
        "403": { $ref: "#/components/responses/Forbidden" },
        "500": { $ref: "#/components/responses/ServerError" }
      }
    }
  },
  "/inventory-transactions/{transaction_Id}": {
    get: {
      tags: ["Inventory Transactions"],
      summary: "Get inventory transaction by ID",
      description: "Retrieve inventory transaction details by MongoDB ID. Requires authentication. The transaction_Id parameter is the MongoDB ObjectId (24 character hexadecimal) that uniquely identifies a transaction in the database.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "transaction_Id",
          in: "path",
          required: true,
          schema: { 
            type: "string",
            pattern: "^[a-f\\d]{24}$" 
          },
          example: "64f5a7b3c5dc0d34f85d969e",
          description: "MongoDB ID of the inventory transaction"
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
                  data: { $ref: "#/components/schemas/InventoryTransaction" }
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
      tags: ["Inventory Transactions"],
      summary: "Delete inventory transaction",
      description: "Delete an inventory transaction by MongoDB ID. Requires ADMIN or MANAGER role. The transaction_Id parameter is the MongoDB ObjectId (24 character hexadecimal) that uniquely identifies a transaction in the database.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "transaction_Id",
          in: "path",
          required: true,
          schema: { 
            type: "string",
            pattern: "^[a-f\\d]{24}$" 
          },
          example: "64f5a7b3c5dc0d34f85d969e",
          description: "MongoDB ID of the inventory transaction to delete"
        }
      ],
      responses: {
        "200": {
          description: "Inventory transaction deleted successfully",
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
        "400": { $ref: "#/components/responses/BadRequest" },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "403": { $ref: "#/components/responses/Forbidden" },
        "404": { $ref: "#/components/responses/NotFound" },
        "500": { $ref: "#/components/responses/ServerError" }
      }
    }
  },
  "/inventory-transactions/transactionID/{transactionID}": {
    get: {
      tags: ["Inventory Transactions"],
      summary: "Get inventory transaction by transaction ID",
      description: "Retrieve inventory transaction details by transaction ID (IT-XXXXX format). Requires authentication.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "transactionID",
          in: "path",
          required: true,
          schema: { type: "string", pattern: "^IT-\\d{5}$" },
          example: "IT-00001",
          description: "Transaction ID in IT-XXXXX format"
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
                  data: { $ref: "#/components/schemas/InventoryTransaction" }
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
  "/inventory-transactions/product/{productId}": {
    get: {
      tags: ["Inventory Transactions"],
      summary: "Get inventory transactions by product",
      description: "Retrieve inventory transactions for a specific product. Requires authentication. The productId parameter is the MongoDB ObjectId (24 character hexadecimal) that identifies a product in the database.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "productId",
          in: "path",
          required: true,
          schema: { 
            type: "string",
            pattern: "^[a-f\\d]{24}$" 
          },
          example: "64f5a7b3c5dc0d34f85d969e",
          description: "MongoDB ID of the product"
        },
        {
          in: "query",
          name: "transactionType",
          schema: { type: "string" },
          description: "Filter by transaction type"
        },
        {
          in: "query",
          name: "warehouse",
          schema: { type: "string" },
          description: "Filter by warehouse ID"
        },
        {
          in: "query",
          name: "fromDate",
          schema: { type: "string", format: "date" },
          description: "Filter transactions after this date (inclusive)"
        },
        {
          in: "query",
          name: "toDate",
          schema: { type: "string", format: "date" },
          description: "Filter transactions before this date (inclusive)"
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
          schema: { type: "string", default: "-transactionDate" },
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
                      transactions: {
                        type: "array",
                        items: { $ref: "#/components/schemas/InventoryTransaction" }
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
        "404": { $ref: "#/components/responses/NotFound" },
        "500": { $ref: "#/components/responses/ServerError" }
      }
    }
  },
  "/inventory-transactions/warehouse/{warehouseId}": {
    get: {
      tags: ["Inventory Transactions"],
      summary: "Get inventory transactions by warehouse",
      description: "Retrieve inventory transactions for a specific warehouse. Requires authentication. The warehouseId parameter is the MongoDB ObjectId (24 character hexadecimal) that identifies a warehouse in the database.",
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
          name: "transactionType",
          schema: { type: "string" },
          description: "Filter by transaction type"
        },
        {
          in: "query",
          name: "product",
          schema: { type: "string" },
          description: "Filter by product ID"
        },
        {
          in: "query",
          name: "fromDate",
          schema: { type: "string", format: "date" },
          description: "Filter transactions after this date (inclusive)"
        },
        {
          in: "query",
          name: "toDate",
          schema: { type: "string", format: "date" },
          description: "Filter transactions before this date (inclusive)"
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
          schema: { type: "string", default: "-transactionDate" },
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
                      transactions: {
                        type: "array",
                        items: { $ref: "#/components/schemas/InventoryTransaction" }
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
        "404": { $ref: "#/components/responses/NotFound" },
        "500": { $ref: "#/components/responses/ServerError" }
      }
    }
  },
  "/inventory-transactions/type/{transactionType}": {
    get: {
      tags: ["Inventory Transactions"],
      summary: "Get inventory transactions by type",
      description: "Retrieve inventory transactions of a specific type. Requires authentication.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "transactionType",
          in: "path",
          required: true,
          schema: {
            type: "string",
            enum: [
              "Adjustment",
              "Purchase",
              "Sale",
              "Return",
              "Transfer In",
              "Transfer Out",
              "Damaged",
              "Expired",
              "Initial"
            ]
          },
          description: "Transaction type"
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
          name: "fromWarehouse",
          schema: { type: "string" },
          description: "Filter by source warehouse (for transfers)"
        },
        {
          in: "query",
          name: "toWarehouse",
          schema: { type: "string" },
          description: "Filter by destination warehouse (for transfers)"
        },
        {
          in: "query",
          name: "fromDate",
          schema: { type: "string", format: "date" },
          description: "Filter transactions after this date (inclusive)"
        },
        {
          in: "query",
          name: "toDate",
          schema: { type: "string", format: "date" },
          description: "Filter transactions before this date (inclusive)"
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
          schema: { type: "string", default: "-transactionDate" },
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
                      transactions: {
                        type: "array",
                        items: { $ref: "#/components/schemas/InventoryTransaction" }
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
