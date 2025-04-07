class DatabaseError extends Error {
  constructor(message, code = "DB_ERROR", statusCode = 500) {
    super(message);
    this.name = "DatabaseError";
    this.code = code;
    this.statusCode = statusCode;
  }

  static get ERROR_TYPES() {
    return {
      CONNECTION_ERROR: "CONNECTION_ERROR",
      QUERY_ERROR: "QUERY_ERROR",
      DUPLICATE_KEY: "DUPLICATE_KEY",
      NOT_FOUND: "NOT_FOUND",
      TRANSACTION_ERROR: "TRANSACTION_ERROR",
    };
  }

  static connectionError(details) {
    return new DatabaseError(
      `Database connection error: ${details}`,
      DatabaseError.ERROR_TYPES.CONNECTION_ERROR
    );
  }

  static queryError(details) {
    return new DatabaseError(
      `Database query error: ${details}`,
      DatabaseError.ERROR_TYPES.QUERY_ERROR
    );
  }

  static duplicateKey(field) {
    return new DatabaseError(
      `Duplicate entry for ${field}`,
      DatabaseError.ERROR_TYPES.DUPLICATE_KEY,
      409
    );
  }

  static notFound(resource) {
    return new DatabaseError(
      `${resource} not found`,
      DatabaseError.ERROR_TYPES.NOT_FOUND,
      404
    );
  }
}

module.exports = DatabaseError;
