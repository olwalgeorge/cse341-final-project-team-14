const supplierRoutes = {
  "/suppliers": {
    get: {
      tags: ["Suppliers"],
      summary: "Get all suppliers",
      description:
        "Retrieve a list of all suppliers with optional filtering and pagination",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "query",
          name: "name",
          schema: { type: "string" },
          description: "Filter suppliers by name",
        },
        {
          in: "query",
          name: "country",
          schema: { type: "string" },
          description: "Filter suppliers by country",
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
                      suppliers: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Supplier" },
                      },
                      pagination: { $ref: "#/components/schemas/Pagination" },
                    },
                  },
                },
              },
            },
          },
        },
        500: { $ref: "#/components/responses/ServerError" },
      },
    },
    post: {
      tags: ["Suppliers"],
      summary: "Create a new supplier",
      description: "Create a new supplier in the system",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/SupplierInput" },
          },
        },
      },
      responses: {
        201: {
          description: "Supplier created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string" },
                  message: { type: "string" },
                  data: { $ref: "#/components/schemas/Supplier" },
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
      tags: ["Suppliers"],
      summary: "Delete all suppliers",
      description: "Delete all suppliers from the system (use with caution)",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Suppliers deleted successfully",
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
  "/suppliers/search": {
    get: {
      tags: ["Suppliers"],
      summary: "Search suppliers",
      description: "Search suppliers by name",
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
                    items: { $ref: "#/components/schemas/Supplier" },
                  },
                },
              },
            },
          },
        },
        400: { $ref: "#/components/responses/BadRequest" },
        500: { $ref: "#/components/responses/ServerError" },
      },
    },
  },
  "/suppliers/supplierID/{supplierID}": {
    get: {
      tags: ["Suppliers"],
      summary: "Get supplier by supplier ID",
      description: "Retrieve supplier details by supplier ID (SP-XXXXX format)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "supplierID",
          required: true,
          schema: { 
            type: "string",
            pattern: "^SP-\\d{5}$"
          },
          example: "SP-00001",
          description: "Supplier ID in SP-XXXXX format"
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
                  data: { $ref: "#/components/schemas/Supplier" },
                },
              },
            },
          },
        },
        404: { $ref: "#/components/responses/NotFound" },
        500: { $ref: "#/components/responses/ServerError" },
      },
    },
  },
  "/suppliers/{supplier_Id}": {
    get: {
      tags: ["Suppliers"],
      summary: "Get supplier by ID",
      description: "Retrieve supplier details by MongoDB ID",
      parameters: [
        {
          name: "supplier_Id",
          in: "path",
          required: true,
          schema: { 
            type: "string",
            pattern: "^[a-f\\d]{24}$"
          },
          example: "64f5a7b3c5dc0d34f85d969e",
          description: "MongoDB ID of the supplier"
        },
      ],
      security: [{ bearerAuth: [] }],
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
                  data: { $ref: "#/components/schemas/Supplier" },
                },
              },
            },
          },
        },
        400: { $ref: "#/components/responses/BadRequest" },
        404: { $ref: "#/components/responses/NotFound" },
        500: { $ref: "#/components/responses/ServerError" },
      },
    },
    put: {
      tags: ["Suppliers"],
      summary: "Update supplier",
      description: "Update supplier details by MongoDB ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "supplier_Id",
          required: true,
          schema: { 
            type: "string",
            pattern: "^[a-f\\d]{24}$"
          },
          example: "64f5a7b3c5dc0d34f85d969e",
          description: "MongoDB ID of the supplier to update"
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/SupplierUpdate" },
          },
        },
      },
      responses: {
        200: {
          description: "Supplier updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string" },
                  message: { type: "string" },
                  data: { $ref: "#/components/schemas/Supplier" },
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
      tags: ["Suppliers"],
      summary: "Delete supplier",
      description: "Delete supplier by MongoDB ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "supplier_Id",
          required: true,
          schema: { 
            type: "string",
            pattern: "^[a-f\\d]{24}$"
          },
          example: "64f5a7b3c5dc0d34f85d969e",
          description: "MongoDB ID of the supplier to delete"
        },
      ],
      responses: {
        200: {
          description: "Supplier deleted successfully",
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

module.exports = supplierRoutes;
