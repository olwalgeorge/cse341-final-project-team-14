module.exports = {
  "/users/profile": {
    get: {
      tags: ["Users"],
      summary: "Get current user's profile",
      description: "Returns the profile information of the currently authenticated user. Available to all authenticated users regardless of role.",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "User profile retrieved successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Success" },
              example: {
                success: true,
                message: "User profile retrieved successfully",
                data: {
                  userID: "USR-00001",
                  username: "johnsmith",
                  email: "john.smith@example.com",
                  fullName: "John Smith",
                  role: "USER",
                  isActive: true,
                  isVerified: true,
                  lastLogin: "2023-04-17T10:30:45Z",
                  createdAt: "2022-10-15T08:10:22Z",
                  updatedAt: "2023-04-17T10:30:45Z"
                }
              }
            },
          },
        },
        401: { 
          $ref: "#/components/responses/UnauthorizedError",
          description: "Authentication token is missing, invalid, or expired"
        },
        500: { 
          $ref: "#/components/responses/ServerError",
          description: "An unexpected error occurred on the server"
        }
      },
    },
    put: {
      tags: ["Users"],
      summary: "Update current user's profile",
      description: "Updates the profile of the currently authenticated user. All authenticated users can update their own profiles, but with restrictions based on role:\n- USER/SUPERVISOR: Can update personal details but not role\n- MANAGER: Can update personal details and request role change up to MANAGER\n- ADMIN/SUPERADMIN: Full update capabilities",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UserUpdate" },
            examples: {
              basicUpdate: {
                summary: "Basic profile update",
                value: {
                  fullName: "John Smith Jr.",
                  avatar: "https://example.com/avatars/johnsmith_new.jpg"
                }
              },
              fullUpdate: {
                summary: "Full profile update (admin only)",
                value: {
                  username: "johnsmith_updated",
                  email: "john.smith.updated@example.com",
                  fullName: "John Smith Jr.",
                  avatar: "https://example.com/avatars/johnsmith_new.jpg",
                  role: "SUPERVISOR",
                  isActive: true
                }
              }
            }
          },
        },
      },
      responses: {
        200: {
          description: "Profile updated successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Success" },
              example: {
                success: true,
                message: "User profile updated successfully",
                data: {
                  userID: "USR-00001",
                  username: "johnsmith_updated",
                  email: "john.smith.updated@example.com",
                  fullName: "John Smith Jr.",
                  avatar: "https://example.com/avatars/johnsmith_new.jpg",
                  role: "SUPERVISOR",
                  isActive: true,
                  isVerified: true,
                  lastLogin: "2023-04-17T10:30:45Z",
                  createdAt: "2022-10-15T08:10:22Z", 
                  updatedAt: "2023-04-17T11:45:30Z"
                }
              }
            },
          },
        },
        400: { 
          $ref: "#/components/responses/ValidationError",
          description: "Validation error in request body (e.g., invalid email format, username too short)"
        },
        401: { 
          $ref: "#/components/responses/UnauthorizedError",
          description: "Authentication token is missing, invalid, or expired"
        },
        403: {
          description: "Forbidden - insufficient permissions for requested update",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Forbidden",
                error: ["You cannot change to a role higher than your current role"],
                errorCode: "FORBIDDEN_ERROR",
                statusCode: 403
              }
            },
          },
        },
        409: {
          description: "Conflict - Username or email already exists",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Conflict",
                error: ["Email address is already in use"],
                errorCode: "CONFLICT_ERROR",
                statusCode: 409
              }
            },
          },
        },
        500: { 
          $ref: "#/components/responses/ServerError",
          description: "An unexpected error occurred on the server"
        }
      },
    },
  },
  "/users/{userID}": {
    get: {
      tags: ["Users"],
      summary: "Get user by ID",
      description: "Retrieves a user by their userID (USR-XXXXX format). Access is role-based:\n- USER: Can only access their own profile\n- SUPERVISOR: Can access profiles of USERs in their department\n- MANAGER: Can access profiles of SUPERVISORs and USERs\n- ADMIN/SUPERADMIN: Can access all user profiles",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "userID",
          in: "path",
          required: true,
          schema: {
            type: "string",
            pattern: "^USR-\\d{5}$",
          },
          description: "User ID in USR-XXXXX format",
        },
      ],
      responses: {
        200: {
          description: "User retrieved successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Success" },
              example: {
                success: true,
                message: "User retrieved successfully",
                data: {
                  userID: "USR-00001",
                  username: "johnsmith",
                  email: "john.smith@example.com",
                  fullName: "John Smith",
                  role: "USER",
                  isActive: true,
                  isVerified: true,
                  lastLogin: "2023-04-17T10:30:45Z",
                  createdAt: "2022-10-15T08:10:22Z",
                  updatedAt: "2023-04-17T10:30:45Z"
                }
              }
            },
          },
        },
        400: {
          description: "Bad Request - Invalid user ID format",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Validation failed",
                error: ["User ID should be in the format USR-XXXXX where X is a digit"],
                errorCode: "VALIDATION_ERROR",
                statusCode: 400
              }
            },
          },
        },
        401: { 
          $ref: "#/components/responses/UnauthorizedError",
          description: "Authentication token is missing, invalid, or expired"
        },
        403: {
          description: "Forbidden - Insufficient permissions to access this user",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Forbidden",
                error: ["You do not have permission to view this user profile"],
                errorCode: "FORBIDDEN_ERROR",
                statusCode: 403
              }
            },
          },
        },
        404: { 
          $ref: "#/components/responses/NotFoundError",
          description: "User with the specified ID was not found"
        },
        500: { 
          $ref: "#/components/responses/ServerError",
          description: "An unexpected error occurred on the server"
        }
      },
    },
  },
  "/users/email/{email}": {
    get: {
      tags: ["Users"],
      summary: "Get user by email",
      description: "Retrieves a user by their email address. Access is role-based:\n- USER: Can only access their own profile\n- SUPERVISOR: Can access profiles of USERs in their department\n- MANAGER: Can access profiles of SUPERVISORs and USERs\n- ADMIN/SUPERADMIN: Can access all user profiles",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "email",
          in: "path",
          required: true,
          schema: {
            type: "string",
            format: "email",
          },
          description: "Email address of the user to retrieve"
        },
      ],
      responses: {
        200: {
          description: "User found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Success" },
              example: {
                success: true,
                message: "User retrieved successfully",
                data: {
                  userID: "USR-00001",
                  username: "johnsmith",
                  email: "john.smith@example.com",
                  fullName: "John Smith",
                  role: "USER",
                  isActive: true,
                  isVerified: true,
                  lastLogin: "2023-04-17T10:30:45Z",
                  createdAt: "2022-10-15T08:10:22Z",
                  updatedAt: "2023-04-17T10:30:45Z"
                }
              }
            },
          },
        },
        400: {
          description: "Bad Request - Invalid email format",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Validation failed",
                error: ["Invalid email format"],
                errorCode: "VALIDATION_ERROR",
                statusCode: 400
              }
            }
          }
        },
        401: { 
          $ref: "#/components/responses/UnauthorizedError",
          description: "Authentication token is missing, invalid, or expired" 
        },
        403: {
          description: "Forbidden - Insufficient permissions to access this user's data",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Forbidden",
                error: ["You do not have permission to view this user profile"],
                errorCode: "FORBIDDEN_ERROR",
                statusCode: 403
              }
            }
          }
        },
        404: { 
          $ref: "#/components/responses/NotFoundError",
          description: "No user found with the provided email address" 
        },
        500: { 
          $ref: "#/components/responses/ServerError",
          description: "An unexpected error occurred on the server" 
        }
      },
    },
  },
  "/users/username/{username}": {
    get: {
      tags: ["Users"],
      summary: "Get user by username",
      description: "Retrieves a user by their username. Access is role-based:\n- USER: Can only access their own profile\n- SUPERVISOR: Can access profiles of USERs in their department\n- MANAGER: Can access profiles of SUPERVISORs and USERs\n- ADMIN/SUPERADMIN: Can access all user profiles",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "username",
          in: "path",
          required: true,
          schema: {
            type: "string",
            pattern: "^[a-zA-Z0-9_]+$",
            minLength: 3,
            maxLength: 30
          },
          description: "Username of the user to retrieve"
        },
      ],
      responses: {
        200: {
          description: "User found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Success" },
              example: {
                success: true,
                message: "User retrieved successfully",
                data: {
                  userID: "USR-00001",
                  username: "johnsmith",
                  email: "john.smith@example.com",
                  fullName: "John Smith",
                  role: "USER",
                  isActive: true,
                  isVerified: true,
                  lastLogin: "2023-04-17T10:30:45Z",
                  createdAt: "2022-10-15T08:10:22Z",
                  updatedAt: "2023-04-17T10:30:45Z"
                }
              }
            },
          },
        },
        400: {
          description: "Bad Request - Invalid username format",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Validation failed",
                error: ["Username must be alphanumeric with underscores only"],
                errorCode: "VALIDATION_ERROR",
                statusCode: 400
              }
            }
          }
        },
        401: { 
          $ref: "#/components/responses/UnauthorizedError",
          description: "Authentication token is missing, invalid, or expired" 
        },
        403: {
          description: "Forbidden - Insufficient permissions to access this user's data",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Forbidden",
                error: ["You do not have permission to view this user profile"],
                errorCode: "FORBIDDEN_ERROR",
                statusCode: 403
              }
            }
          }
        },
        404: { 
          $ref: "#/components/responses/NotFoundError",
          description: "No user found with the provided username" 
        },
        500: { 
          $ref: "#/components/responses/ServerError",
          description: "An unexpected error occurred on the server" 
        }
      },
    },
  },
  "/users/search": {
    get: {
      tags: ["Users"],
      summary: "Search for users",
      description: "Search for users by a text term that matches against usernames, email addresses, or full names. Access is role-based:\n- USER: Results limited to themselves\n- SUPERVISOR: Results limited to themselves and USERs in their department\n- MANAGER: Results limited to themselves, SUPERVISORs, and USERs\n- ADMIN/SUPERADMIN: Full access to all users",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "term",
          in: "query",
          required: true,
          schema: {
            type: "string",
            minLength: 2,
            maxLength: 50,
          },
          description: "Search term (min 2 chars, max 50)",
        },
        {
          name: "page",
          in: "query",
          required: false,
          schema: {
            type: "integer",
            default: 1,
            minimum: 1,
          },
          description: "Page number for pagination",
        },
        {
          name: "limit",
          in: "query",
          required: false,
          schema: {
            type: "integer",
            default: 10,
            minimum: 1,
            maximum: 100,
          },
          description: "Number of results per page",
        },
      ],
      responses: {
        200: {
          description: "Search results",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UsersList" },
              example: {
                success: true,
                message: "Found 2 users matching \"john\"",
                data: {
                  users: [
                    {
                      userID: "USR-00001",
                      username: "johnsmith",
                      email: "john.smith@example.com",
                      fullName: "John Smith",
                      role: "USER",
                      isActive: true
                    },
                    {
                      userID: "USR-00018",
                      username: "johnbrown",
                      email: "john.brown@example.com", 
                      fullName: "John Brown",
                      role: "SUPERVISOR",
                      isActive: true
                    }
                  ],
                  pagination: {
                    total: 2,
                    page: 1,
                    limit: 10,
                    totalPages: 1
                  }
                }
              }
            },
          },
        },
        400: { 
          $ref: "#/components/responses/ValidationError",
          description: "Invalid search parameters (e.g., term too short)" 
        },
        401: { 
          $ref: "#/components/responses/UnauthorizedError",
          description: "Authentication token is missing, invalid, or expired" 
        },
        403: {
          description: "Insufficient permissions to perform this search",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Forbidden",
                error: ["You do not have permission to search all users"],
                errorCode: "FORBIDDEN_ERROR",
                statusCode: 403
              }
            }
          }
        },
        500: { 
          $ref: "#/components/responses/ServerError",
          description: "An unexpected error occurred on the server" 
        }
      },
    },
  },
  "/users/role/{role}": {
    get: {
      tags: ["Users"],
      summary: "Get users by role",
      description: "Retrieves users filtered by role. Access is role-based and hierarchical:\n- USER: Cannot access this endpoint\n- SUPERVISOR: Can only view USERs\n- MANAGER: Can view USERs and SUPERVISORs\n- ADMIN: Can view USERs, SUPERVISORs, and MANAGERs\n- SUPERADMIN: Can view all roles",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "role",
          in: "path",
          required: true,
          schema: {
            type: "string",
            enum: ["USER", "SUPERVISOR", "MANAGER", "ADMIN", "SUPERADMIN"],
          },
          description: "Role to filter by",
        },
        {
          name: "page",
          in: "query",
          required: false,
          schema: {
            type: "integer",
            default: 1,
            minimum: 1,
          },
          description: "Page number for pagination",
        },
        {
          name: "limit",
          in: "query",
          required: false,
          schema: {
            type: "integer",
            default: 10,
            minimum: 1,
            maximum: 100,
          },
          description: "Number of results per page",
        },
      ],
      responses: {
        200: {
          description: "Users found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UsersList" },
              example: {
                success: true,
                message: "Users retrieved successfully",
                data: {
                  users: [
                    {
                      userID: "USR-00001",
                      username: "johnsmith",
                      email: "john.smith@example.com",
                      fullName: "John Smith",
                      role: "USER",
                      isActive: true
                    },
                    {
                      userID: "USR-00005",
                      username: "annalee",
                      email: "anna.lee@example.com", 
                      fullName: "Anna Lee",
                      role: "USER",
                      isActive: true
                    }
                  ],
                  pagination: {
                    total: 45,
                    page: 1,
                    limit: 10,
                    totalPages: 5
                  }
                }
              }
            },
          },
        },
        400: { 
          $ref: "#/components/responses/ValidationError",
          description: "Invalid role specified" 
        },
        401: { 
          $ref: "#/components/responses/UnauthorizedError",
          description: "Authentication token is missing, invalid, or expired" 
        },
        403: {
          description: "Insufficient permissions to view users with this role",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Forbidden",
                error: ["You do not have permission to view users with ADMIN role"],
                errorCode: "FORBIDDEN_ERROR",
                statusCode: 403
              }
            }
          }
        },
        500: { 
          $ref: "#/components/responses/ServerError",
          description: "An unexpected error occurred on the server" 
        }
      },
    },
  },
  "/users": {
    get: {
      tags: ["Users"],
      summary: "Get all users",
      description: "Retrieves a paginated list of all users. Access is role-based:\n- USER: Cannot access this endpoint\n- SUPERVISOR: Results limited to themselves and USERs in their department\n- MANAGER: Results limited to themselves, SUPERVISORs, and USERs\n- ADMIN/SUPERADMIN: Full access to all users",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "page",
          in: "query",
          required: false,
          schema: {
            type: "integer",
            default: 1,
            minimum: 1,
          },
          description: "Page number for pagination",
        },
        {
          name: "limit",
          in: "query",
          required: false,
          schema: {
            type: "integer",
            default: 10,
            minimum: 1,
            maximum: 100,
          },
          description: "Number of results per page",
        },
        {
          name: "sort",
          in: "query",
          required: false,
          schema: {
            type: "string",
            enum: ["username", "email", "role", "createdAt", "lastLogin"],
            default: "username",
          },
          description: "Field to sort by",
        },
        {
          name: "order",
          in: "query",
          required: false,
          schema: {
            type: "string",
            enum: ["asc", "desc"],
            default: "asc",
          },
          description: "Sort order (ascending or descending)",
        },
        {
          name: "username",
          in: "query",
          required: false,
          schema: {
            type: "string"
          },
          description: "Filter by username (partial match)"
        },
        {
          name: "email",
          in: "query",
          required: false,
          schema: {
            type: "string"
          },
          description: "Filter by email (partial match)"
        },
        {
          name: "fullName",
          in: "query",
          required: false,
          schema: {
            type: "string"
          },
          description: "Filter by user's full name (partial match)"
        },
        {
          name: "role",
          in: "query",
          required: false,
          schema: {
            type: "string",
            enum: ["USER", "SUPERVISOR", "MANAGER", "ADMIN", "SUPERADMIN"]
          },
          description: "Filter by user role"
        },
        {
          name: "isVerified",
          in: "query",
          required: false,
          schema: {
            type: "boolean"
          },
          description: "Filter by verification status"
        }
      ],
      responses: {
        200: {
          description: "List of all users retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Users retrieved successfully" },
                  data: {
                    type: "object",
                    properties: {
                      users: {
                        type: "array",
                        items: { $ref: "#/components/schemas/UserResponse" }
                      },
                      pagination: { $ref: "#/components/schemas/Pagination" }
                    }
                  }
                }
              },
              example: {
                success: true,
                message: "Users retrieved successfully",
                data: {
                  users: [
                    {
                      userID: "USR-00001",
                      username: "johnsmith",
                      email: "john.smith@example.com",
                      fullName: "John Smith",
                      role: "USER",
                      isActive: true,
                      createdAt: "2023-01-15T08:30:00Z",
                      updatedAt: "2023-04-10T14:15:30Z"
                    },
                    {
                      userID: "USR-00002",
                      username: "janedoe",
                      email: "jane.doe@example.com",
                      fullName: "Jane Doe",
                      role: "SUPERVISOR",
                      isActive: true,
                      createdAt: "2023-01-16T09:45:00Z",
                      updatedAt: "2023-04-12T11:20:15Z"
                    }
                  ],
                  pagination: {
                    total: 42,
                    page: 1,
                    limit: 10,
                    totalPages: 5
                  }
                }
              }
            },
          },
        },
        400: {
          description: "Bad request - Invalid query parameters",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Validation failed",
                error: ["Invalid sort field specified"],
                errorCode: "VALIDATION_ERROR",
                statusCode: 400
              }
            }
          }
        },
        401: { 
          $ref: "#/components/responses/UnauthorizedError",
          description: "Authentication token is missing, invalid, or expired" 
        },
        403: {
          description: "Forbidden - Insufficient permissions to list users",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Forbidden",
                error: ["Insufficient permissions to list all users"],
                errorCode: "FORBIDDEN_ERROR",
                statusCode: 403
              }
            }
          }
        },
        500: { 
          $ref: "#/components/responses/ServerError",
          description: "An unexpected error occurred on the server" 
        }
      },
    },
    delete: {
      tags: ["Users"],
      summary: "Delete all users",
      description: "Deletes all users from the system. This operation is extremely destructive and limited to SUPERADMIN role only.",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "All users deleted successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Success" },
              example: {
                success: true,
                message: "All users deleted successfully",
                data: {
                  deletedCount: 42
                }
              }
            },
          },
        },
        401: { 
          $ref: "#/components/responses/UnauthorizedError",
          description: "Authentication token is missing, invalid, or expired" 
        },
        403: {
          description: "Forbidden - Only SUPERADMIN can delete all users",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Forbidden",
                error: ["Only SUPERADMIN role can delete all users"],
                errorCode: "FORBIDDEN_ERROR",
                statusCode: 403
              }
            },
          },
        },
        500: { 
          $ref: "#/components/responses/ServerError",
          description: "An unexpected error occurred on the server" 
        }
      },
    },
    post: {
      tags: ["Users"],
      summary: "Create a new user (admin only)",
      description: "Creates a new user in the system. Restricted to ADMIN and SUPERADMIN roles. Admins can create users with roles up to ADMIN, while SUPERADMIN can create any role.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UserInput" },
            examples: {
              basicUser: {
                summary: "Basic user creation",
                value: {
                  username: "newuser",
                  email: "newuser@example.com",
                  password: "SecurePass123!",
                  fullName: "New User",
                  role: "USER"
                }
              },
              supervisorUser: {
                summary: "Supervisor creation",
                value: {
                  username: "newsupervisor",
                  email: "supervisor@example.com",
                  password: "SuperPass456!",
                  fullName: "New Supervisor",
                  role: "SUPERVISOR",
                  avatar: "https://example.com/avatars/supervisor.jpg"
                }
              }
            }
          },
        },
      },
      responses: {
        201: {
          description: "User created successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Success" },
              example: {
                success: true,
                message: "User created successfully",
                data: {
                  userID: "USR-00050",
                  username: "newuser",
                  email: "newuser@example.com",
                  fullName: "New User",
                  role: "USER",
                  isActive: true,
                  isVerified: false,
                  createdAt: "2023-04-17T15:30:45Z",
                  updatedAt: "2023-04-17T15:30:45Z"
                }
              }
            },
          },
        },
        400: { 
          description: "Validation error in input data",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              examples: {
                invalidUsername: {
                  summary: "Invalid username",
                  value: {
                    success: false,
                    message: "Validation failed",
                    error: ["Username must be between 3 and 30 characters", "Username must not start with a number"],
                    errorCode: "VALIDATION_ERROR",
                    statusCode: 400
                  }
                },
                invalidEmail: {
                  summary: "Invalid email format",
                  value: {
                    success: false,
                    message: "Validation failed",
                    error: ["Invalid email format"],
                    errorCode: "VALIDATION_ERROR",
                    statusCode: 400
                  }
                },
                passwordTooWeak: {
                  summary: "Password too weak",
                  value: {
                    success: false,
                    message: "Validation failed",
                    error: ["Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"],
                    errorCode: "VALIDATION_ERROR",
                    statusCode: 400
                  }
                }
              }
            }
          }
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        403: { 
          description: "Forbidden - Insufficient permissions or attempting to create a user with too high a role",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              examples: {
                insufficientPermission: {
                  summary: "Insufficient permission",
                  value: {
                    success: false,
                    message: "Forbidden",
                    error: ["Only ADMIN or SUPERADMIN can create new users"],
                    errorCode: "FORBIDDEN_ERROR",
                    statusCode: 403
                  }
                },
                roleTooHigh: {
                  summary: "Role too high",
                  value: {
                    success: false,
                    message: "Forbidden",
                    error: ["Cannot create a user with a role higher than your own"],
                    errorCode: "FORBIDDEN_ERROR",
                    statusCode: 403
                  }
                }
              }
            }
          }
        },
        409: {
          description: "Conflict - Username or email already exists",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              examples: {
                usernameExists: {
                  summary: "Username exists",
                  value: {
                    success: false,
                    message: "Conflict",
                    error: ["Username already exists"],
                    errorCode: "CONFLICT_ERROR",
                    statusCode: 409
                  }
                },
                emailExists: {
                  summary: "Email exists",
                  value: {
                    success: false,
                    message: "Conflict",
                    error: ["Email address already in use"],
                    errorCode: "CONFLICT_ERROR",
                    statusCode: 409
                  }
                }
              }
            },
          },
        },
        500: { $ref: "#/components/responses/ServerError" }
      },
    },
  },
  "/users/{user_Id}": {
    get: {
      tags: ["Users"],
      summary: "Get user by MongoDB ID",
      description: "Retrieves a user by their MongoDB ID. Access is role-based:\n- USER: Can only access their own profile\n- SUPERVISOR: Can access profiles of USERs in their department\n- MANAGER: Can access profiles of SUPERVISORs and USERs\n- ADMIN/SUPERADMIN: Can access all user profiles",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "user_Id",
          in: "path",
          required: true,
          schema: {
            type: "string",
            format: "mongodb-id"
          },
          description: "MongoDB ID of the user",
        },
      ],
      responses: {
        200: {
          description: "User retrieved successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Success" },
              example: {
                success: true,
                message: "User retrieved successfully",
                data: {
                  user_id: "64f5a7b3c5dc0d34f85d969e",
                  userID: "USR-00001",
                  username: "johnsmith",
                  email: "john.smith@example.com",
                  fullName: "John Smith",
                  role: "USER",
                  isActive: true,
                  isVerified: true,
                  lastLogin: "2023-04-17T10:30:45Z",
                  createdAt: "2022-10-15T08:10:22Z",
                  updatedAt: "2023-04-17T10:30:45Z"
                }
              }
            },
          },
        },
        400: {
          description: "Bad Request - Invalid MongoDB ID format",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Validation failed",
                error: ["Invalid MongoDB ID format"],
                errorCode: "VALIDATION_ERROR",
                statusCode: 400
              }
            },
          },
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        403: {
          description: "Forbidden - Insufficient permissions to access this user",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Forbidden",
                error: ["You do not have permission to view this user profile"],
                errorCode: "FORBIDDEN_ERROR",
                statusCode: 403
              }
            },
          },
        },
        404: { $ref: "#/components/responses/NotFoundError" },
        500: { $ref: "#/components/responses/ServerError" }
      },
    },
    put: {
      tags: ["Users"],
      summary: "Update user by MongoDB ID",
      description: "Updates a user identified by MongoDB ID. Access is role-based and hierarchical:\n- USER: Can only update their own profile and cannot change their role\n- SUPERVISOR: Can update USERs in their department but cannot change roles\n- MANAGER: Can update SUPERVISORs and USERs, and promote USERs to SUPERVISOR\n- ADMIN: Can update any user except SUPERADMIN and change roles up to ADMIN\n- SUPERADMIN: Full update capabilities for any user",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "user_Id",
          in: "path",
          required: true,
          schema: {
            type: "string",
            format: "mongodb-id"
          },
          description: "MongoDB ID of the user",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UserUpdate" },
            examples: {
              basicUpdate: {
                summary: "Basic user update",
                value: {
                  fullName: "Updated Name",
                  avatar: "https://example.com/avatars/updated.jpg"
                }
              },
              fullUpdate: {
                summary: "Full user update (admin only)",
                value: {
                  username: "updated_username",
                  email: "updated@example.com",
                  fullName: "Updated Full Name",
                  avatar: "https://example.com/avatars/updated.jpg",
                  role: "SUPERVISOR",
                  isActive: true
                }
              }
            }
          },
        },
      },
      responses: {
        200: {
          description: "User updated successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Success" },
              example: {
                success: true,
                message: "User updated successfully",
                data: {
                  user_id: "64f5a7b3c5dc0d34f85d969e",
                  userID: "USR-00001",
                  username: "updated_username",
                  email: "updated@example.com",
                  fullName: "Updated Full Name",
                  avatar: "https://example.com/avatars/updated.jpg",
                  role: "SUPERVISOR",
                  isActive: true,
                  isVerified: true,
                  updatedAt: "2023-04-17T15:45:30Z"
                }
              }
            },
          },
        },
        400: { 
          description: "Bad Request - Validation error in input data or invalid MongoDB ID",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              examples: {
                invalidId: {
                  summary: "Invalid MongoDB ID",
                  value: {
                    success: false,
                    message: "Validation failed",
                    error: ["Invalid MongoDB ID format"],
                    errorCode: "VALIDATION_ERROR",
                    statusCode: 400
                  }
                },
                invalidEmail: {
                  summary: "Invalid email format",
                  value: {
                    success: false,
                    message: "Validation failed",
                    error: ["Invalid email format"],
                    errorCode: "VALIDATION_ERROR",
                    statusCode: 400
                  }
                }
              }
            }
          } 
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        403: { 
          description: "Forbidden - Insufficient permissions to update this user or their role",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              examples: {
                insufficientPermission: {
                  summary: "Insufficient permission",
                  value: {
                    success: false,
                    message: "Forbidden",
                    error: ["You do not have permission to update this user"],
                    errorCode: "FORBIDDEN_ERROR",
                    statusCode: 403
                  }
                },
                roleChangeNotAllowed: {
                  summary: "Role change not allowed",
                  value: {
                    success: false,
                    message: "Forbidden",
                    error: ["You cannot change a user to a role higher than your own"],
                    errorCode: "FORBIDDEN_ERROR",
                    statusCode: 403
                  }
                }
              }
            }
          }
        },
        404: { $ref: "#/components/responses/NotFoundError" },
        409: {
          description: "Conflict - Username or email already exists",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Conflict",
                error: ["Username already exists"],
                errorCode: "CONFLICT_ERROR",
                statusCode: 409
              }
            },
          },
        },
        500: { $ref: "#/components/responses/ServerError" }
      },
    },
    delete: {
      tags: ["Users"],
      summary: "Delete user by MongoDB ID",
      description: "Deletes a user identified by MongoDB ID. Access is role-based and hierarchical:\n- USER: Cannot delete any user\n- SUPERVISOR: Can delete USERs in their department\n- MANAGER: Can delete SUPERVISORs and USERs\n- ADMIN: Can delete any user except other ADMINs and SUPERADMINs\n- SUPERADMIN: Can delete any user except other SUPERADMINs",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "user_Id",
          in: "path",
          required: true,
          schema: {
            type: "string",
            format: "mongodb-id"
          },
          description: "MongoDB ID of the user",
        },
      ],
      responses: {
        200: {
          description: "User deleted successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Success" },
              example: {
                success: true,
                message: "User deleted successfully"
              }
            },
          },
        },
        400: {
          description: "Bad Request - Invalid MongoDB ID",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Validation failed",
                error: ["Invalid MongoDB ID format"],
                errorCode: "VALIDATION_ERROR",
                statusCode: 400
              }
            },
          },
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        403: {
          description: "Forbidden - Insufficient permissions to delete this user",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Forbidden",
                error: ["You do not have permission to delete this user"],
                errorCode: "FORBIDDEN_ERROR",
                statusCode: 403
              }
            },
          },
        },
        404: { $ref: "#/components/responses/NotFoundError" },
        500: { $ref: "#/components/responses/ServerError" }
      },
    },
  },
  
  "/users/userID/{userID}/revoke-rate-limit": {
    post: {
      tags: ["Users"],
      summary: "Revoke rate limit for a user by userID",
      description: "Temporarily exempts a user from API rate limits based on their userID. This operation requires ADMIN or SUPERADMIN role.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "userID",
          in: "path",
          required: true,
          schema: {
            type: "string",
            pattern: "^USR-\\d{5}$",
          },
          description: "User ID in USR-XXXXX format",
        },
      ],
      requestBody: {
        required: false,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                ipAddress: {
                  type: "string",
                  format: "ipv4",
                  description: "IP address to exempt (optional, will use user's last login IP if not provided)"
                },
                durationHours: {
                  type: "integer",
                  minimum: 1,
                  maximum: 168, // 1 week
                  default: 24,
                  description: "Duration in hours for the exemption"
                },
                reason: {
                  type: "string",
                  example: "User needs to perform batch operations temporarily",
                  description: "Reason for the rate limit exemption"
                }
              }
            },
            example: {
              ipAddress: "192.168.1.105",
              durationHours: 48,
              reason: "Processing large data import"
            }
          }
        }
      },
      responses: {
        200: {
          description: "Rate limit successfully revoked",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Success"
              },
              example: {
                success: true,
                message: "Rate limit revoked successfully",
                data: {
                  userId: "64f5a7b3c5dc0d34f85d969e",
                  userID: "USR-00001",
                  username: "johnsmith",
                  exemptUntil: "2023-04-19T14:30:00Z"
                }
              }
            }
          }
        },
        400: { 
          description: "Bad Request - Invalid user ID format or invalid request parameters",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              examples: {
                invalidUserID: {
                  summary: "Invalid user ID",
                  value: {
                    success: false,
                    message: "Validation failed",
                    error: ["User ID should be in the format USR-XXXXX where X is a digit"],
                    errorCode: "VALIDATION_ERROR",
                    statusCode: 400
                  }
                },
                invalidIPAddress: {
                  summary: "Invalid IP address",
                  value: {
                    success: false,
                    message: "Validation failed",
                    error: ["Invalid IP address format"],
                    errorCode: "VALIDATION_ERROR",
                    statusCode: 400
                  }
                },
                invalidDuration: {
                  summary: "Invalid duration",
                  value: {
                    success: false,
                    message: "Validation failed",
                    error: ["Duration must be between 1 and 168 hours"],
                    errorCode: "VALIDATION_ERROR",
                    statusCode: 400
                  }
                }
              }
            }
          }
        },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { 
          description: "Forbidden - Insufficient permissions to revoke rate limits",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Forbidden",
                error: ["Only ADMIN and SUPERADMIN can revoke rate limits"],
                errorCode: "FORBIDDEN_ERROR",
                statusCode: 403
              }
            }
          }
        },
        404: { 
          description: "Not Found - User not found with the specified ID",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Not Found",
                error: ["User not found with ID: USR-00999"],
                errorCode: "NOT_FOUND_ERROR",
                statusCode: 404
              }
            }
          } 
        },
        500: { $ref: "#/components/responses/ServerError" }
      }
    }
  },
  
  "/users/revoke-rate-limit/{user_Id}": {
    post: {
      tags: ["Users"],
      summary: "Revoke rate limit for a user by MongoDB ID",
      description: "Temporarily exempts a user from API rate limits based on their MongoDB ID. This operation requires ADMIN or SUPERADMIN role.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "user_Id",
          in: "path",
          required: true,
          schema: {
            type: "string",
            format: "mongodb-id"
          },
          description: "MongoDB ID of the user",
        },
      ],
      requestBody: {
        required: false,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                ipAddress: {
                  type: "string",
                  format: "ipv4",
                  description: "IP address to exempt (optional, will use user's last login IP if not provided)"
                },
                durationHours: {
                  type: "integer",
                  minimum: 1,
                  maximum: 168, // 1 week
                  default: 24,
                  description: "Duration in hours for the exemption"
                },
                reason: {
                  type: "string",
                  example: "User needs to perform batch operations temporarily",
                  description: "Reason for the rate limit exemption"
                }
              }
            },
            example: {
              ipAddress: "192.168.1.105",
              durationHours: 48,
              reason: "Processing large data import"
            }
          }
        }
      },
      responses: {
        200: {
          description: "Rate limit successfully revoked",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Success"
              },
              example: {
                success: true,
                message: "Rate limit revoked successfully",
                data: {
                  userId: "64f5a7b3c5dc0d34f85d969e",
                  userID: "USR-00001",
                  username: "johnsmith",
                  exemptUntil: "2023-04-19T14:30:00Z"
                }
              }
            }
          }
        },
        400: { 
          description: "Bad Request - Invalid MongoDB ID format or invalid request parameters",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              examples: {
                invalidMongoID: {
                  summary: "Invalid MongoDB ID",
                  value: {
                    success: false,
                    message: "Validation failed",
                    error: ["Invalid MongoDB ID format"],
                    errorCode: "VALIDATION_ERROR",
                    statusCode: 400
                  }
                },
                invalidIPAddress: {
                  summary: "Invalid IP address",
                  value: {
                    success: false,
                    message: "Validation failed",
                    error: ["Invalid IP address format"],
                    errorCode: "VALIDATION_ERROR",
                    statusCode: 400
                  }
                }
              }
            }
          }
        },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { 
          description: "Forbidden - Insufficient permissions to revoke rate limits",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Forbidden",
                error: ["Only ADMIN and SUPERADMIN can revoke rate limits"],
                errorCode: "FORBIDDEN_ERROR",
                statusCode: 403
              }
            }
          }
        },
        404: { 
          description: "Not Found - User not found with the specified MongoDB ID",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Not Found",
                error: ["User not found with ID: 64f5a7b3c5dc0d34f85d969e"],
                errorCode: "NOT_FOUND_ERROR",
                statusCode: 404
              }
            }
          } 
        },
        500: { $ref: "#/components/responses/ServerError" }
      }
    }
  }
};
