/**
 * Custom error classes for consistent error handling throughout the application
 */

/**
 * Base error class extending the native Error
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error for input validation failures
 */
class ValidationError extends AppError {
  constructor(field, value, constraint) {
    super(`Validation failed for field: ${field}`);
    this.statusCode = 400;
    this.field = field;
    this.value = value;
    this.constraint = constraint;
    this.name = 'ValidationError';
  }
}

/**
 * Database error for database operation failures
 */
class DatabaseError extends AppError {
  constructor(operation, entity, id, details = {}) {
    let message = '';
    let code = 500;
    
    switch (operation) {
      case 'notFound':
        message = `${entity} not found`;
        if (id) message += ` with ID: ${id}`;
        code = 404;
        break;
      case 'duplicate':
        message = `${entity} with the same identifier already exists`;
        code = 409;
        break;
      case 'create':
        message = `Failed to create ${entity}`;
        code = 500;
        break;
      case 'update':
        message = `Failed to update ${entity}`;
        code = 500;
        break;
      case 'delete':
        message = `Failed to delete ${entity}`;
        code = 500;
        break;
      case 'queryError':
        message = `Database query error while accessing ${entity}`;
        code = 500;
        break;
      default:
        message = `Database operation failed on ${entity}`;
    }
    
    super(message, code);
    this.entity = entity;
    this.operation = operation;
    this.code = code;
    this.details = details;
    this.name = 'DatabaseError';
  }
  
  static notFound(entity, id = null) {
    return new DatabaseError('notFound', entity, id);
  }
  
  static duplicate(entity, field, value) {
    return new DatabaseError('duplicate', entity, null, { field, value });
  }
  
  static queryError(message) {
    return new DatabaseError('queryError', 'resource', null, { message });
  }
}

/**
 * Authentication error for auth-related failures
 */
class AuthError extends AppError {
  constructor(message, details = {}) {
    super(message, 401);
    this.name = 'AuthError';
    this.details = details;
  }
  
  static unauthorized(message = 'Authentication required') {
    return new AuthError(message);
  }
  
  static forbidden(message = 'Insufficient permissions to access this resource') {
    const error = new AuthError(message);
    error.statusCode = 403;
    return error;
  }
  
  static invalidCredentials() {
    return new AuthError('Invalid email or password');
  }
}

/**
 * API error for general API-related failures
 */
class ApiError extends AppError {
  constructor(message, statusCode = 500, details = {}) {
    super(message, statusCode);
    this.name = 'ApiError';
    this.details = details;
  }
  
  static badRequest(message, details = {}) {
    return new ApiError(message, 400, details);
  }
  
  static notFound(resource) {
    return new ApiError(`${resource} not found`, 404);
  }
  
  static serverError(message = 'Internal server error', details = {}) {
    return new ApiError(message, 500, details);
  }
}

module.exports = {
  AppError,
  ValidationError,
  DatabaseError,
  AuthError,
  ApiError
};
