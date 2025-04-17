module.exports = {
  "/inventory-transfers": {
    get: {
      tags: ["Inventory Transfers"],
      summary: "Get all inventory transfers",
      description: "Retrieve a list of all inventory transfers with optional filtering, sorting, and pagination. Requires authentication.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "query",
          name: "status",
          schema: { 
            type: "string",
            enum: ["Draft", "Pending", "Approved", "In Transit", "Partially Received", "Completed", "Canceled"] 
          },
          description: "Filter transfers by status"
        },
        {
          in: "query",
          name: "fromWarehouse",
          schema: { type: "string" },
          description: "Filter by source warehouse ID"
        },
        {
          in: "query",
          name: "toWarehouse",
          schema: { type: "string" },
          description: "Filter by destination warehouse ID"
        },
        {
          in: "query",
          name: "product",
          schema: { type: "string" },
          description: "Filter by product ID (returns transfers containing this product)"
        },
        {
          in: "query",
          name: "requestedBy",
          schema: { type: "string" },
          description: "Filter by user who requested the transfer"
        },
        {
          in: "query",
          name: "approvedBy",
          schema: { type: "string" },
          description: "Filter by user who approved the transfer"
        },
        {
          in: "query",
          name: "fromDate",
          schema: { type: "string", format: "date" },
          description: "Filter transfers requested after this date (inclusive)"
        },
        {
          in: "query",
          name: "toDate",
          schema: { type: "string", format: "date" },
          description: "Filter transfers requested before this date (inclusive)"
        },
        {
          in: "query",
          name: "fromDeliveryDate",
          schema: { type: "string", format: "date" },
          description: "Filter transfers with expected delivery after this date"
        },
        {
          in: "query",
          name: "toDeliveryDate",
          schema: { type: "string", format: "date" },
          description: "Filter transfers with expected delivery before this date"
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
          schema: { type: "string", default: "-requestDate" },
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
                      transfers: {
                        type: "array",
                        items: { $ref: "#/components/schemas/InventoryTransfer" }
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
      tags: ["Inventory Transfers"],
      summary: "Create a new inventory transfer",
      description: "Create a new inventory transfer record in the system. Requires authentication.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/InventoryTransferInput" }
          }
        }
      },
      responses: {
        "201": {
          description: "Inventory transfer created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string" },
                  data: { $ref: "#/components/schemas/InventoryTransfer" }
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
      tags: ["Inventory Transfers"],
      summary: "Delete all inventory transfers",
      description: "Delete all inventory transfers from the system (use with caution). Requires authentication.",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "All inventory transfers deleted successfully",
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
  "/inventory-transfers/{transfer_Id}": {
    get: {
      tags: ["Inventory Transfers"],
      summary: "Get inventory transfer by ID",
      description: "Retrieve inventory transfer details by MongoDB ID. Requires authentication. The transfer_Id parameter is the MongoDB ObjectId (24 character hexadecimal) that uniquely identifies an inventory transfer in the database.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "transfer_Id",
          in: "path",
          required: true,
          schema: { 
            type: "string",
            pattern: "^[a-f\\d]{24}$" 
          },
          example: "64f5a7b3c5dc0d34f85d969e",
          description: "MongoDB ID of the inventory transfer"
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
                  data: { $ref: "#/components/schemas/InventoryTransfer" }
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
      tags: ["Inventory Transfers"],
      summary: "Update inventory transfer",
      description: "Update inventory transfer details by MongoDB ID. Requires authentication. The transfer_Id parameter is the MongoDB ObjectId (24 character hexadecimal) that uniquely identifies an inventory transfer in the database.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "transfer_Id",
          in: "path",
          required: true,
          schema: { 
            type: "string",
            pattern: "^[a-f\\d]{24}$" 
          },
          example: "64f5a7b3c5dc0d34f85d969e",
          description: "MongoDB ID of the inventory transfer"
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/InventoryTransferUpdate" }
          }
        }
      },
      responses: {
        "200": {
          description: "Inventory transfer updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string" },
                  data: { $ref: "#/components/schemas/InventoryTransfer" }
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
      tags: ["Inventory Transfers"],
      summary: "Delete inventory transfer",
      description: "Delete an inventory transfer by MongoDB ID. Requires authentication. The transfer_Id parameter is the MongoDB ObjectId (24 character hexadecimal) that uniquely identifies an inventory transfer in the database.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "transfer_Id",
          in: "path",
          required: true,
          schema: { 
            type: "string",
            pattern: "^[a-f\\d]{24}$" 
          },
          example: "64f5a7b3c5dc0d34f85d969e",
          description: "MongoDB ID of the inventory transfer to delete"
        }
      ],
      responses: {
        "200": {
          description: "Inventory transfer deleted successfully",
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
  "/inventory-transfers/transferID/{transferID}": {
    get: {
      tags: ["Inventory Transfers"],
      summary: "Get inventory transfer by transfer ID",
      description: "Retrieve inventory transfer details by transfer ID (TR-XXXXX format). Requires authentication.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "transferID",
          in: "path",
          required: true,
          schema: { type: "string", pattern: "^TR-\\d{5}$" },
          description: "Transfer ID in TR-XXXXX format"
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
                  data: { $ref: "#/components/schemas/InventoryTransfer" }
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
  "/inventory-transfers/{transfer_Id}/approve": {
    put: {
      tags: ["Inventory Transfers"],
      summary: "Approve inventory transfer",
      description: "Approve an inventory transfer and change its status to Approved. Requires authentication. The transfer_Id parameter is the MongoDB ObjectId (24 character hexadecimal) that uniquely identifies an inventory transfer in the database.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "transfer_Id",
          in: "path",
          required: true,
          schema: { 
            type: "string",
            pattern: "^[a-f\\d]{24}$" 
          },
          example: "64f5a7b3c5dc0d34f85d969e",
          description: "MongoDB ID of the inventory transfer to approve"
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
                  example: "Approved after verification of stock levels"
                }
              }
            }
          }
        }
      },
      responses: {
        "200": {
          description: "Inventory transfer approved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string" },
                  data: { $ref: "#/components/schemas/InventoryTransfer" }
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
  "/inventory-transfers/{transfer_Id}/ship": {
    put: {
      tags: ["Inventory Transfers"],
      summary: "Ship inventory transfer",
      description: "Ship an inventory transfer, update inventory at source warehouse, and change status to In Transit. Requires authentication. The transfer_Id parameter is the MongoDB ObjectId (24 character hexadecimal) that uniquely identifies an inventory transfer in the database.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "transfer_Id",
          in: "path",
          required: true,
          schema: { 
            type: "string",
            pattern: "^[a-f\\d]{24}$" 
          },
          example: "64f5a7b3c5dc0d34f85d969e",
          description: "MongoDB ID of the inventory transfer to ship"
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                transportInfo: {
                  type: "object",
                  properties: {
                    method: { type: "string", example: "Truck" },
                    carrier: { type: "string", example: "Fast Logistics" },
                    trackingNumber: { type: "string", example: "FL123456789" }
                  }
                },
                notes: {
                  type: "string",
                  example: "Dispatched via company truck"
                }
              }
            }
          }
        }
      },
      responses: {
        "200": {
          description: "Inventory transfer shipped successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string" },
                  data: { $ref: "#/components/schemas/InventoryTransfer" }
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
  "/inventory-transfers/{transfer_Id}/receive": {
    put: {
      tags: ["Inventory Transfers"],
      summary: "Receive inventory transfer",
      description: "Receive items from an inventory transfer, update inventory at destination warehouse, and update status. Requires authentication. The transfer_Id parameter is the MongoDB ObjectId (24 character hexadecimal) that uniquely identifies an inventory transfer in the database.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "transfer_Id",
          in: "path",
          required: true,
          schema: { 
            type: "string",
            pattern: "^[a-f\\d]{24}$" 
          },
          example: "64f5a7b3c5dc0d34f85d969e",
          description: "MongoDB ID of the inventory transfer to receive"
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["items"],
              properties: {
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    required: ["product", "receivedQuantity"],
                    properties: {
                      product: { type: "string", example: "67f8ec8aaf6bfc397a056b7f" },
                      receivedQuantity: { type: "integer", example: 3 }
                    }
                  }
                },
                notes: {
                  type: "string",
                  example: "Partial receipt due to some items being back-ordered"
                }
              }
            }
          }
        }
      },
      responses: {
        "200": {
          description: "Inventory transfer received successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string" },
                  data: { $ref: "#/components/schemas/InventoryTransfer" }
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
  "/inventory-transfers/from-warehouse/{warehouseId}": {
    get: {
      tags: ["Inventory Transfers"],
      summary: "Get transfers by source warehouse",
      description: "Retrieve inventory transfers from a specific warehouse. Requires authentication. The warehouseId parameter is the MongoDB ObjectId that identifies a warehouse in the database.",
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
          description: "MongoDB ID of the source warehouse"
        },
        {
          in: "query",
          name: "status",
          schema: { 
            type: "string",
            enum: ["Draft", "Pending", "Approved", "In Transit", "Partially Received", "Completed", "Canceled"] 
          },
          description: "Filter transfers by status"
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
          schema: { type: "string", default: "-requestDate" },
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
                      transfers: {
                        type: "array",
                        items: { $ref: "#/components/schemas/InventoryTransfer" }
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
  "/inventory-transfers/to-warehouse/{warehouseId}": {
    get: {
      tags: ["Inventory Transfers"],
      summary: "Get transfers by destination warehouse",
      description: "Retrieve inventory transfers to a specific warehouse. Requires authentication. The warehouseId parameter is the MongoDB ObjectId that identifies a warehouse in the database.",
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
          description: "MongoDB ID of the destination warehouse"
        },
        {
          in: "query",
          name: "status",
          schema: { 
            type: "string",
            enum: ["Draft", "Pending", "Approved", "In Transit", "Partially Received", "Completed", "Canceled"] 
          },
          description: "Filter transfers by status"
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
          schema: { type: "string", default: "-requestDate" },
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
                      transfers: {
                        type: "array",
                        items: { $ref: "#/components/schemas/InventoryTransfer" }
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
  "/inventory-transfers/status/{status}": {
    get: {
      tags: ["Inventory Transfers"],
      summary: "Get transfers by status",
      description: "Retrieve inventory transfers with a specific status. Requires authentication.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "status",
          in: "path",
          required: true,
          schema: { 
            type: "string",
            enum: ["Draft", "Pending", "Approved", "In Transit", "Partially Received", "Completed", "Canceled"] 
          },
          description: "Transfer status to filter by"
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
          schema: { type: "string", default: "-requestDate" },
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
                      transfers: {
                        type: "array",
                        items: { $ref: "#/components/schemas/InventoryTransfer" }
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
