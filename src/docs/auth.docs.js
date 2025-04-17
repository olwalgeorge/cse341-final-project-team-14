module.exports = {
  "/auth/register": {
    post: {
      tags: ["Authentication"],
      summary: "Register new user",
      description: "Creates a new user account in the system. No authentication required. Password must meet complexity requirements. Username and email must be unique in the system.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "password", "username", "fullName"],
              properties: {
                email: { 
                  type: "string", 
                  format: "email",
                  example: "user@example.com",
                  description: "Valid email address that will be used for account verification and communication"
                },
                password: { 
                  type: "string", 
                  format: "password",
                  example: "SecurePass123!",
                  description: "Password must be 8-50 characters and include lowercase, uppercase, number, and special character"
                },
                username: { 
                  type: "string",
                  example: "johnsmith",
                  description: "Unique username (3-30 chars, alphanumeric and underscores, can't start with number)"
                },
                fullName: { 
                  type: "string",
                  example: "John Smith",
                  description: "User's full name (3-50 characters)"
                },
                role: {
                  type: "string",
                  enum: ["USER", "ORG"],
                  example: "USER",
                  description: "Optional role (defaults to USER if not specified)"
                }
              },
            },
            examples: {
              basicRegistration: {
                summary: "Basic user registration",
                value: {
                  email: "user@example.com",
                  password: "SecurePass123!",
                  username: "johnsmith",
                  fullName: "John Smith"
                }
              },
              organizationRegistration: {
                summary: "Organization registration",
                value: {
                  email: "org@example.com",
                  password: "SecurePass123!",
                  username: "techcompany",
                  fullName: "Tech Company Inc.",
                  role: "ORG"
                }
              }
            }
          },
        },
      },
      responses: {
        201: {
          description: "User registered successfully",
          content: {
            "application/json": {
              schema: { 
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "User registered successfully" },
                  data: {
                    type: "object",
                    properties: {
                      user: {
                        type: "object",
                        properties: {
                          userID: { type: "string", example: "USR-00001" },
                          username: { type: "string", example: "johnsmith" },
                          email: { type: "string", example: "user@example.com" },
                          fullName: { type: "string", example: "John Smith" },
                          role: { type: "string", example: "USER" },
                          isActive: { type: "boolean", example: true },
                          isVerified: { type: "boolean", example: false },
                          createdAt: { type: "string", format: "date-time" },
                          updatedAt: { type: "string", format: "date-time" }
                        }
                      }
                    }
                  }
                }
              }
            },
          },
        },
        400: { 
          description: "Validation error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              examples: {
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
                invalidUsername: {
                  summary: "Invalid username format",
                  value: {
                    success: false,
                    message: "Validation failed",
                    error: ["Username must not start with a number and can only contain alphanumeric characters and underscores", "Username must be between 3 and 30 characters"],
                    errorCode: "VALIDATION_ERROR",
                    statusCode: 400
                  }
                },
                invalidPassword: {
                  summary: "Password too weak",
                  value: {
                    success: false,
                    message: "Validation failed",
                    error: ["Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"],
                    errorCode: "VALIDATION_ERROR",
                    statusCode: 400
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
                emailConflict: {
                  summary: "Email already exists",
                  value: {
                    success: false,
                    message: "Conflict",
                    error: ["Email already exists"],
                    errorCode: "CONFLICT_ERROR",
                    statusCode: 409
                  }
                },
                usernameConflict: {
                  summary: "Username already exists",
                  value: {
                    success: false,
                    message: "Conflict",
                    error: ["Username already exists"],
                    errorCode: "CONFLICT_ERROR",
                    statusCode: 409
                  }
                }
              }
            },
          },
        },
        429: {
          description: "Too Many Requests - Rate limit exceeded",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Too Many Requests",
                error: ["Too many registration attempts. Try again later."],
                errorCode: "RATE_LIMIT_ERROR",
                statusCode: 429
              }
            }
          }
        },
        500: { 
          $ref: "#/components/responses/ServerError",
          description: "An unexpected error occurred on the server"
        },
      },
    },
  },
  "/auth/login": {
    post: {
      tags: ["Authentication"],
      summary: "Login user",
      description: "Authenticates a user with email and password, returning a JWT token. If a valid token already exists, it may be reused instead of generating a new one.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "password"],
              properties: {
                email: { 
                  type: "string", 
                  format: "email",
                  example: "user@example.com",
                  description: "User's registered email address"
                },
                password: { 
                  type: "string", 
                  format: "password",
                  example: "SecurePass123!",
                  description: "User's password"
                },
              },
            },
            example: {
              email: "user@example.com",
              password: "SecurePass123!"
            }
          },
        },
      },
      responses: {
        200: {
          description: "Login successful",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Login successful" },
                  data: {
                    type: "object",
                    properties: {
                      token: { 
                        type: "string", 
                        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
                      },
                      user: {
                        type: "object",
                        properties: {
                          _id: { type: "string", example: "64f5a7b3c5dc0d34f85d969e" },
                          userID: { type: "string", example: "USR-00001" },
                          username: { type: "string", example: "johnsmith" },
                          email: { type: "string", example: "user@example.com" },
                          role: { type: "string", example: "USER" },
                          fullName: { type: "string", example: "John Smith" }
                        }
                      }
                    }
                  }
                }
              },
              examples: {
                normalLogin: {
                  summary: "Normal login",
                  value: {
                    success: true,
                    message: "Login successful",
                    data: {
                      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                      user: {
                        _id: "64f5a7b3c5dc0d34f85d969e",
                        userID: "USR-00001",
                        username: "johnsmith",
                        email: "user@example.com",
                        role: "USER",
                        fullName: "John Smith"
                      }
                    }
                  }
                },
                tokenReused: {
                  summary: "Login with token reuse",
                  value: {
                    success: true,
                    message: "Login successful (token reused)",
                    data: {
                      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                      user: {
                        _id: "64f5a7b3c5dc0d34f85d969e",
                        userID: "USR-00001",
                        username: "johnsmith",
                        email: "user@example.com",
                        role: "USER",
                        fullName: "John Smith"
                      }
                    }
                  }
                },
                alreadyLoggedIn: {
                  summary: "Already logged in",
                  value: {
                    success: true,
                    message: "You are already logged in",
                    data: {
                      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                      user: {
                        _id: "64f5a7b3c5dc0d34f85d969e",
                        userID: "USR-00001",
                        username: "johnsmith",
                        email: "user@example.com",
                        role: "USER",
                        fullName: "John Smith"
                      },
                      alreadyLoggedIn: true
                    }
                  }
                }
              }
            },
          },
        },
        400: {
          description: "Validation error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              examples: {
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
                missingFields: {
                  summary: "Missing required fields",
                  value: {
                    success: false,
                    message: "Validation failed",
                    error: ["Email is required", "Password is required"],
                    errorCode: "VALIDATION_ERROR",
                    statusCode: 400
                  }
                }
              }
            }
          }
        },
        401: {
          description: "Authentication failed",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              examples: {
                invalidCredentials: {
                  summary: "Invalid credentials",
                  value: {
                    success: false,
                    message: "Authentication failed",
                    error: ["Invalid email or password"],
                    errorCode: "AUTH_ERROR",
                    statusCode: 401
                  }
                },
                accountLocked: {
                  summary: "Account locked",
                  value: {
                    success: false,
                    message: "Authentication failed",
                    error: ["Account temporarily locked due to too many failed login attempts"],
                    errorCode: "AUTH_ERROR",
                    statusCode: 401
                  }
                }
              }
            }
          }
        },
        403: {
          description: "Account inactive",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Authentication failed",
                error: ["Account is inactive or requires verification"],
                errorCode: "FORBIDDEN_ERROR",
                statusCode: 403
              }
            }
          }
        },
        429: {
          description: "Too Many Requests - Rate limit exceeded",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Too Many Requests",
                error: ["Too many login attempts. Try again later."],
                errorCode: "RATE_LIMIT_ERROR",
                statusCode: 429
              }
            }
          }
        },
        500: { 
          $ref: "#/components/responses/ServerError",
          description: "An unexpected error occurred on the server"
        },
      },
    },
  },
  "/auth/logout": {
    post: {
      tags: ["Authentication"],
      summary: "Logout user",
      description: "Invalidates the user's JWT token by adding it to a blacklist and destroys their session. Requires authentication.",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Logged out successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Logged out successfully" }
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
          description: "Server error during logout",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Error during logout process",
                errorCode: "SERVER_ERROR",
                statusCode: 500
              }
            }
          }
        }
      },
    },
  },
  "/auth/token": {
    get: {
      tags: ["Authentication"],
      summary: "Get JWT token",
      description: "Generates a new JWT token for an already authenticated user. Requires authentication.",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Token generated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Token generated successfully" },
                  data: {
                    type: "object",
                    properties: {
                      token: { 
                        type: "string", 
                        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
                      }
                    }
                  }
                }
              }
            },
          },
        },
        401: {
          description: "Not authenticated",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Not authenticated",
                error: "User must be logged in",
                statusCode: 401
              }
            }
          }
        },
        500: {
          description: "Failed to generate token",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Failed to generate token",
                error: "Internal server error",
                errorCode: "SERVER_ERROR",
                statusCode: 500
              }
            }
          }
        }
      },
    },
  },
  "/auth/verify": {
    get: {
      tags: ["Authentication"],
      summary: "Verify token validity",
      description: "Checks if the provided JWT token is valid and not blacklisted. Requires authentication.",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Token is valid",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Token is valid" },
                  data: {
                    type: "object",
                    properties: {
                      user: {
                        type: "object",
                        properties: {
                          _id: { type: "string", example: "64f5a7b3c5dc0d34f85d969e" },
                          userID: { type: "string", example: "USR-00001" },
                          username: { type: "string", example: "johnsmith" },
                          email: { type: "string", example: "user@example.com" },
                          role: { type: "string", example: "USER" }
                        }
                      }
                    }
                  }
                }
              }
            },
          },
        },
        401: {
          description: "Token is invalid or expired",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              examples: {
                noToken: {
                  summary: "No token provided",
                  value: {
                    success: false,
                    message: "No token provided",
                    statusCode: 401
                  }
                },
                invalidToken: {
                  summary: "Invalid token",
                  value: {
                    success: false,
                    message: "Token is invalid",
                    statusCode: 401
                  }
                },
                expiredToken: {
                  summary: "Expired token",
                  value: {
                    success: false,
                    message: "Token has expired",
                    statusCode: 401
                  }
                },
                blacklistedToken: {
                  summary: "Blacklisted token",
                  value: {
                    success: false,
                    message: "Token has been invalidated",
                    statusCode: 401
                  }
                }
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
  "/auth/forgot-password": {
    post: {
      tags: ["Authentication"],
      summary: "Request password reset",
      description: "Sends a password reset email to the user if the email exists in the system. For security reasons, always returns success even if the email is not registered.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email"],
              properties: {
                email: {
                  type: "string",
                  format: "email",
                  example: "user@example.com",
                  description: "Email address of the account to reset password for"
                }
              }
            },
            example: {
              email: "user@example.com"
            }
          },
        },
      },
      responses: {
        200: {
          description: "Password reset email sent (or would be sent if email exists)",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { 
                    type: "string", 
                    example: "If a user with that email exists, a password reset link has been sent" 
                  }
                }
              }
            },
          },
        },
        400: {
          description: "Validation error",
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
        429: {
          description: "Too Many Requests - Rate limit exceeded",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Too Many Requests",
                error: ["Too many password reset attempts. Try again later."],
                errorCode: "RATE_LIMIT_ERROR",
                statusCode: 429
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
  "/auth/reset-password": {
    post: {
      tags: ["Authentication"],
      summary: "Reset password with token",
      description: "Resets a user's password using a valid reset token received via email. The token must not be expired.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["token", "password", "confirmPassword"],
              properties: {
                token: {
                  type: "string",
                  example: "f30625ac5f6f98c8ddbc69b340426fb81426ddc4e62324e0091cb1e1287ab0fe",
                  description: "Reset token received via email"
                },
                password: {
                  type: "string",
                  format: "password",
                  example: "NewSecurePass123!",
                  description: "New password that meets complexity requirements"
                },
                confirmPassword: {
                  type: "string",
                  format: "password",
                  example: "NewSecurePass123!",
                  description: "Confirmation of new password (must match password)"
                }
              }
            },
            example: {
              token: "f30625ac5f6f98c8ddbc69b340426fb81426ddc4e62324e0091cb1e1287ab0fe",
              password: "NewSecurePass123!",
              confirmPassword: "NewSecurePass123!"
            }
          },
        },
      },
      responses: {
        200: {
          description: "Password reset successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Password has been reset successfully. Please login with your new password." }
                }
              }
            },
          },
        },
        400: {
          description: "Validation error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              examples: {
                passwordValidation: {
                  summary: "Password validation failed",
                  value: {
                    success: false,
                    message: "Validation failed",
                    error: ["Password must be 8-50 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character"],
                    errorCode: "VALIDATION_ERROR",
                    statusCode: 400
                  }
                },
                passwordsDoNotMatch: {
                  summary: "Passwords don't match",
                  value: {
                    success: false,
                    message: "Validation failed",
                    error: ["Passwords do not match"],
                    errorCode: "VALIDATION_ERROR",
                    statusCode: 400
                  }
                }
              }
            }
          }
        },
        401: {
          description: "Invalid or expired reset token",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Authentication failed",
                error: ["Password reset token is invalid or has expired"],
                errorCode: "AUTH_ERROR",
                statusCode: 401
              }
            }
          }
        },
        429: {
          description: "Too Many Requests - Rate limit exceeded",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Too Many Requests",
                error: ["Too many password reset attempts. Try again later."],
                errorCode: "RATE_LIMIT_ERROR",
                statusCode: 429
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
  "/auth/debug/{email}": {
    get: {
      tags: ["Authentication"],
      summary: "Debug user status (DEV ONLY)",
      description: "Returns detailed user status for debugging purposes. Only available in non-production environments. Requires ADMIN role.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "email",
          in: "path",
          required: true,
          schema: {
            type: "string",
            format: "email"
          },
          description: "Email address of the user to debug"
        }
      ],
      responses: {
        200: {
          description: "User status retrieved",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "User status retrieved" },
                  data: {
                    type: "object",
                    properties: {
                      userID: { type: "string", example: "USR-00001" },
                      username: { type: "string", example: "johnsmith" },
                      email: { type: "string", example: "user@example.com" },
                      isActive: { type: "boolean", example: true },
                      isVerified: { type: "boolean", example: true },
                      tokenVersion: { type: "number", example: 7 },
                      failedLoginAttempts: { type: "number", example: 0 },
                      isLocked: { type: "boolean", example: false },
                      passwordHash: { type: "string", example: "$2b$10$XuaE..." }
                    }
                  }
                }
              }
            },
          },
        },
        401: {
          description: "Not authenticated",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Authentication failed",
                error: ["Authentication required"],
                errorCode: "AUTH_ERROR",
                statusCode: 401
              }
            }
          }
        },
        403: {
          description: "Not authorized - Admin role required",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Forbidden",
                error: ["Admin access required"],
                errorCode: "FORBIDDEN_ERROR",
                statusCode: 403
              }
            }
          }
        },
        404: {
          description: "User not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Not found",
                error: ["User not found"],
                errorCode: "NOT_FOUND_ERROR",
                statusCode: 404
              }
            }
          }
        },
        500: { 
          $ref: "#/components/responses/ServerError",
          description: "An unexpected error occurred on the server"
        }
      }
    }
  },
  "/auth/github": {
    get: {
      tags: ["Authentication"],
      summary: "GitHub OAuth login",
      description: "Initiates GitHub OAuth authentication flow. Redirects the user to GitHub's authorization page.",
      parameters: [],
      responses: {
        302: {
          description: "Redirects to GitHub authorization page",
          headers: {
            Location: {
              schema: {
                type: "string"
              },
              description: "URL to GitHub's authorization page"
            }
          }
        },
        500: {
          description: "OAuth initialization error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Server Error",
                error: ["Failed to initialize OAuth flow"],
                errorCode: "SERVER_ERROR",
                statusCode: 500
              }
            }
          }
        }
      }
    }
  },
  "/auth/github/callback": {
    get: {
      tags: ["Authentication"],
      summary: "GitHub OAuth callback",
      description: "Callback endpoint that handles the GitHub OAuth response. Creates or authenticates a user based on their GitHub profile.",
      parameters: [
        {
          name: "code",
          in: "query",
          schema: {
            type: "string"
          },
          description: "Authorization code from GitHub"
        },
        {
          name: "state",
          in: "query",
          schema: {
            type: "string"
          },
          description: "State parameter for CSRF protection"
        }
      ],
      responses: {
        302: {
          description: "Redirects to dashboard on success, login page on failure",
          headers: {
            Location: {
              schema: {
                type: "string"
              },
              description: "URL to redirect to after authentication"
            }
          }
        },
        400: {
          description: "OAuth error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              examples: {
                authCodeMissing: {
                  summary: "Authorization code missing",
                  value: {
                    success: false,
                    message: "OAuth Error",
                    error: ["GitHub authorization code missing or invalid"],
                    errorCode: "AUTH_ERROR",
                    statusCode: 400
                  }
                },
                stateMismatch: {
                  summary: "State parameter mismatch",
                  value: {
                    success: false,
                    message: "OAuth Error",
                    error: ["Invalid state parameter"],
                    errorCode: "AUTH_ERROR",
                    statusCode: 400
                  }
                }
              }
            }
          }
        },
        401: {
          description: "OAuth authentication failed",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Authentication failed",
                error: ["Failed to authenticate with GitHub"],
                errorCode: "AUTH_ERROR",
                statusCode: 401
              }
            }
          }
        },
        500: { 
          $ref: "#/components/responses/ServerError",
          description: "An unexpected error occurred while processing the OAuth callback"
        }
      }
    }
  }
};
