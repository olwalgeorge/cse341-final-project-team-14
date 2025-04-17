const customerRoutes = {
  "/customers": {
    get: {
      tags: ["Customers"],
      summary: "Get all customers",
      description:
        "Retrieve a list of all customers with optional filtering and pagination. Requires authentication.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "query",
          name: "name",
          schema: { type: "string" },
          description: "Filter customers by name",
        },
        {
          in: "query",
          name: "email",
          schema: { type: "string" },
          description: "Filter customers by email",
        },
        {
          in: "query",
          name: "page",
          schema: { type: "integer", default: 1 },
          description: "Page number for pagination",
        },
        {
          in: "query",
          name: "limit",
          schema: { type: "integer", default: 10 },
          description: "Number of records per page",
        },
        {
          in: "query",
          name: "sort",
          schema: { type: "string" },
          description:
            "Sort fields (comma separated), prefix with - for descending order",
        },
      ],
      responses: {
        200: {
          description: "Successful operation",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string" },
                  message: { type: "string" },
                  data: {
                    type: "object",
                    properties: {
                      customers: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Customer" },
                      },
                      pagination: { $ref: "#/components/schemas/Pagination" },
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          $ref: "#/components/responses/Unauthorized",
          description: "Authentication token is missing, invalid, or expired",
        },
        403: {
          description:
            "Forbidden - Insufficient permissions to access customer data",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Forbidden",
                error: ["Insufficient permissions to access this resource"],
                errorCode: "FORBIDDEN_ERROR",
                statusCode: 403,
              },
            },
          },
        },
        500: {
          $ref: "#/components/responses/ServerError",
          description: "An unexpected error occurred on the server",
        },
      },
    },
    post: {
      tags: ["Customers"],
      summary: "Create a new customer",
      description:
        "Create a new customer in the system. Requires ADMIN, MANAGER, or SUPERVISOR role.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CustomerInput" },
          },
        },
      },
      responses: {
        201: {
          description: "Customer created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string" },
                  message: { type: "string" },
                  data: { $ref: "#/components/schemas/Customer" },
                },
              },
            },
          },
        },
        400: {
          $ref: "#/components/responses/BadRequest",
          description: "Validation error in customer data",
        },
        401: {
          $ref: "#/components/responses/Unauthorized",
          description: "Authentication token is missing, invalid, or expired",
        },
        409: {
          description:
            "Conflict - Customer with the same identifier already exists",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Conflict",
                error: ["Customer with the same email already exists"],
                errorCode: "CONFLICT_ERROR",
                statusCode: 409,
              },
            },
          },
        },
        500: {
          $ref: "#/components/responses/ServerError",
          description: "An unexpected error occurred on the server",
        },
      },
    },
    delete: {
      tags: ["Customers"],
      summary: "Delete all customers",
      description:
        "Delete all customers from the system (use with caution). Restricted to ADMIN role only.",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Customers deleted successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string" },
                  message: { type: "string" },
                },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
        500: { $ref: "#/components/responses/ServerError" },
      },
    },
  },
  "/customers/search": {
    get: {
      tags: ["Customers"],
      summary: "Search customers",
      description: "Search customers by name or email. Requires authentication.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "query",
          name: "term",
          required: true,
          schema: { type: "string" },
          description: "Search term",
        },
      ],
      responses: {
        200: {
          description: "Successful operation",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string" },
                  message: { type: "string" },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Customer" },
                  },
                },
              },
            },
          },
        },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
        500: { $ref: "#/components/responses/ServerError" },
      },
    },
  },
  "/customers/customerID/{customerID}": {
    get: {
      tags: ["Customers"],
      summary: "Get customer by customer ID",
      description:
        "Retrieve customer details by customer ID (CU-XXXXX format). Requires authentication.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "customerID",
          required: true,
          schema: {
            type: "string",
            pattern: "^CU-\\d{5}$",
          },
          description: "Customer ID in CU-XXXXX format",
        },
      ],
      responses: {
        200: {
          description: "Successful operation",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string" },
                  message: { type: "string" },
                  data: { $ref: "#/components/schemas/Customer" },
                },
              },
            },
          },
        },
        400: {
          description: "Invalid customer ID format",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Validation failed",
                error: [
                  "Customer ID must be in the format CU-XXXXX where X is a digit",
                ],
                errorCode: "VALIDATION_ERROR",
                statusCode: 400,
              },
            },
          },
        },
        401: {
          $ref: "#/components/responses/Unauthorized",
          description: "Authentication token is missing, invalid, or expired",
        },
        404: {
          description: "Customer not found with the specified ID",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Customer not found",
                error: ["No customer found with this ID"],
                errorCode: "NOT_FOUND_ERROR",
                statusCode: 404,
              },
            },
          },
        },
        500: {
          $ref: "#/components/responses/ServerError",
          description: "An unexpected error occurred on the server",
        },
      },
    },
  },
  "/customers/email/{email}": {
    get: {
      tags: ["Customers"],
      summary: "Get customer by email",
      description:
        "Retrieve customer details by email address. Requires authentication.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "email",
          required: true,
          schema: { type: "string" },
          description: "Customer email address",
        },
      ],
      responses: {
        200: {
          description: "Successful operation",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string" },
                  message: { type: "string" },
                  data: { $ref: "#/components/schemas/Customer" },
                },
              },
            },
          },
        },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
        500: { $ref: "#/components/responses/ServerError" },
      },
    },
  },
  "/customers/{customer_Id}": {
    get: {
      tags: ["Customers"],
      summary: "Get customer by ID",
      description:
        "Retrieve customer details by MongoDB ID. Requires authentication. The customer_Id parameter is the MongoDB ObjectId (24 character hexadecimal) that uniquely identifies a customer in the database.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "customer_Id",
          in: "path",
          required: true,
          schema: {
            type: "string",
            pattern: "^[a-f\\d]{24}$",
          },
          example: "64f5a7b3c5dc0d34f85d969e",
          description: "MongoDB ID of the customer",
        },
      ],
      responses: {
        200: {
          description: "Successful operation",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string" },
                  message: { type: "string" },
                  data: { $ref: "#/components/schemas/Customer" },
                },
              },
            },
          },
        },
        400: {
          description: "Invalid MongoDB ID format",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Validation failed",
                error: ["Invalid MongoDB ID format"],
                errorCode: "VALIDATION_ERROR",
                statusCode: 400,
              },
            },
          },
        },
        401: {
          $ref: "#/components/responses/Unauthorized",
          description: "Authentication token is missing, invalid, or expired",
        },
        404: {
          description: "Customer not found with the specified ID",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Customer not found",
                error: ["No customer found with this ID"],
                errorCode: "NOT_FOUND_ERROR",
                statusCode: 404,
              },
            },
          },
        },
        500: {
          $ref: "#/components/responses/ServerError",
          description: "An unexpected error occurred on the server",
        },
      },
    },
    put: {
      tags: ["Customers"],
      summary: "Update customer",
      description:
        "Update customer details by MongoDB ID. Requires ADMIN, MANAGER, or SUPERVISOR role. The customer_Id parameter is the MongoDB ObjectId (24 character hexadecimal) that uniquely identifies a customer in the database.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "customer_Id",
          in: "path",
          required: true,
          schema: {
            type: "string",
            pattern: "^[a-f\\d]{24}$",
          },
          example: "64f5a7b3c5dc0d34f85d969e",
          description: "MongoDB ID of the customer to update",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CustomerUpdate" },
          },
        },
      },
      responses: {
        200: {
          description: "Customer updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string" },
                  message: { type: "string" },
                  data: { $ref: "#/components/schemas/Customer" },
                },
              },
            },
          },
        },
        400: {
          description:
            "Validation error in customer update data or invalid MongoDB ID",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Validation failed",
                error: ["Invalid email format"],
                errorCode: "VALIDATION_ERROR",
                statusCode: 400,
              },
            },
          },
        },
        401: {
          $ref: "#/components/responses/Unauthorized",
          description: "Authentication token is missing, invalid, or expired",
        },
        404: {
          description: "Customer not found with the specified ID",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Customer not found",
                error: ["No customer found with this ID"],
                errorCode: "NOT_FOUND_ERROR",
                statusCode: 404,
              },
            },
          },
        },
        500: {
          $ref: "#/components/responses/ServerError",
          description: "An unexpected error occurred on the server",
        },
      },
    },
    delete: {
      tags: ["Customers"],
      summary: "Delete customer",
      description:
        "Delete customer by MongoDB ID. Restricted to ADMIN role only. The customer_Id parameter is the MongoDB ObjectId (24 character hexadecimal) that uniquely identifies a customer in the database.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "customer_Id",
          in: "path",
          required: true,
          schema: {
            type: "string",
            pattern: "^[a-f\\d]{24}$",
          },
          example: "64f5a7b3c5dc0d34f85d969e",
          description: "MongoDB ID of the customer to delete",
        },
      ],
      responses: {
        200: {
          description: "Customer deleted successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string" },
                  message: { type: "string" },
                },
              },
            },
          },
        },
        400: {
          description: "Invalid MongoDB ID format",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Validation failed",
                error: ["Invalid MongoDB ID format"],
                errorCode: "VALIDATION_ERROR",
                statusCode: 400,
              },
            },
          },
        },
        401: {
          $ref: "#/components/responses/Unauthorized",
          description: "Authentication token is missing, invalid, or expired",
        },
        404: {
          description: "Customer not found with the specified ID",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Customer not found",
                error: ["No customer found with this ID"],
                errorCode: "NOT_FOUND_ERROR",
                statusCode: 404,
              },
            },
          },
        },
        500: {
          $ref: "#/components/responses/ServerError",
          description: "An unexpected error occurred on the server",
        },
      },
    },
  },
};

module.exports = customerRoutes;
