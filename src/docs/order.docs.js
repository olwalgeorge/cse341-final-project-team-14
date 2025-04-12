const orderRoutes = {
  "/orders": {
    get: {
      tags: ["Orders"],
      summary: "Get all orders",
      description:
        "Retrieve a list of all orders with optional filtering and pagination",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "query",
          name: "status",
          schema: {
            type: "string",
            enum: [
              "pending",
              "processing",
              "shipped",
              "delivered",
              "cancelled",
            ],
          },
          description: "Filter orders by status",
        },
        {
          in: "query",
          name: "customer",
          schema: { type: "string" },
          description: "Filter orders by customer ID",
        },
        {
          in: "query",
          name: "fromDate",
          schema: { type: "string", format: "date" },
          description:
            "Filter orders with date greater than or equal to this value",
        },
        {
          in: "query",
          name: "toDate",
          schema: { type: "string", format: "date" },
          description:
            "Filter orders with date less than or equal to this value",
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
                      orders: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Order" },
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
      tags: ["Orders"],
      summary: "Create a new order",
      description: "Create a new order in the system",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/OrderInput" },
          },
        },
      },
      responses: {
        201: {
          description: "Order created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string" },
                  message: { type: "string" },
                  data: { $ref: "#/components/schemas/Order" },
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
      tags: ["Orders"],
      summary: "Delete all orders",
      description: "Delete all orders from the system (use with caution)",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Orders deleted successfully",
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
  "/orders/orderID/{orderID}": {
    get: {
      tags: ["Orders"],
      summary: "Get order by order ID",
      description: "Retrieve order details by order ID (OR-XXXXX format)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "orderID",
          required: true,
          schema: { type: "string" },
          description: "Order ID in OR-XXXXX format",
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
                  data: { $ref: "#/components/schemas/Order" },
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
  "/orders/customer/{customerId}": {
    get: {
      tags: ["Orders"],
      summary: "Get orders by customer",
      description: "Retrieve orders for a specific customer",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "customerId",
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
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Order" },
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
  "/orders/status/{status}": {
    get: {
      tags: ["Orders"],
      summary: "Get orders by status",
      description: "Retrieve orders with a specific status",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "status",
          required: true,
          schema: {
            type: "string",
            enum: [
              "pending",
              "processing",
              "shipped",
              "delivered",
              "cancelled",
            ],
          },
          description: "Order status",
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
                    items: { $ref: "#/components/schemas/Order" },
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
  "/orders/{_id}": {
    get: {
      tags: ["Orders"],
      summary: "Get order by ID",
      description: "Retrieve order details by MongoDB ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "_id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "MongoDB ID of the order",
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
                  data: { $ref: "#/components/schemas/Order" },
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
      tags: ["Orders"],
      summary: "Update order",
      description: "Update order details by MongoDB ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "_id",
          required: true,
          schema: { type: "string" },
          description: "MongoDB ID of the order to update",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/OrderUpdate" },
          },
        },
      },
      responses: {
        200: {
          description: "Order updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string" },
                  message: { type: "string" },
                  data: { $ref: "#/components/schemas/Order" },
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
      tags: ["Orders"],
      summary: "Delete order",
      description: "Delete order by MongoDB ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "_id",
          required: true,
          schema: { type: "string" },
          description: "MongoDB ID of the order to delete",
        },
      ],
      responses: {
        200: {
          description: "Order deleted successfully",
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

module.exports = orderRoutes;
