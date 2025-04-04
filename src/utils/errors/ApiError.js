class ApiError extends Error {
    constructor(message, code = 'API_ERROR', statusCode = 500) {
        super(message);
        this.name = 'ApiError';
        this.code = code;
        this.statusCode = statusCode;
    }

    static get ERROR_TYPES() {
        return {
            BAD_REQUEST: 'BAD_REQUEST',
            FORBIDDEN: 'FORBIDDEN',
            NOT_FOUND: 'NOT_FOUND',
            RATE_LIMIT: 'RATE_LIMIT',
            SERVER_ERROR: 'SERVER_ERROR'
        };
    }

    static badRequest(message) {
        return new ApiError(
            message || 'Bad request',
            ApiError.ERROR_TYPES.BAD_REQUEST,
            400
        );
    }

    static forbidden(message) {
        return new ApiError(
            message || 'Access forbidden',
            ApiError.ERROR_TYPES.FORBIDDEN,
            403
        );
    }

    static notFound(resource) {
        return new ApiError(
            `${resource} not found`,
            ApiError.ERROR_TYPES.NOT_FOUND,
            404
        );
    }

    static rateLimit(message) {
        return new ApiError(
            message || 'Rate limit exceeded',
            ApiError.ERROR_TYPES.RATE_LIMIT,
            429
        );
    }
}

module.exports = ApiError;
