const purchaseRoutes = {
  "/purchases": {
    get: {
      tags: ["Purchases"],
      summary: "Get all purchases",
      description:
        "Retrieve a list of all purchases with optional filtering and pagination",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "query",
          name: "status",
          schema: {
            type: "string",
            enum: ["pending", "ordered", "received", "cancelled", "returned"],
          },
          description: "Filter purchases by status",
        },
        {
          in: "query",
          name: "supplier",
          schema: { type: "string" },
          description: "Filter purchases by supplier ID",
        },
        {
          in: "query",
          name: "paymentStatus",
          schema: {
            type: "string",
            enum: ["unpaid", "partially_paid", "paid"],
          },
          description: "Filter purchases by payment status",
        },
        {
          in: "query",
          name: "fromDate",
          schema: { type: "string", format: "date" },
          description:
            "Filter purchases with date greater than or equal to this value",
        },
        {
          in: "query",
          name: "toDate",
          schema: { type: "string", format: "date" },
          description:
            "Filter purchases with date less than or equal to this value",
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
                      purchases: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Purchase" },
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
      tags: ["Purchases"],
      summary: "Create a new purchase",
      description: "Create a new purchase in the system",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/PurchaseInput" },
          },
        },
      },
      responses: {
        201: {
          description: "Purchase created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string" },
                  message: { type: "string" },
                  data: { $ref: "#/components/schemas/Purchase" },
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
      tags: ["Purchases"],
      summary: "Delete all purchases",
      description: "Delete all purchases from the system (use with caution)",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Purchases deleted successfully",
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
  "/purchases/purchaseID/{purchaseID}": {
    get: {
      tags: ["Purchases"],
      summary: "Get purchase by purchase ID",
      description: "Retrieve purchase details by purchase ID (PU-XXXXX format)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "purchaseID",
          required: true,
          schema: { type: "string" },
          description: "Purchase ID in PU-XXXXX format",
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
                  data: { $ref: "#/components/schemas/Purchase" },
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
  "/purchases/supplier/{supplierId}": {
    get: {
      tags: ["Purchases"],
      summary: "Get purchases by supplier",
      description: "Retrieve purchases for a specific supplier",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "supplierId",
          required: true,
          schema: { type: "string" },
          description: "MongoDB ID of the supplier",
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
                    items: { $ref: "#/components/schemas/Purchase" },
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
  "/purchases/status/{status}": {
    get: {
      tags: ["Purchases"],
      summary: "Get purchases by status",
      description: "Retrieve purchases with a specific status",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "status",
          required: true,
          schema: {
            type: "string",
            enum: ["pending", "ordered", "received", "cancelled", "returned"],
          },
          description: "Purchase status",
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
                    items: { $ref: "#/components/schemas/Purchase" },
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
  "/purchases/{_id}": {
    get: {
      tags: ["Purchases"],
      summary: "Get purchase by ID",
      description: "Retrieve purchase details by MongoDB ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "_id",
          required: true,
          schema: { type: "string" },
          description: "MongoDB ID of the purchase",
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
                  data: { $ref: "#/components/schemas/Purchase" },
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
      tags: ["Purchases"],
      summary: "Update purchase",
      description: "Update purchase details by MongoDB ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "_id",
          required: true,
          schema: { type: "string" },
          description: "MongoDB ID of the purchase to update",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/PurchaseUpdate" },
          },
        },
      },
      responses: {
        200: {
          description: "Purchase updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string" },
                  message: { type: "string" },
                  data: { $ref: "#/components/schemas/Purchase" },
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
      tags: ["Purchases"],
      summary: "Delete purchase",
      description: "Delete purchase by MongoDB ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "_id",
          required: true,
          schema: { type: "string" },
          description: "MongoDB ID of the purchase to delete",
        },
      ],
      responses: {
        200: {
          description: "Purchase deleted successfully",
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

module.exports = purchaseRoutes;
