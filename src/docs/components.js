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
