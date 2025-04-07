const customerRoutes = {
  "/customers": {
    get: {
      tags: ["Customers"],
      summary: "Get all customers",
      description:
        "Retrieve a list of all customers with optional filtering and pagination",
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
        401: { $ref: "#/components/responses/Unauthorized" },
        500: { $ref: "#/components/responses/ServerError" },
      },
    },
    post: {
      tags: ["Customers"],
      summary: "Create a new customer",
      description: "Create a new customer in the system",
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
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
        409: { $ref: "#/components/responses/Conflict" },
        500: { $ref: "#/components/responses/ServerError" },
      },
    },
    delete: {
      tags: ["Customers"],
      summary: "Delete all customers",
      description: "Delete all customers from the system (use with caution)",
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
      description: "Search customers by name or email",
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
      description: "Retrieve customer details by customer ID (CU-XXXXX format)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "customerID",
          required: true,
          schema: { type: "string" },
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
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
        500: { $ref: "#/components/responses/ServerError" },
      },
    },
  },
  "/customers/email/{email}": {
    get: {
      tags: ["Customers"],
      summary: "Get customer by email",
      description: "Retrieve customer details by email address",
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
  "/customers/{_id}": {
    get: {
      tags: ["Customers"],
      summary: "Get customer by ID",
      description: "Retrieve customer details by MongoDB ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "_id",
          required: true,
          schema: { type: "string" },
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
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
        500: { $ref: "#/components/responses/ServerError" },
      },
    },
    put: {
      tags: ["Customers"],
      summary: "Update customer",
      description: "Update customer details by MongoDB ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "_id",
          required: true,
          schema: { type: "string" },
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
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
        500: { $ref: "#/components/responses/ServerError" },
      },
    },
    delete: {
      tags: ["Customers"],
      summary: "Delete customer",
      description: "Delete customer by MongoDB ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "_id",
          required: true,
          schema: { type: "string" },
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
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
        500: { $ref: "#/components/responses/ServerError" },
      },
    },
  },
};

module.exports = customerRoutes;
