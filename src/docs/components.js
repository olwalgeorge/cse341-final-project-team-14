module.exports = {
  securitySchemes: {
    bearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
      description: 'Enter your JWT token in the format "Bearer {token}"',
    },
  },
  schemas: {
    Error: {
      type: "object",
      properties: {
        success: {
          type: "boolean",
          example: false,
        },
        message: {
          type: "string",
        },
        error: {
          type: "array",
          items: {
            type: "string",
          },
        },
      },
    },
    Success: {
      type: "object",
      properties: {
        success: {
          type: "boolean",
          example: true,
        },
        message: {
          type: "string",
        },
        data: {
          type: "object",
        },
      },
    },
    User: {
      type: "object",
      properties: {
        userID: {
          type: "string",
          pattern: "^SM-\\d{5}$",
          example: "SM-00001",
        },
        username: {
          type: "string",
          example: "john_doe",
        },
        email: {
          type: "string",
          format: "email",
          example: "john.doe@example.com",
        },
        fullName: {
          type: "string",
          example: "John Doe",
        },
        role: {
          type: "string",
          enum: ["SUPERADMIN", "ADMIN", "USER", "ORG"],
        },
      },
    },
    Supplier: {
      type: "object",
      properties: {
        _id: { type: "string" },
        supplierID: { type: "string", example: "SP-00001" },
        name: { type: "string", example: "TechSupply Co" },
        contact: {
          type: "object",
          properties: {
            phone: { type: "string", example: "1234567890" },
            email: { type: "string", example: "contact@techsupply.com" },
          },
        },
        address: {
          type: "object",
          properties: {
            street: { type: "string", example: "123 Tech Street" },
            city: { type: "string", example: "San Francisco" },
            state: { type: "string", example: "CA" },
            postalCode: { type: "string", example: "94107" },
            country: { type: "string", example: "USA" },
          },
        },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
    SupplierInput: {
      type: "object",
      required: ["name", "contact"],
      properties: {
        name: { type: "string", example: "TechSupply Co" },
        contact: {
          type: "object",
          properties: {
            phone: { type: "string", example: "1234567890" },
            email: { type: "string", example: "contact@techsupply.com" },
          },
        },
        address: {
          type: "object",
          properties: {
            street: { type: "string", example: "123 Tech Street" },
            city: { type: "string", example: "San Francisco" },
            state: { type: "string", example: "CA" },
            postalCode: { type: "string", example: "94107" },
            country: { type: "string", example: "USA" },
          },
        },
      },
    },
    SupplierUpdate: {
      type: "object",
      properties: {
        name: { type: "string", example: "TechSupply Corporation" },
        contact: {
          type: "object",
          properties: {
            phone: { type: "string", example: "9876543210" },
            email: { type: "string", example: "info@techsupply.com" },
          },
        },
        address: {
          type: "object",
          properties: {
            street: { type: "string", example: "456 Tech Avenue" },
            city: { type: "string", example: "San Francisco" },
            state: { type: "string", example: "CA" },
            postalCode: { type: "string", example: "94108" },
            country: { type: "string", example: "USA" },
          },
        },
      },
    },
    Product: {
      type: "object",
      properties: {
        _id: { type: "string" },
        productID: { type: "string", example: "PR-00001" },
        name: { type: "string", example: "MacBook Pro M3" },
        description: {
          type: "string",
          example: "Latest MacBook Pro with M3 chip",
        },
        price: { type: "number", example: 1999.99 },
        quantity: { type: "integer", example: 10 },
        category: { type: "string", example: "Electronics" },
        supplier: {
          oneOf: [
            { type: "string" },
            { $ref: "#/components/schemas/Supplier" },
          ],
        },
        sku: { type: "string", example: "APPL123456" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
    ProductInput: {
      type: "object",
      required: ["name", "price", "quantity", "category", "supplier"],
      properties: {
        name: { type: "string", example: "MacBook Pro M3" },
        description: {
          type: "string",
          example: "Latest MacBook Pro with M3 chip",
        },
        price: { type: "number", example: 1999.99 },
        quantity: { type: "integer", example: 10 },
        category: { type: "string", example: "Electronics" },
        supplier: { type: "string", example: "65fb123abc456d789e012345" },
        sku: { type: "string", example: "APPL123456" },
      },
    },
    ProductUpdate: {
      type: "object",
      properties: {
        name: { type: "string", example: "MacBook Pro M3 Pro" },
        description: { type: "string", example: "Updated description" },
        price: { type: "number", example: 2199.99 },
        quantity: { type: "integer", example: 8 },
        category: { type: "string", example: "Electronics" },
        supplier: { type: "string", example: "65fb123abc456d789e012345" },
        sku: { type: "string", example: "APPL123456" },
      },
    },
    Order: {
      type: "object",
      properties: {
        _id: { type: "string" },
        orderID: { type: "string", example: "OR-00001" },
        customer: {
          oneOf: [
            { type: "string" },
            { $ref: "#/components/schemas/Customer" },
          ],
        },
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              product: {
                oneOf: [
                  { type: "string" },
                  { $ref: "#/components/schemas/Product" },
                ],
              },
              quantity: { type: "integer", example: 2 },
              price: { type: "number", example: 1999.99 },
            },
          },
        },
        status: {
          type: "string",
          enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
        },
        shippingAddress: {
          type: "object",
          properties: {
            street: { type: "string", example: "123 Main St" },
            city: { type: "string", example: "San Francisco" },
            state: { type: "string", example: "CA" },
            postalCode: { type: "string", example: "94107" },
            country: { type: "string", example: "USA" },
          },
        },
        orderDate: { type: "string", format: "date-time" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
    OrderInput: {
      type: "object",
      required: ["customer", "items", "shippingAddress"],
      properties: {
        customer: { type: "string", example: "65fb123abc456d789e012348" },
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              product: { type: "string", example: "65fb123abc456d789e012345" },
              quantity: { type: "integer", example: 2 },
              price: { type: "number", example: 1999.99 },
            },
          },
        },
        status: {
          type: "string",
          enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
        },
        shippingAddress: {
          type: "object",
          properties: {
            street: { type: "string", example: "123 Main St" },
            city: { type: "string", example: "San Francisco" },
            state: { type: "string", example: "CA" },
            postalCode: { type: "string", example: "94107" },
            country: { type: "string", example: "USA" },
          },
        },
      },
    },
    Customer: {
      type: "object",
      properties: {
        _id: { type: "string" },
        customerID: { type: "string", example: "CU-00001" },
        name: { type: "string", example: "John Doe" },
        email: { type: "string", example: "john.doe@example.com" },
        phone: { type: "string", example: "1234567890" },
        address: {
          type: "object",
          properties: {
            street: { type: "string", example: "123 Main St" },
            city: { type: "string", example: "Anytown" },
            state: { type: "string", example: "CA" },
            postalCode: { type: "string", example: "12345" },
            country: { type: "string", example: "USA" },
          },
        },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
    CustomerInput: {
      type: "object",
      required: ["name", "email"],
      properties: {
        name: { type: "string", example: "John Doe" },
        email: { type: "string", example: "john.doe@example.com" },
        phone: { type: "string", example: "1234567890" },
        address: {
          type: "object",
          properties: {
            street: { type: "string", example: "123 Main St" },
            city: { type: "string", example: "Anytown" },
            state: { type: "string", example: "CA" },
            postalCode: { type: "string", example: "12345" },
            country: { type: "string", example: "USA" },
          },
        },
      },
    },
    Purchase: {
      type: "object",
      properties: {
        _id: { type: "string" },
        purchaseID: { type: "string", example: "PU-00001" },
        supplier: {
          oneOf: [
            { type: "string" },
            { $ref: "#/components/schemas/Supplier" },
          ],
        },
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              product: {
                oneOf: [
                  { type: "string" },
                  { $ref: "#/components/schemas/Product" },
                ],
              },
              quantity: { type: "integer", example: 5 },
              price: { type: "number", example: 1800.0 },
            },
          },
        },
        totalAmount: { type: "number", example: 9000.0 },
        purchaseDate: { type: "string", format: "date-time" },
        status: {
          type: "string",
          enum: ["pending", "ordered", "received", "cancelled", "returned"],
        },
        paymentStatus: {
          type: "string",
          enum: ["unpaid", "partially_paid", "paid"],
        },
        paymentDue: { type: "string", format: "date-time" },
        notes: {
          type: "string",
          example: "Bulk purchase of laptops for inventory",
        },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
    PurchaseInput: {
      type: "object",
      required: ["supplier", "items", "totalAmount"],
      properties: {
        supplier: { type: "string", example: "65fb123abc456d789e012346" },
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              product: { type: "string", example: "65fb123abc456d789e012345" },
              quantity: { type: "integer", example: 5 },
              price: { type: "number", example: 1800.0 },
            },
          },
        },
        totalAmount: { type: "number", example: 9000.0 },
        purchaseDate: { type: "string", format: "date-time" },
        status: {
          type: "string",
          enum: ["pending", "ordered", "received", "cancelled", "returned"],
        },
        paymentStatus: {
          type: "string",
          enum: ["unpaid", "partially_paid", "paid"],
        },
        paymentDue: { type: "string", format: "date-time" },
        notes: {
          type: "string",
          example: "Bulk purchase of laptops for inventory",
        },
      },
    },
    PurchaseUpdate: {
      type: "object",
      properties: {
        supplier: { type: "string", example: "65fb123abc456d789e012346" },
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              product: { type: "string", example: "65fb123abc456d789e012345" },
              quantity: { type: "integer", example: 5 },
              price: { type: "number", example: 1800.0 },
            },
          },
        },
        totalAmount: { type: "number", example: 9000.0 },
        purchaseDate: { type: "string", format: "date-time" },
        status: {
          type: "string",
          enum: ["pending", "ordered", "received", "cancelled", "returned"],
        },
        paymentStatus: {
          type: "string",
          enum: ["unpaid", "partially_paid", "paid"],
        },
        paymentDue: { type: "string", format: "date-time" },
        notes: {
          type: "string",
          example: "Bulk purchase of laptops for inventory",
        },
      },
    },
    InventoryTransaction: {
      type: "object",
      properties: {
        _id: { type: "string" },
        transactionID: { 
          type: "string", 
          example: "IT-00001",
          pattern: "^IT-\\d{5}$" 
        },
        inventory: {
          oneOf: [
            { type: "string" },
            { $ref: "#/components/schemas/Inventory" }
          ]
        },
        product: {
          oneOf: [
            { type: "string" },
            { $ref: "#/components/schemas/Product" }
          ]
        },
        warehouse: {
          oneOf: [
            { type: "string" },
            { $ref: "#/components/schemas/Warehouse" }
          ]
        },
        transactionType: {
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
          ],
          example: "Purchase"
        },
        transactionDate: {
          type: "string",
          format: "date-time"
        },
        quantityBefore: {
          type: "number",
          example: 10
        },
        quantityChange: {
          type: "number",
          example: 5
        },
        quantityAfter: {
          type: "number",
          example: 15
        },
        reference: {
          type: "object",
          properties: {
            documentType: {
              type: "string",
              enum: [
                "Purchase", 
                "Order", 
                "InventoryAdjustment", 
                "InventoryTransfer", 
                "InventoryReturn"
              ],
              example: "Purchase"
            },
            documentId: {
              type: "string",
              example: "67f66c737ed7ddb60e54af70"
            },
            documentCode: {
              type: "string",
              example: "PU-00001"
            }
          }
        },
        fromWarehouse: {
          oneOf: [
            { type: "string" },
            { $ref: "#/components/schemas/Warehouse" }
          ]
        },
        toWarehouse: {
          oneOf: [
            { type: "string" },
            { $ref: "#/components/schemas/Warehouse" }
          ]
        },
        notes: {
          type: "string",
          example: "Stock received from supplier"
        },
        performedBy: {
          oneOf: [
            { type: "string" },
            { $ref: "#/components/schemas/User" }
          ]
        },
        createdAt: {
          type: "string",
          format: "date-time"
        },
        updatedAt: {
          type: "string",
          format: "date-time"
        }
      }
    },
    InventoryTransactionInput: {
      type: "object",
      required: [
        "product",
        "warehouse",
        "transactionType",
        "quantityBefore",
        "quantityChange"
      ],
      properties: {
        transactionID: { 
          type: "string", 
          example: "IT-00001",
          description: "Optional - will be auto-generated if not provided"
        },
        inventory: {
          type: "string",
          example: "67f8f19c967f8b21cb2ae9c5"
        },
        product: {
          type: "string",
          example: "67f8ec8aaf6bfc397a056b7f"
        },
        warehouse: {
          type: "string",
          example: "67f8e3c85b1777f2f72ac8e9"
        },
        transactionType: {
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
          ],
          example: "Purchase"
        },
        transactionDate: {
          type: "string",
          format: "date-time",
          description: "Optional - defaults to current date/time"
        },
        quantityBefore: {
          type: "number",
          example: 10
        },
        quantityChange: {
          type: "number",
          example: 5
        },
        reference: {
          type: "object",
          properties: {
            documentType: {
              type: "string",
              enum: [
                "Purchase", 
                "Order", 
                "InventoryAdjustment", 
                "InventoryTransfer", 
                "InventoryReturn"
              ],
              example: "Purchase"
            },
            documentId: {
              type: "string",
              example: "67f66c737ed7ddb60e54af70"
            },
            documentCode: {
              type: "string",
              example: "PU-00001"
            }
          }
        },
        fromWarehouse: {
          type: "string",
          example: "67f8e3c85b1777f2f72ac8e9",
          description: "Required for Transfer Out transactions"
        },
        toWarehouse: {
          type: "string",
          example: "67fa93a246dd3dafdcbf730b",
          description: "Required for Transfer In transactions"
        },
        notes: {
          type: "string",
          example: "Stock received from supplier"
        }
      }
    },
    Inventory: {
      type: "object",
      properties: {
        _id: { type: "string" },
        inventoryID: { 
          type: "string", 
          example: "IN-00001",
          pattern: "^IN-\\d{5}$" 
        },
        product: {
          oneOf: [
            { type: "string" },
            { $ref: "#/components/schemas/Product" }
          ]
        },
        warehouse: {
          oneOf: [
            { type: "string" },
            { $ref: "#/components/schemas/Warehouse" }
          ]
        },
        quantity: {
          type: "number",
          example: 25
        },
        minStockLevel: {
          type: "number",
          example: 5
        },
        maxStockLevel: {
          type: "number",
          example: 50
        },
        stockStatus: {
          type: "string",
          enum: ["In Stock", "Low Stock", "Out of Stock", "Overstock"],
          example: "In Stock"
        },
        location: {
          type: "object",
          properties: {
            aisle: { type: "string", example: "A5" },
            rack: { type: "string", example: "R3" },
            bin: { type: "string", example: "B12" }
          }
        },
        lastStockCheck: {
          type: "string",
          format: "date-time"
        },
        notes: {
          type: "string",
          example: "Main stock location for laptops"
        },
        createdAt: {
          type: "string",
          format: "date-time"
        },
        updatedAt: {
          type: "string",
          format: "date-time"
        }
      }
    },
    InventoryInput: {
      type: "object",
      required: [
        "product",
        "warehouse"
      ],
      properties: {
        product: {
          type: "string",
          example: "67f8ec8aaf6bfc397a056b7f"
        },
        warehouse: {
          type: "string",
          example: "67f8e3c85b1777f2f72ac8e9"
        },
        quantity: {
          type: "number",
          example: 25,
          description: "Default is 0 if not provided"
        },
        minStockLevel: {
          type: "number",
          example: 5
        },
        maxStockLevel: {
          type: "number",
          example: 50
        },
        location: {
          type: "object",
          properties: {
            aisle: { type: "string", example: "A5" },
            rack: { type: "string", example: "R3" },
            bin: { type: "string", example: "B12" }
          }
        },
        notes: {
          type: "string",
          example: "Main stock location for laptops"
        }
      }
    },
    InventoryUpdate: {
      type: "object",
      properties: {
        quantity: {
          type: "number",
          example: 30
        },
        minStockLevel: {
          type: "number",
          example: 5
        },
        maxStockLevel: {
          type: "number",
          example: 50
        },
        location: {
          type: "object",
          properties: {
            aisle: { type: "string", example: "A5" },
            rack: { type: "string", example: "R3" },
            bin: { type: "string", example: "B12" }
          }
        },
        lastStockCheck: {
          type: "string",
          format: "date-time"
        },
        notes: {
          type: "string",
          example: "Updated stock location for laptops"
        }
      }
    },
    Warehouse: {
      type: "object",
      properties: {
        _id: { type: "string" },
        warehouseID: { 
          type: "string", 
          example: "WH-00001",
          pattern: "^WH-\\d{5}$" 
        },
        name: {
          type: "string",
          example: "East Distribution Center"
        },
        description: {
          type: "string",
          example: "Primary warehouse for eastern region distribution"
        },
        capacity: {
          type: "number",
          example: 50000
        },
        capacityUnit: {
          type: "string",
          example: "sqft"
        },
        status: {
          type: "string",
          enum: ["Active", "Inactive", "Maintenance"],
          example: "Active"
        },
        contact: {
          type: "object",
          properties: {
            name: { type: "string", example: "John Manager" },
            phone: { type: "string", example: "5551234567" },
            email: { type: "string", example: "john.manager@example.com" }
          }
        },
        address: {
          type: "object",
          properties: {
            street: { type: "string", example: "123 Warehouse Blvd" },
            city: { type: "string", example: "Atlanta" },
            state: { type: "string", example: "GA" },
            postalCode: { type: "string", example: "30301" },
            country: { type: "string", example: "USA" }
          }
        },
        createdAt: {
          type: "string",
          format: "date-time"
        },
        updatedAt: {
          type: "string",
          format: "date-time"
        }
      }
    },
    WarehouseInput: {
      type: "object",
      required: [
        "name",
        "capacity",
        "status",
        "address"
      ],
      properties: {
        name: {
          type: "string",
          example: "East Distribution Center"
        },
        description: {
          type: "string",
          example: "Primary warehouse for eastern region distribution"
        },
        capacity: {
          type: "number",
          example: 50000
        },
        capacityUnit: {
          type: "string",
          example: "sqft"
        },
        status: {
          type: "string",
          enum: ["Active", "Inactive", "Maintenance"],
          example: "Active"
        },
        contact: {
          type: "object",
          properties: {
            name: { type: "string", example: "John Manager" },
            phone: { type: "string", example: "5551234567" },
            email: { type: "string", example: "john.manager@example.com" }
          }
        },
        address: {
          type: "object",
          properties: {
            street: { type: "string", example: "123 Warehouse Blvd" },
            city: { type: "string", example: "Atlanta" },
            state: { type: "string", example: "GA" },
            postalCode: { type: "string", example: "30301" },
            country: { type: "string", example: "USA" }
          }
        }
      }
    },
    WarehouseUpdate: {
      type: "object",
      properties: {
        name: {
          type: "string",
          example: "East Distribution Center Updated"
        },
        description: {
          type: "string",
          example: "Updated description for eastern region distribution center"
        },
        capacity: {
          type: "number",
          example: 60000
        },
        capacityUnit: {
          type: "string",
          example: "sqft"
        },
        status: {
          type: "string",
          enum: ["Active", "Inactive", "Maintenance"],
          example: "Maintenance"
        },
        contact: {
          type: "object",
          properties: {
            name: { type: "string", example: "Sarah Manager" },
            phone: { type: "string", example: "5559876543" },
            email: { type: "string", example: "sarah.manager@example.com" }
          }
        },
        address: {
          type: "object",
          properties: {
            street: { type: "string", example: "456 Warehouse Ave" },
            city: { type: "string", example: "Atlanta" },
            state: { type: "string", example: "GA" },
            postalCode: { type: "string", example: "30301" },
            country: { type: "string", example: "USA" }
          }
        }
      }
    },
    InventoryTransfer: {
      type: "object",
      properties: {
        _id: { type: "string" },
        transferID: { 
          type: "string", 
          example: "TR-00001",
          pattern: "^TR-\\d{5}$" 
        },
        fromWarehouse: {
          oneOf: [
            { type: "string" },
            { $ref: "#/components/schemas/Warehouse" }
          ]
        },
        toWarehouse: {
          oneOf: [
            { type: "string" },
            { $ref: "#/components/schemas/Warehouse" }
          ]
        },
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              product: {
                oneOf: [
                  { type: "string" },
                  { $ref: "#/components/schemas/Product" }
                ]
              },
              quantity: { type: "number", example: 5 },
              receivedQuantity: { type: "number", example: 5 },
              notes: { type: "string", example: "Transferring for stock replenishment" }
            }
          }
        },
        status: {
          type: "string",
          enum: ["Draft", "Pending", "Approved", "In Transit", "Partially Received", "Completed", "Canceled"],
          example: "Pending"
        },
        requestDate: {
          type: "string",
          format: "date-time"
        },
        approvalDate: {
          type: "string",
          format: "date-time"
        },
        shippingDate: {
          type: "string",
          format: "date-time"
        },
        receivingDate: {
          type: "string",
          format: "date-time"
        },
        completionDate: {
          type: "string",
          format: "date-time"
        },
        expectedDeliveryDate: {
          type: "string",
          format: "date-time"
        },
        transportInfo: {
          type: "object",
          properties: {
            method: { type: "string", example: "Truck" },
            carrier: { type: "string", example: "Fast Logistics" },
            trackingNumber: { type: "string", example: "FL123456789" }
          }
        },
        requestedBy: {
          oneOf: [
            { type: "string" },
            { $ref: "#/components/schemas/User" }
          ]
        },
        approvedBy: {
          oneOf: [
            { type: "string" },
            { $ref: "#/components/schemas/User" }
          ]
        },
        receivedBy: {
          oneOf: [
            { type: "string" },
            { $ref: "#/components/schemas/User" }
          ]
        },
        notes: {
          type: "string",
          example: "Regular inventory replenishment transfer"
        },
        createdAt: {
          type: "string",
          format: "date-time"
        },
        updatedAt: {
          type: "string",
          format: "date-time"
        }
      }
    },
    InventoryTransferInput: {
      type: "object",
      required: [
        "fromWarehouse",
        "toWarehouse",
        "items"
      ],
      properties: {
        fromWarehouse: {
          type: "string",
          example: "67f8e3c85b1777f2f72ac8e9"
        },
        toWarehouse: {
          type: "string",
          example: "67fa93a246dd3dafdcbf730b"
        },
        items: {
          type: "array",
          items: {
            type: "object",
            required: ["product", "quantity"],
            properties: {
              product: { type: "string", example: "67f8ec8aaf6bfc397a056b7f" },
              quantity: { type: "number", example: 5 },
              notes: { type: "string", example: "Transferring for stock replenishment" }
            }
          }
        },
        status: {
          type: "string",
          enum: ["Draft", "Pending", "Approved", "In Transit", "Partially Received", "Completed", "Canceled"],
          example: "Pending",
          description: "Default is Pending if not provided"
        },
        expectedDeliveryDate: {
          type: "string",
          format: "date-time"
        },
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
          example: "Regular inventory replenishment transfer"
        }
      }
    },
    InventoryTransferUpdate: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["Draft", "Pending", "Approved", "In Transit", "Partially Received", "Completed", "Canceled"],
          example: "Approved"
        },
        expectedDeliveryDate: {
          type: "string",
          format: "date-time"
        },
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
          example: "Priority transfer approved"
        }
      }
    },
    InventoryReturn: {
      type: "object",
      properties: {
        _id: { type: "string" },
        returnID: { 
          type: "string", 
          example: "RET-00001",
          pattern: "^RET-\\d{5}$" 
        },
        returnType: {
          type: "string",
          enum: ["Customer Return", "Supplier Return", "Damaged Goods", "Defective Product"],
          example: "Customer Return"
        },
        status: {
          type: "string",
          enum: ["Draft", "Pending", "Approved", "Completed", "Rejected", "Canceled"],
          example: "Pending"
        },
        customer: {
          oneOf: [
            { type: "string" },
            { $ref: "#/components/schemas/Customer" }
          ]
        },
        supplier: {
          oneOf: [
            { type: "string" },
            { $ref: "#/components/schemas/Supplier" }
          ]
        },
        warehouse: {
          oneOf: [
            { type: "string" },
            { $ref: "#/components/schemas/Warehouse" }
          ]
        },
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              product: {
                oneOf: [
                  { type: "string" },
                  { $ref: "#/components/schemas/Product" }
                ]
              },
              quantity: { type: "number", example: 2 },
              reason: { 
                type: "string", 
                enum: ["Defective", "Damaged", "Incorrect Item", "Expired", "Customer Dissatisfaction", "Other"],
                example: "Defective" 
              },
              condition: { 
                type: "string", 
                enum: ["Good", "Damaged", "Defective", "Expired"],
                example: "Defective" 
              },
              notes: { type: "string", example: "Product doesn't power on" }
            }
          }
        },
        returnDate: {
          type: "string",
          format: "date-time"
        },
        referenceOrder: {
          type: "string",
          example: "67f81e533e0490886947f008"
        },
        referencePurchase: {
          type: "string",
          example: "67f66c737ed7ddb60e54af70"
        },
        requestedBy: {
          oneOf: [
            { type: "string" },
            { $ref: "#/components/schemas/User" }
          ]
        },
        approvedBy: {
          oneOf: [
            { type: "string" },
            { $ref: "#/components/schemas/User" }
          ]
        },
        completedBy: {
          oneOf: [
            { type: "string" },
            { $ref: "#/components/schemas/User" }
          ]
        },
        actualReturnedItems: {
          type: "array",
          items: {
            type: "object",
            properties: {
              product: {
                oneOf: [
                  { type: "string" },
                  { $ref: "#/components/schemas/Product" }
                ]
              },
              quantity: { type: "number", example: 2 },
              condition: { 
                type: "string", 
                enum: ["Good", "Damaged", "Defective", "Expired"],
                example: "Defective" 
              },
              notes: { type: "string", example: "Multiple scratches on casing" }
            }
          }
        },
        notes: {
          type: "string",
          example: "Customer returning due to defective product"
        },
        createdAt: {
          type: "string",
          format: "date-time"
        },
        updatedAt: {
          type: "string",
          format: "date-time"
        }
      }
    },
    InventoryReturnInput: {
      type: "object",
      required: [
        "returnType",
        "warehouse",
        "items"
      ],
      properties: {
        returnType: {
          type: "string",
          enum: ["Customer Return", "Supplier Return", "Damaged Goods", "Defective Product"],
          example: "Customer Return"
        },
        status: {
          type: "string",
          enum: ["Draft", "Pending", "Approved", "Completed", "Rejected", "Canceled"],
          example: "Pending",
          description: "Default is Pending if not provided"
        },
        customer: {
          type: "string",
          example: "67f67b829d34cfbe039e94be",
          description: "Required for Customer Returns"
        },
        supplier: {
          type: "string",
          example: "67f66c737ed7ddb60e54af6f",
          description: "Required for Supplier Returns"
        },
        warehouse: {
          type: "string",
          example: "67f8e3c85b1777f2f72ac8e9"
        },
        items: {
          type: "array",
          items: {
            type: "object",
            required: ["product", "quantity", "reason"],
            properties: {
              product: { type: "string", example: "67f8ec8aaf6bfc397a056b7f" },
              quantity: { type: "number", example: 2 },
              reason: { 
                type: "string", 
                enum: ["Defective", "Damaged", "Incorrect Item", "Expired", "Customer Dissatisfaction", "Other"],
                example: "Defective" 
              },
              condition: { 
                type: "string", 
                enum: ["Good", "Damaged", "Defective", "Expired"],
                example: "Defective" 
              },
              notes: { type: "string", example: "Product doesn't power on" }
            }
          }
        },
        returnDate: {
          type: "string",
          format: "date-time",
          description: "Optional - defaults to current date/time"
        },
        referenceOrder: {
          type: "string",
          example: "67f81e533e0490886947f008",
          description: "Required for Customer Returns"
        },
        referencePurchase: {
          type: "string",
          example: "67f66c737ed7ddb60e54af70",
          description: "Required for Supplier Returns"
        },
        notes: {
          type: "string",
          example: "Customer returning due to defective product"
        }
      }
    },
    InventoryReturnUpdate: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["Draft", "Pending", "Approved", "Completed", "Rejected", "Canceled"],
          example: "Approved"
        },
        items: {
          type: "array",
          items: {
            type: "object",
            required: ["product", "quantity", "reason"],
            properties: {
              product: { type: "string", example: "67f8ec8aaf6bfc397a056b7f" },
              quantity: { type: "number", example: 2 },
              reason: { 
                type: "string", 
                enum: ["Defective", "Damaged", "Incorrect Item", "Expired", "Customer Dissatisfaction", "Other"],
                example: "Defective" 
              },
              condition: { 
                type: "string", 
                enum: ["Good", "Damaged", "Defective", "Expired"],
                example: "Defective" 
              },
              notes: { type: "string", example: "Product doesn't power on" }
            }
          }
        },
        notes: {
          type: "string",
          example: "Updated return information after customer inspection"
        }
      }
    },
    InventoryAdjustment: {
      type: "object",
      properties: {
        _id: { type: "string" },
        adjustmentID: { 
          type: "string", 
          example: "ADJ-00001",
          pattern: "^ADJ-\\d{5}$" 
        },
        adjustmentType: {
          type: "string",
          enum: ["Quantity Correction", "Inventory Count", "Write-Off", "Expired", "Damaged"],
          example: "Quantity Correction"
        },
        status: {
          type: "string",
          enum: ["Pending", "Approved", "Completed", "Rejected", "Canceled"],
          example: "Pending"
        },
        warehouse: {
          oneOf: [
            { type: "string" },
            { $ref: "#/components/schemas/Warehouse" }
          ]
        },
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              product: {
                oneOf: [
                  { type: "string" },
                  { $ref: "#/components/schemas/Product" }
                ]
              },
              inventory: {
                oneOf: [
                  { type: "string" },
                  { $ref: "#/components/schemas/Inventory" }
                ]
              },
              currentQuantity: { type: "number", example: 18 },
              newQuantity: { type: "number", example: 20 },
              adjustmentQuantity: { type: "number", example: 2 },
              reason: { type: "string", example: "Physical count correction" }
            }
          }
        },
        adjustmentDate: {
          type: "string",
          format: "date-time"
        },
        requestedBy: {
          oneOf: [
            { type: "string" },
            { $ref: "#/components/schemas/User" }
          ]
        },
        approvedBy: {
          oneOf: [
            { type: "string" },
            { $ref: "#/components/schemas/User" }
          ]
        },
        completedBy: {
          oneOf: [
            { type: "string" },
            { $ref: "#/components/schemas/User" }
          ]
        },
        notes: {
          type: "string",
          example: "Adjustment after physical inventory count"
        },
        createdAt: {
          type: "string",
          format: "date-time"
        },
        updatedAt: {
          type: "string",
          format: "date-time"
        }
      }
    },
    InventoryAdjustmentInput: {
      type: "object",
      required: [
        "adjustmentType",
        "warehouse",
        "items"
      ],
      properties: {
        adjustmentType: {
          type: "string",
          enum: ["Quantity Correction", "Inventory Count", "Write-Off", "Expired", "Damaged"],
          example: "Quantity Correction"
        },
        status: {
          type: "string",
          enum: ["Pending", "Approved", "Completed", "Rejected", "Canceled"],
          example: "Pending",
          description: "Default is Pending if not provided"
        },
        warehouse: {
          type: "string",
          example: "67f8e3c85b1777f2f72ac8e9"
        },
        items: {
          type: "array",
          items: {
            type: "object",
            required: ["product", "newQuantity"],
            properties: {
              product: { type: "string", example: "67f8ec8aaf6bfc397a056b7f" },
              inventory: { type: "string", example: "67f8f19c967f8b21cb2ae9c5" },
              currentQuantity: { 
                type: "number", 
                example: 18, 
                description: "Optional - will be fetched from inventory if not provided" 
              },
              newQuantity: { type: "number", example: 20 },
              reason: { type: "string", example: "Physical count correction" }
            }
          }
        },
        adjustmentDate: {
          type: "string",
          format: "date-time",
          description: "Optional - defaults to current date/time"
        },
        notes: {
          type: "string",
          example: "Adjustment after physical inventory count"
        }
      }
    },
    InventoryAdjustmentUpdate: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["Pending", "Approved", "Completed", "Rejected", "Canceled"],
          example: "Approved"
        },
        items: {
          type: "array",
          items: {
            type: "object",
            required: ["product", "newQuantity"],
            properties: {
              product: { type: "string", example: "67f8ec8aaf6bfc397a056b7f" },
              newQuantity: { type: "number", example: 20 },
              reason: { type: "string", example: "Updated after recount" }
            }
          }
        },
        notes: {
          type: "string",
          example: "Adjustment verified by warehouse manager"
        }
      }
    },
    Pagination: {
      type: "object",
      properties: {
        total: { type: "integer", example: 50 },
        page: { type: "integer", example: 1 },
        limit: { type: "integer", example: 10 },
        totalPages: { type: "integer", example: 5 },
      },
    },
  },
  responses: {
    UnauthorizedError: {
      description: "Access token is missing or invalid",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/Error",
          },
        },
      },
    },
    NotFoundError: {
      description: "The specified resource was not found",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/Error",
          },
        },
      },
    },
    ValidationError: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/Error",
          },
        },
      },
    },
    ServerError: {
      description: "Internal Server Error",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/Error",
          },
        },
      },
    },
    BadRequest: {
      description:
        "Bad Request - The request could not be understood or was missing required parameters",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              status: { type: "string", example: "error" },
              message: { type: "string", example: "Bad Request" },
              error: {
                type: "string",
                example: "Validation error: Name is required",
              },
            },
          },
        },
      },
    },
    Unauthorized: {
      description:
        "Unauthorized - Authentication is required and has failed or has not been provided",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              status: { type: "string", example: "error" },
              message: { type: "string", example: "Unauthorized" },
              error: { type: "string", example: "Authentication required" },
            },
          },
        },
      },
    },
    Forbidden: {
      description:
        "Forbidden - The server understood the request but refuses to authorize it",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              status: { type: "string", example: "error" },
              message: { type: "string", example: "Forbidden" },
              error: {
                type: "string",
                example: "You do not have permission to access this resource",
              },
            },
          },
        },
      },
    },
    NotFound: {
      description: "Not Found - The requested resource could not be found",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              status: { type: "string", example: "error" },
              message: { type: "string", example: "Not Found" },
              error: { type: "string", example: "Resource not found" },
            },
          },
        },
      },
    },
    Conflict: {
      description:
        "Conflict - The request could not be completed due to a conflict with the current state of the resource",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              status: { type: "string", example: "error" },
              message: { type: "string", example: "Conflict" },
              error: { type: "string", example: "Resource already exists" },
            },
          },
        },
      },
    },
    InternalServerError: {
      description:
        "Internal Server Error - The server encountered an unexpected condition that prevented it from fulfilling the request",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              status: { type: "string", example: "error" },
              message: { type: "string", example: "Server Error" },
              error: {
                type: "string",
                example: "An unexpected error occurred",
              },
            },
          },
        },
      },
    },
  },
};
