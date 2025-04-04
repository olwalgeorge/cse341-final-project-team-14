class ValidationError extends Error {
    constructor(message, errors = [], code = 'VALIDATION_ERROR', statusCode = 400) {
        super(message);
        this.name = 'ValidationError';
        this.code = code;
        this.statusCode = statusCode;
        this.errors = errors;
    }

    static get ERROR_TYPES() {
        return {
            INVALID_INPUT: 'INVALID_INPUT',
            MISSING_FIELD: 'MISSING_FIELD',
            INVALID_FORMAT: 'INVALID_FORMAT',
            CONSTRAINT_ERROR: 'CONSTRAINT_ERROR'
        };
    }

    static invalidInput(field, message) {
        return new ValidationError(
            message || `Invalid input for field: ${field}`,
            [{ field, message }],
            ValidationError.ERROR_TYPES.INVALID_INPUT
        );
    }

    static missingField(field) {
        return new ValidationError(
            `Missing required field: ${field}`,
            [{ field, message: 'This field is required' }],
            ValidationError.ERROR_TYPES.MISSING_FIELD
        );
    }

    static invalidFormat(field, format) {
        return new ValidationError(
            `Invalid format for ${field}, expected ${format}`,
            [{ field, message: `Must be in ${format} format` }],
            ValidationError.ERROR_TYPES.INVALID_FORMAT
        );
    }
}

module.exports = ValidationError;
