// src/middlewares/validation.middleware.js

const { validationResult } = require("express-validator");
const sendResponse = require("../utils/response.js");
const logger = require("../utils/logger.js");

const validate = (validations) => {
    return async (req, res, next) => {
        try {
            // Run validations
            await Promise.all(validations.map(v => v.run(req)));
            
            const errors = validationResult(req);
            if (errors.isEmpty()) {
                return next();
            }

            // Get validation errors
            const errorMessages = errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }));

            logger.warn('Validation failed', { 
                path: req.path, 
                errors: errorMessages 
            });

            sendResponse(res, 400, "Validation failed", null, errorMessages);
        } catch (err) {
            next(err);
        }
    };
};

module.exports = validate;
