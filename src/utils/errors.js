/**
 * Base API Error class that all other errors extend
 */
class ApiError extends Error {
  constructor(message = 'API Error', statusCode = 500) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = {};
    this.source = 'api';
  }
}

/**
 * Authentication Error
 * Used for login failures, session issues, etc.
 */
class AuthError extends ApiError {
  constructor(message = 'Authentication failed', details = {}) {
    super(message, 401);
    this.name = 'AuthError';
    this.details = details;
    this.source = 'authentication';
  }

  static invalidCredentials(message = 'Invalid credentials') {
    return new AuthError(message, { reason: 'invalidCredentials' });
  }

  static loginError(message = 'Login failed') {
    return new AuthError(message, { reason: 'loginFailed' });
  }

  static sessionExpired(message = 'Session expired') {
    return new AuthError(message, { reason: 'sessionExpired' });
  }
  
  static unauthorized(message = 'Unauthorized access') {
    return new AuthError(message, { reason: 'unauthorized' });
  }
}

/**
 * Authorization Error
 * Used for permission and access control issues
 */
class AuthorizationError extends ApiError {
  constructor(message = 'Not authorized', details = {}) {
    super(message, 403);
    this.name = 'AuthorizationError';
    this.details = details;
    this.source = 'authorization';
  }

  static forbidden(resource, action) {
    return new AuthorizationError(`You don't have permission to ${action} this ${resource}`, {
      resource,
      action,
      reason: 'forbidden'
    });
  }
}

/**
 * Validation Error
 * Used for input validation failures
 */
class ValidationError extends ApiError {
  constructor(field, value, message = 'Validation failed') {
    super(message, 400);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
    this.constraint = message;
    this.source = 'validation';
  }

  static withErrors(errors) {
    const error = new ValidationError('multiple', null, 'Multiple validation errors');
    error.errors = errors;
    return error;
  }
}

/**
 * Database Error
 * Used for database operation failures
 */
class DatabaseError extends ApiError {
  constructor(operation, entity, message = 'Database operation failed', code = 'ERROR') {
    super(message, 500);
    this.name = 'DatabaseError';
    this.operation = operation;
    this.entity = entity;
    this.code = code;
    this.source = 'database';
    
    // Set status code based on operation type
    if (operation === 'notFound') {
      this.statusCode = 404;
    } else if (['create', 'duplicate'].includes(operation)) {
      this.statusCode = 400;
    } else if (operation === 'conflict') {
      this.statusCode = 409;
    }
  }

  static notFound(entity, id) {
    const message = id ? `${entity} with id ${id} not found` : `${entity} not found`;
    return new DatabaseError('notFound', entity, message, 'NOT_FOUND');
  }
  
  static duplicate(entity, field, value) {
    return new DatabaseError(
      'duplicate', 
      entity, 
      `A ${entity} with this ${field} already exists: ${value}`,
      'DUPLICATE'
    );
  }
}

module.exports = {
  ApiError,
  AuthError,
  AuthorizationError,
  ValidationError,
  DatabaseError
};
