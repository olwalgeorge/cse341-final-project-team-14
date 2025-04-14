// src/middlewares/validation.middleware.js

const { validationResult } = require("express-validator");
const logger = require("../utils/logger.js");
const { ValidationError } = require("../utils/errors");

const validate = (validations) => {
  return async (req, res, next) => {
    try {
      // Run validations
      await Promise.all(validations.map((v) => v.run(req)));

      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }

      logger.warn("Validation failed", {
        path: req.path,
        method: req.method,
        errors: errors.array()
      });

      // Convert express-validator errors to our format
      const validationErrors = errors.array().map(err => ({
        field: err.path,
        value: err.value,
        constraint: err.msg
      }));
      
      // Create ValidationError with multiple errors
      const validationError = ValidationError.withErrors(validationErrors);
      
      // Pass the error to the error handling middleware
      return next(validationError);
    } catch (err) {
      logger.error("Unexpected error in validation middleware", err);
      next(err);
    }
  };
};

module.exports = validate;
