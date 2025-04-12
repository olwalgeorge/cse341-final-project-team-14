const productRoutes = {
  "/products": {
    get: {
      tags: ["Products"],
      summary: "Get all products",
      description:
        "Retrieve a list of all products with optional filtering and pagination",
      parameters: [
        {
          in: "query",
          name: "category",
          schema: { type: "string" },
          description: "Filter products by category",
        },
        {
          in: "query",
          name: "minPrice",
          schema: { type: "number" },
          description:
            "Filter products with price greater than or equal to this value",
        },
        {
          in: "query",
          name: "maxPrice",
          schema: { type: "number" },
          description:
            "Filter products with price less than or equal to this value",
        },
        {
          in: "query",
          name: "inStock",
          schema: { type: "string", enum: ["true", "false"] },
          description: "Filter products that are in stock (quantity > 0)",
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
                      products: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Product" },
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
      tags: ["Products"],
      summary: "Create a new product",
      description: "Create a new product in the system",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ProductInput" },
          },
        },
      },
      responses: {
        201: {
          description: "Product created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string" },
                  message: { type: "string" },
                  data: { $ref: "#/components/schemas/Product" },
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
      tags: ["Products"],
      summary: "Delete all products",
      description: "Delete all products from the system (use with caution)",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Products deleted successfully",
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
  "/products/search": {
    get: {
      tags: ["Products"],
      summary: "Search products",
      description: "Search products by text",
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
                    items: { $ref: "#/components/schemas/Product" },
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
  "/products/productID/{productID}": {
    get: {
      tags: ["Products"],
      summary: "Get product by product ID",
      description: "Retrieve product details by product ID (PR-XXXXX format)",
      parameters: [
        {
          in: "path",
          name: "productID",
          required: true,
          schema: { type: "string" },
          description: "Product ID in PR-XXXXX format",
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
                  data: { $ref: "#/components/schemas/Product" },
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
  "/products/category/{category}": {
    get: {
      tags: ["Products"],
      summary: "Get products by category",
      description: "Retrieve products that belong to a specific category",
      parameters: [
        {
          in: "path",
          name: "category",
          required: true,
          schema: { type: "string" },
          description: "Product category",
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
                    items: { $ref: "#/components/schemas/Product" },
                  },
                },
              },
            },
          },
        },
        500: { $ref: "#/components/responses/ServerError" },
      },
    },
  },
  "/products/supplier/{supplierId}": {
    get: {
      tags: ["Products"],
      summary: "Get products by supplier",
      description: "Retrieve products that are supplied by a specific supplier",
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
                    items: { $ref: "#/components/schemas/Product" },
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
  "/products/{_id}": {
    get: {
      tags: ["Products"],
      summary: "Get product by ID",
      description: "Retrieve product details by MongoDB ID",
      parameters: [
        {
          name: "_id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "MongoDB ID of the product",
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
                  data: { $ref: "#/components/schemas/Product" },
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
      tags: ["Products"],
      summary: "Update product",
      description: "Update product details by MongoDB ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "_id",
          required: true,
          schema: { type: "string" },
          description: "MongoDB ID of the product to update",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ProductUpdate" },
          },
        },
      },
      responses: {
        200: {
          description: "Product updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string" },
                  message: { type: "string" },
                  data: { $ref: "#/components/schemas/Product" },
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
      tags: ["Products"],
      summary: "Delete product",
      description: "Delete product by MongoDB ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "_id",
          required: true,
          schema: { type: "string" },
          description: "MongoDB ID of the product to delete",
        },
      ],
      responses: {
        200: {
          description: "Product deleted successfully",
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

module.exports = productRoutes;
