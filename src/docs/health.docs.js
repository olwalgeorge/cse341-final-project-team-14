const healthRoutes = {
  "/health": {
    get: {
      tags: ["Health"],
      summary: "API health check",
      description: "Check if the API is up and running",
      responses: {
        "200": {
          description: "API is healthy",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: {
                    type: "string",
                    example: "healthy"
                  },
                  message: {
                    type: "string",
                    example: "API is running properly"
                  },
                  timestamp: {
                    type: "string",
                    format: "date-time",
                    example: "2023-07-21T15:30:45Z"
                  }
                }
              }
            }
          }
        },
        "500": {
          $ref: "#/components/responses/ServerError"
        }
      }
    }
  },
  "/health/status": {
    get: {
      tags: ["Health"],
      summary: "API status details",
      description: "Get detailed information about the API status including uptime, memory usage, and service status",
      responses: {
        "200": {
          description: "API status details",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: {
                    type: "string",
                    example: "healthy"
                  },
                  uptime: {
                    type: "number",
                    example: 3600
                  },
                  startTime: {
                    type: "string",
                    format: "date-time",
                    example: "2023-07-21T10:30:45Z"
                  },
                  memory: {
                    type: "object",
                    properties: {
                      used: {
                        type: "string",
                        example: "128MB"
                      },
                      total: {
                        type: "string",
                        example: "512MB"
                      }
                    }
                  },
                  services: {
                    type: "object",
                    properties: {
                      database: {
                        type: "string",
                        example: "connected"
                      },
                      cache: {
                        type: "string",
                        example: "connected"
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "500": {
          $ref: "#/components/responses/ServerError"
        }
      }
    }
  }
};

module.exports = healthRoutes;
