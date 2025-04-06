const { check } = require('express-validator');
const mongoose = require('mongoose');

const customerIDValidationRules = () => {
    return [
        check("customerID")
            .matches(/^CU-\d{5}$/)
            .withMessage("Invalid customer ID format. Must be CU-XXXXX where X is a digit")
    ];
};

const customer_IdValidationRules = () => {
    return [
        check("_id")
            .custom(value => mongoose.Types.ObjectId.isValid(value))
            .withMessage("Invalid MongoDB ID format")
    ];
};

const emailValidationRules = () => {
    return [
        check("email")
            .isEmail()
            .withMessage("Invalid email format")
    ];
};

const customerCreateValidationRules = () => {
    return [
        check("name")
            .trim()
            .notEmpty()
            .withMessage("Customer name is required")
            .isLength({ max: 100 })
            .withMessage("Customer name cannot exceed 100 characters"),
        check("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Invalid email format"),
        check("phone")
            .optional()
            .matches(/^[0-9]{10,15}$/)
            .withMessage("Please enter a valid phone number"),
        check("address.street")
            .optional()
            .trim()
            .isLength({ max: 100 })
            .withMessage("Street cannot exceed 100 characters"),
        check("address.city")
            .optional()
            .trim()
            .isLength({ max: 50 })
            .withMessage("City name cannot exceed 50 characters"),
        check("address.state")
            .optional()
            .trim()
            .isLength({ max: 50 })
            .withMessage("State name cannot exceed 50 characters"),
        check("address.postalCode")
            .optional()
            .trim()
            .isLength({ max: 20 })
            .withMessage("Postal code cannot exceed 20 characters"),
        check("address.country")
            .optional()
            .trim()
            .isLength({ max: 50 })
            .withMessage("Country name cannot exceed 50 characters")
    ];
};

const customerUpdateValidationRules = () => {
    return [
        check("name")
            .optional()
            .trim()
            .notEmpty()
            .withMessage("Customer name cannot be empty")
            .isLength({ max: 100 })
            .withMessage("Customer name cannot exceed 100 characters"),
        check("email")
            .optional()
            .trim()
            .notEmpty()
            .withMessage("Email cannot be empty")
            .isEmail()
            .withMessage("Invalid email format"),
        check("phone")
            .optional()
            .matches(/^[0-9]{10,15}$/)
            .withMessage("Please enter a valid phone number")
    ];
};

module.exports = {
    customerIDValidationRules,
    customer_IdValidationRules,
    emailValidationRules,
    customerCreateValidationRules,
    customerUpdateValidationRules
};
