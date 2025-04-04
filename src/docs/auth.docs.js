module.exports = {
  '/auth/register': {
    post: {
      tags: ['Authentication'],
      summary: 'Register new user',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password', 'username', 'fullName'],
              properties: {
                email: { type: 'string', format: 'email' },
                password: { type: 'string', format: 'password' },
                username: { type: 'string' },
                fullName: { type: 'string' }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'User registered successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Success' }
            }
          }
        },
        400: { $ref: '#/components/responses/ValidationError' },
        409: { 
          description: 'Duplicate entry',
          content: {
            'application/json': {
              schema: { 
                allOf: [
                  { $ref: '#/components/schemas/Error' },
                  { 
                    properties: {
                      error: {
                        example: ['Email already exists', 'Username already taken']
                      }
                    }
                  }
                ]
              }
            }
          }
        },
        500: { $ref: '#/components/responses/ServerError' }
      }
    }
  },
  '/auth/login': {
    post: {
      tags: ['Authentication'],
      summary: 'Login user',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: { type: 'string', format: 'email' },
                password: { type: 'string', format: 'password' }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Login successful',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Success' }
            }
          }
        },
        401: { $ref: '#/components/responses/UnauthorizedError' },
        500: { $ref: '#/components/responses/ServerError' }
      }
    }
  },
  '/auth/logout': {
    post: {
      tags: ['Authentication'],
      summary: 'Logout user',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Logged out successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Success' }
            }
          }
        },
        401: { $ref: '#/components/responses/UnauthorizedError' }
      }
    }
  },
  '/auth/github': {
    get: {
      tags: ['Authentication'],
      summary: 'GitHub OAuth login',
      description: 'Initiates GitHub OAuth flow',
      responses: {
        302: {
          description: 'Redirects to GitHub authorization'
        }
      }
    }
  },
  '/auth/github/callback': {
    get: {
      tags: ['Authentication'],
      summary: 'GitHub OAuth callback',
      responses: {
        302: {
          description: 'Redirects to dashboard on success, login page on failure'
        },
        400: {
          description: 'OAuth error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        500: { $ref: '#/components/responses/ServerError' }
      }
    }
  }
};
