// middleware/error.middleware.js

const logger = require("../utils/logger.js");
const sendResponse = require("../utils/response.js");

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    // Basic error details
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    let errorDetails = null;

    // Handle common error types
    switch (err.name) {
        case "ValidationError":
            statusCode = 400;
            message = "Validation Error";
            errorDetails = Object.values(err.errors).map(e => e.message);
            break;

        case "CastError":
            statusCode = 400;
            message = "Invalid ID Format";
            break;

        case "MongoError":
        case "MongoServerError":
            if (err.code === 11000) {
                statusCode = 409;
                message = "Duplicate Entry";
            }
            break;

        case "AuthError":
            statusCode = err.statusCode || 401;
            message = err.message;
            errorDetails = {
                code: err.code,
                type: 'Authentication',
                reason: getAuthErrorReason(err.code)
            };
            break;

        case "TokenExpiredError":
            statusCode = 401;
            message = "Token expired";
            errorDetails = {
                code: 'TOKEN_EXPIRED',
                type: 'Authentication'
            };
            break;

        case "JsonWebTokenError":
            statusCode = 401;
            message = "Invalid token";
            errorDetails = {
                code: 'INVALID_TOKEN',
                type: 'Authentication'
            };
            break;
    }

    // Add authentication context to logs if present
    const logContext = {
        error: err.stack,
        user: req.user?._id,
        body: req.body,
        authError: err.name === 'AuthError' ? err.code : undefined
    };

    // Log error
    logger.error(`${message} - ${req.method} ${req.url}`, logContext);

    // Send response
    sendResponse(res, statusCode, message, null, errorDetails);
};

function getAuthErrorReason(code) {
    switch (code) {
        case 'INVALID_CREDENTIALS': return 'Invalid email or password';
        case 'LOGIN_ERROR': return 'Login service temporarily unavailable';
        case 'MAX_ATTEMPTS': return 'Too many failed attempts';
        default: return 'Authentication failed';
    }
}

module.exports = errorHandler;