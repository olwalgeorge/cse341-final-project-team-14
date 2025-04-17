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
          example: "Operation failed",
          description: "Brief description of the error"
        },
        error: {
          type: "array",
          items: {
            type: "string",
          },
          example: ["Validation failed", "Username already exists"],
          description: "Detailed error messages"
        },
        errorCode: {
          type: "string",
          example: "VALIDATION_ERROR",
          description: "Error code for programmatic handling",
          enum: [
            "VALIDATION_ERROR",
            "AUTH_ERROR",
            "NOT_FOUND_ERROR",
            "SERVER_ERROR", 
            "DATABASE_ERROR",
            "FORBIDDEN_ERROR",
            "CONFLICT_ERROR",
            "RATE_LIMIT_ERROR"
          ]
        },
        statusCode: {
          type: "number",
          example: 400,
          description: "HTTP status code"
        }
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
          example: "Operation successful",
          description: "Brief description of the successful operation"
        },
        data: {
          type: "object",
          description: "Result data from the operation"
        },
      },
    },
    User: {
      type: "object",
      required: ["userID", "username", "email", "password", "fullName", "role"],
      properties: {
        userID: {
          type: "string",
          pattern: "^USR-\\d{5}$",
          example: "USR-00001",
          description: "Unique identifier for the user in format USR-XXXXX"
        },
        username: {
          type: "string",
          minLength: 3,
          maxLength: 30,
          pattern: "^(?!\\d)[a-zA-Z0-9_]+$",
          example: "johnsmith",
          description: "Unique username (3-30 chars, alphanumeric and underscores, can't start with number)"
        },
        email: {
          type: "string",
          format: "email",
          example: "user@example.com",
          description: "Unique email address for the user"
        },
        password: {
          type: "string",
          format: "password",
          minLength: 8,
          maxLength: 50,
          pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,50}$",
          example: "SecurePass123!",
          description: "Password (8-50 chars, must include lowercase, uppercase, number, special character)"
        },
        fullName: {
          type: "string",
          minLength: 2,
          maxLength: 100,
          example: "John Smith",
          description: "User's full name (2-100 characters)"
        },
        avatar: {
          type: "string",
          format: "uri",
          example: "https://example.com/avatars/user123.jpg",
          description: "URL to user's avatar image"
        },
        role: {
          type: "string",
          enum: ["USER", "SUPERVISOR", "MANAGER", "ADMIN", "SUPERADMIN"],
          example: "USER",
          description: "User's role (affects permissions, higher roles inherit permissions from lower ones)"
        },
        permissions: {
          type: "array",
          items: {
            type: "string"
          },
          example: ["read:users", "write:products"],
          description: "Array of specific permissions granted to this user"
        },
        isActive: {
          type: "boolean",
          example: true,
          description: "Whether the user account is active"
        },
        isVerified: {
          type: "boolean",
          example: false,
          description: "Whether the user's email has been verified"
        },
        lastLogin: {
          type: "string",
          format: "date-time",
          example: "2023-04-17T14:30:00Z",
          description: "When the user last logged in"
        },
        rateLimitExemptUntil: {
          type: "string",
          format: "date-time",
          example: "2023-04-18T14:30:00Z",
          description: "Date until which the user is exempt from rate limiting"
        },
        createdAt: {
          type: "string",
          format: "date-time",
          example: "2022-10-31T14:30:00Z",
          description: "When the user was created"
        },
        updatedAt: {
          type: "string", 
          format: "date-time",
          example: "2023-04-17T14:30:00Z",
          description: "When the user was last updated"
        }
      }
    },
    UserResponse: {
      type: "object",
      properties: {
        user_id: {
          type: "string",
          example: "64f5a7b3c5dc0d34f85d969e",
          description: "MongoDB ObjectID of the user"
        },
        userID: {
          type: "string",
          example: "USR-00001",
          description: "Unique identifier for the user in format USR-XXXXX"
        },
        username: {
          type: "string",
          example: "johnsmith",
          description: "User's username"
        },
        email: {
          type: "string",
          example: "user@example.com",
          description: "User's email address"
        },
        fullName: {
          type: "string",
          example: "John Smith",
          description: "User's full name"
        },
        avatar: {
          type: "string",
          example: "https://example.com/avatars/user123.jpg",
          description: "URL to user's avatar image"
        },
        role: {
          type: "string",
          example: "USER",
          description: "User's role"
        },
        isActive: {
          type: "boolean",
          example: true,
          description: "Whether the user account is active"
        },
        isVerified: {
          type: "boolean",
          example: false,
          description: "Whether the user's email has been verified"
        },
        lastLogin: {
          type: "string",
          format: "date-time",
          description: "When the user last logged in"
        },
        createdAt: {
          type: "string",
          format: "date-time",
          description: "When the user was created"
        },
        updatedAt: {
          type: "string",
          format: "date-time",
          description: "When the user was last updated"
        }
      }
    },
    UserInput: {
      type: "object",
      required: ["username", "email", "password", "fullName"],
      properties: {
        username: {
          type: "string", 
          minLength: 3,
          maxLength: 30,
          pattern: "^(?!\\d)[a-zA-Z0-9_]+$",
          example: "johnsmith",
          description: "Unique username (3-30 chars, alphanumeric and underscores, can't start with number)"
        },
        email: {
          type: "string",
          format: "email",
          example: "user@example.com",
          description: "Unique email address for the user"
        },
        password: {
          type: "string",
          format: "password",
          minLength: 8,
          maxLength: 50,
          pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,50}$",
          example: "SecurePass123!",
          description: "Password (8-50 chars, must include lowercase, uppercase, number, special character)"
        },
        fullName: {
          type: "string",
          minLength: 2,
          maxLength: 100,
          example: "John Smith",
          description: "User's full name (2-100 characters)"
        },
        avatar: {
          type: "string",
          format: "uri",
          example: "https://example.com/avatars/user123.jpg",
          description: "URL to user's avatar image"
        },
        role: {
          type: "string",
          enum: ["USER", "SUPERVISOR", "MANAGER", "ADMIN"],
          example: "USER",
          description: "User's role (SUPERADMIN can only be assigned by special processes)"
        }
      }
    },
    UserUpdate: {
      type: "object",
      properties: {
        username: {
          type: "string",
          minLength: 3,
          maxLength: 30,
          pattern: "^(?!\\d)[a-zA-Z0-9_]+$",
          example: "johnsmith_updated",
          description: "Updated username"
        },
        email: {
          type: "string",
          format: "email",
          example: "updated@example.com",
          description: "Updated email address (must be unique)"
        },
        fullName: {
          type: "string",
          minLength: 2,
          maxLength: 100,
          example: "John Smith Updated",
          description: "Updated full name"
        },
        avatar: {
          type: "string",
          format: "uri",
          example: "https://example.com/avatars/user123_new.jpg",
          description: "Updated avatar URL"
        },
        role: {
          type: "string",
          enum: ["USER", "SUPERVISOR", "MANAGER", "ADMIN"],
          example: "SUPERVISOR",
          description: "Updated role (restricted based on requestor's own role)"
        },
        isActive: {
          type: "boolean",
          example: true,
          description: "Updated active status"
        }
      }
    },
    UsersList: {
      type: "object",
      properties: {
        users: {
          type: "array",
          items: {
            $ref: "#/components/schemas/UserResponse"
          },
          description: "Array of users matching the query criteria"
        },
        pagination: {
          $ref: "#/components/schemas/Pagination",
          description: "Pagination information"
        }
      }
    },
    PasswordChange: {
      type: "object",
      required: ["currentPassword", "newPassword", "confirmPassword"],
      properties: {
        currentPassword: {
          type: "string",
          format: "password",
          example: "OldPassword123!",
          description: "User's current password"
        },
        newPassword: {
          type: "string", 
          format: "password",
          minLength: 8,
          maxLength: 50,
          pattern: "^(?=.*[a-z])(?=.*[a-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,50}$",
          example: "NewPassword456!",
          description: "New password (must meet complexity requirements)"
        },
        confirmPassword: {
          type: "string",
          format: "password",
          example: "NewPassword456!",
          description: "Confirmation of new password (must match newPassword)"
        }
      }
    },
    RateLimitRevocation: {
      type: "object",
      required: ["ipAddress"],
      properties: {
        ipAddress: {
          type: "string",
          format: "ipv4",
          example: "192.168.1.100",
          description: "IP address to exempt from rate limiting"
        },
        reason: {
          type: "string",
          example: "User experiencing temporary high API usage for legitimate purposes",
          description: "Reason for the rate limit exemption"
        },
        durationHours: {
          type: "integer",
          minimum: 1,
          maximum: 168,
          default: 24,
          example: 24,
          description: "Number of hours to exempt the user from rate limits (default: 24, max: 168)"
        }
      }
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
            example: {
              success: false,
              message: "Authentication failed",
              error: ["Invalid or expired token"],
              errorCode: "AUTH_ERROR",
              statusCode: 401
            }
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
            example: {
              success: false,
              message: "Not found",
              error: ["The requested resource was not found"],
              errorCode: "NOT_FOUND_ERROR",
              statusCode: 404
            }
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
            example: {
              success: false,
              message: "Validation failed",
              error: ["Username must be at least 3 characters", "Invalid email format"],
              errorCode: "VALIDATION_ERROR",
              statusCode: 400
            }
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
            example: {
              success: false,
              message: "Server Error",
              error: ["An unexpected error occurred"],
              errorCode: "SERVER_ERROR",
              statusCode: 500
            }
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
              success: { type: "boolean", example: false },
              message: { type: "string", example: "Bad Request" },
              error: {
                type: "array",
                items: { type: "string" },
                example: ["Validation error: Name is required"]
              },
              errorCode: { type: "string", example: "BAD_REQUEST" },
              statusCode: { type: "number", example: 400 }
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
              success: { type: "boolean", example: false },
              message: { type: "string", example: "Unauthorized" },
              error: { 
                type: "array",
                items: { type: "string" },
                example: ["Authentication required"] 
              },
              errorCode: { type: "string", example: "UNAUTHORIZED" },
              statusCode: { type: "number", example: 401 }
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
              success: { type: "boolean", example: false },
              message: { type: "string", example: "Forbidden" },
              error: {
                type: "array",
                items: { type: "string" },
                example: ["You do not have permission to access this resource"]
              },
              errorCode: { type: "string", example: "FORBIDDEN" },
              statusCode: { type: "number", example: 403 }
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
              success: { type: "boolean", example: false },
              message: { type: "string", example: "Not Found" },
              error: {
                type: "array",
                items: { type: "string" },
                example: ["The requested resource was not found"]
              },
              errorCode: { type: "string", example: "NOT_FOUND" },
              statusCode: { type: "number", example: 404 }
            },
          },
        },
      },
    },
    Conflict: {
      description:
        "Conflict - The request conflicts with the current state of the resource",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              message: { type: "string", example: "Conflict" },
              error: {
                type: "array",
                items: { type: "string" },
                example: ["Username already exists", "Email already in use"]
              },
              errorCode: { type: "string", example: "CONFLICT" },
              statusCode: { type: "number", example: 409 }
            },
          },
        },
      },
    },
    TooManyRequests: {
      description: "Too Many Requests - Rate limit exceeded",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              message: { type: "string", example: "Too Many Requests" },
              error: {
                type: "array",
                items: { type: "string" },
                example: ["Rate limit exceeded. Try again later."]
              },
              retryAfter: {
                type: "number",
                example: 60,
                description: "Time in seconds until rate limit is reset"
              },
              errorCode: { type: "string", example: "RATE_LIMIT_EXCEEDED" },
              statusCode: { type: "number", example: 429 }
            },
          },
        },
      },
    },
    ServerError: {
      description:
        "Internal Server Error - The server encountered an unexpected condition that prevented it from fulfilling the request",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              message: { type: "string", example: "Server Error" },
              error: {
                type: "array",
                items: { type: "string" },
                example: ["An unexpected error occurred"]
              },
              errorCode: { type: "string", example: "SERVER_ERROR" },
              statusCode: { type: "number", example: 500 }
            },
          },
        },
      },
    },
  }
};
