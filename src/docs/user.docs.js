module.exports = {
  '/users/profile': {
    get: {
      tags: ['Users'],
      summary: 'Get current user profile',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'User profile retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Success'
              }
            }
          }
        },
        401: { $ref: '#/components/responses/UnauthorizedError' },
        500: { $ref: '#/components/responses/ServerError' }
      }
    },
    put: {
      tags: ['Users'],
      summary: 'Update user profile',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/User'
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Profile updated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Success'
              }
            }
          }
        },
        401: { $ref: '#/components/responses/UnauthorizedError' },
        400: { $ref: '#/components/responses/ValidationError' },
        409: {
          description: 'Duplicate entry error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        500: { $ref: '#/components/responses/ServerError' }
      }
    }
  },
  '/users/{userID}': {
    get: {
      tags: ['Users'],
      summary: 'Get user by ID',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'userID',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            pattern: '^SM-\\d{5}$'
          },
          description: 'User ID in SM-XXXXX format'
        }
      ],
      responses: {
        200: {
          description: 'User retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Success'
              }
            }
          }
        },
        404: { $ref: '#/components/responses/NotFoundError' },
        401: { $ref: '#/components/responses/UnauthorizedError' },
        400: { 
          description: 'Invalid user ID format',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        500: { $ref: '#/components/responses/ServerError' }
      }
    }
  },
  '/users/email/{email}': {
    get: {
      tags: ['Users'],
      summary: 'Get user by email',
      security: [{ bearerAuth: [] }],
      parameters: [{
        name: 'email',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
          format: 'email'
        }
      }],
      responses: {
        200: {
          description: 'User found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Success' }
            }
          }
        },
        404: { $ref: '#/components/responses/NotFoundError' },
        401: { $ref: '#/components/responses/UnauthorizedError' }
      }
    }
  },
  '/users/username/{username}': {
    get: {
      tags: ['Users'],
      summary: 'Get user by username',
      security: [{ bearerAuth: [] }],
      parameters: [{
        name: 'username',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
          pattern: '^[a-zA-Z0-9_]+$'
        }
      }],
      responses: {
        200: {
          description: 'User found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Success' }
            }
          }
        },
        404: { $ref: '#/components/responses/NotFoundError' },
        401: { $ref: '#/components/responses/UnauthorizedError' }
      }
    }
  },
  '/users/role/{role}': {
    get: {
      tags: ['Users'],
      summary: 'Get users by role',
      security: [{ bearerAuth: [] }],
      parameters: [{
        name: 'role',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
          enum: ['SUPERADMIN', 'ADMIN', 'USER', 'ORG']
        }
      }],
      responses: {
        200: {
          description: 'Users found',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/User' }
              }
            }
          }
        },
        401: { $ref: '#/components/responses/UnauthorizedError' },
        404: { $ref: '#/components/responses/NotFoundError' }
      }
    }
  },
  '/users': {
    get: {
      tags: ['Users'],
      summary: 'Get all users',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'List of all users retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/User' }
              }
            }
          }
        },
        401: { $ref: '#/components/responses/UnauthorizedError' }
      }
    },
    delete: {
      tags: ['Users'],
      summary: 'Delete all users',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'All users deleted successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Success' }
            }
          }
        },
        401: { $ref: '#/components/responses/UnauthorizedError' },
        403: {
          description: 'Only SUPERADMIN can delete all users',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
  '/users/{_id}': {
    put: {
      tags: ['Users'],
      summary: 'Update user by MongoDB ID',
      security: [{ bearerAuth: [] }],
      parameters: [{
        name: '_id',
        in: 'path',
        required: true,
        schema: {
          type: 'string'
        },
        description: 'MongoDB ID of the user'
      }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/User' }
          }
        }
      },
      responses: {
        200: {
          description: 'User updated successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Success' }
            }
          }
        },
        400: { $ref: '#/components/responses/ValidationError' },
        401: { $ref: '#/components/responses/UnauthorizedError' },
        404: { $ref: '#/components/responses/NotFoundError' }
      }
    },
    delete: {
      tags: ['Users'],
      summary: 'Delete user by MongoDB ID',
      security: [{ bearerAuth: [] }],
      parameters: [{
        name: '_id',
        in: 'path',
        required: true,
        schema: {
          type: 'string'
        },
        description: 'MongoDB ID of the user'
      }],
      responses: {
        200: {
          description: 'User deleted successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Success' }
            }
          }
        },
        401: { $ref: '#/components/responses/UnauthorizedError' },
        404: { $ref: '#/components/responses/NotFoundError' }
      }
    }
  }
};
