const { createLogger } = require('../utils/logger');
const logger = createLogger('ErrorMiddleware');
const { ValidationError, DatabaseError, AuthError, ApiError } = require('../utils/errors');
const mongoose = require('mongoose');

/**
 * Central error handling middleware
 * Maps different errors to appropriate responses with detailed information
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let errorType = err.name || 'Error';
  let errorMessage = err.message || 'Internal Server Error';
  let errorDetails = {};
  let errorSource = err.source || 'server';

  // Log the error for debugging
  logger.error(`Error caught in middleware: ${errorType} - ${errorMessage}`, {
    path: req.path,
    method: req.method,
    error: err.stack,
    body: req.body
  });

  // Handle specific error types
  if (err instanceof ValidationError) {
    statusCode = err.statusCode;
    errorType = 'ValidationError';
    errorSource = 'validation';
    
    // Check if there are multiple validation errors
    if (err.errors && err.errors.length > 0) {
      // Use detailed error format for multiple errors
      errorDetails = {
        errors: err.errors.map(e => ({
          field: e.field,
          value: e.value,
          constraint: e.constraint
        }))
      };
    } else {
      // Use simple format for single error
      errorDetails = {
        field: err.field,
        value: err.value,
        constraint: err.constraint
      };
    }
  } 
  else if (err instanceof DatabaseError) {
    statusCode = err.statusCode;
    errorType = 'DatabaseError';
    errorSource = 'database';
    errorDetails = {
      entity: err.entity,
      operation: err.operation,
      code: err.code
    };
  }
  else if (err instanceof AuthError) {
    statusCode = err.statusCode;
    errorType = 'AuthError';
    errorSource = 'authentication';
    errorDetails = err.details || {};
  }
  else if (err instanceof ApiError) {
    statusCode = err.statusCode;
    errorType = 'ApiError';
    errorSource = 'api';
    errorDetails = err.details || {};
  }
  // Handle Express Validator errors
  else if (err.array && typeof err.array === 'function') {
    statusCode = 400;
    errorType = 'ExpressValidationError';
    errorSource = 'validation';
    errorMessage = 'Validation failed';
    
    errorDetails = err.array().map(e => ({
      field: e.path,
      value: e.value,
      message: e.msg
    }));
  }
  // Handle Mongoose validation errors
  else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    errorType = 'MongooseValidationError';
    errorSource = 'database';
    errorDetails = {};
    
    // Extract validation error details from all fields
    Object.keys(err.errors).forEach(key => {
      errorDetails[key] = {
        message: err.errors[key].message,
        value: err.errors[key].value,
        kind: err.errors[key].kind
      };
    });
  }
  // Handle Mongoose cast errors (like invalid ObjectId)
  else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    errorType = 'CastError';
    errorSource = 'database';
    errorDetails = {
      field: err.path,
      value: err.value,
      kind: err.kind
    };
  }
  // Handle MongoDB server errors
  else if (err.name === 'MongoServerError') {
    statusCode = 500;
    errorType = 'MongoServerError';
    errorSource = 'database';
    
    // Handle duplicate key errors specifically
    if (err.code === 11000) {
      statusCode = 409;
      errorMessage = 'Duplicate key error';
      errorDetails = {
        keyPattern: err.keyPattern,
        keyValue: err.keyValue
      };
    } else {
      errorDetails = {
        code: err.code,
        codeName: err.codeName
      };
    }
  }
  // Enhanced syntax error handling
  else if (err instanceof SyntaxError) {
    statusCode = 400;
    errorType = 'SyntaxError';
    errorSource = 'request';
    
    // Handle JSON parsing errors
    if (err.status === 400 && 'body' in err) {
      errorMessage = 'Invalid JSON payload';
      errorDetails = {
        body: err.body
      };
    } 
    // Handle other syntax errors in JavaScript code
    else {
      errorMessage = 'Syntax error in request or server code';
      errorDetails = {
        message: err.message,
        lineNumber: err.lineNumber,
        columnNumber: err.columnNumber,
        fileName: err.fileName,
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
      };
    }
  }
  // Node.js system errors
  else if (err.code && typeof err.code === 'string' && err.syscall) {
    statusCode = 500;
    errorType = 'SystemError';
    errorSource = 'system';
    errorMessage = `System error: ${err.syscall} failed`;
    errorDetails = {
      code: err.code,
      syscall: err.syscall,
      address: err.address,
      port: err.port
    };
  }
  // General application errors
  else if (err instanceof Error) {
    statusCode = err.statusCode || 500;
    errorType = err.constructor.name;
    errorSource = 'application';
    errorDetails = {
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    };
  }

  // Respond with the error information
  res.status(statusCode).json({
    success: false,
    error: {
      type: errorType,
      message: errorMessage,
      source: errorSource,
      details: errorDetails,
      path: req.path,
      timestamp: new Date().toISOString()
    }
  });
};

module.exports = errorHandler;
