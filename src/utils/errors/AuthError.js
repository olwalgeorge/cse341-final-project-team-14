class AuthError extends Error {
  constructor(message, code = "AUTH_ERROR", statusCode = 401) {
    super(message);
    this.name = "AuthError";
    this.code = code;
    this.statusCode = statusCode;
  }

  static get ERROR_TYPES() {
    return {
      INVALID_EMAIL: "INVALID_EMAIL",
      INVALID_PASSWORD: "INVALID_PASSWORD",
      ACCOUNT_LOCKED: "ACCOUNT_LOCKED",
      AUTH_REQUIRED: "AUTH_REQUIRED",
      INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
      LOGIN_ERROR: "LOGIN_ERROR",
      MAX_ATTEMPTS: "MAX_ATTEMPTS",
    };
  }

  static invalidEmail() {
    return new AuthError(
      "Invalid email address",
      AuthError.ERROR_TYPES.INVALID_EMAIL,
      401
    );
  }

  static invalidPassword() {
    return new AuthError(
      "Invalid password",
      AuthError.ERROR_TYPES.INVALID_PASSWORD,
      401
    );
  }

  static invalidCredentials(message = "Invalid credentials") {
    return new AuthError(
      message,
      AuthError.ERROR_TYPES.INVALID_CREDENTIALS,
      401
    );
  }

  static loginError() {
    return new AuthError(
      "Login failed, please try again later",
      AuthError.ERROR_TYPES.LOGIN_ERROR,
      500
    );
  }

  static maxAttempts() {
    return new AuthError(
      "Too many failed attempts, please try again later",
      AuthError.ERROR_TYPES.MAX_ATTEMPTS,
      429
    );
  }
}

module.exports = AuthError;
