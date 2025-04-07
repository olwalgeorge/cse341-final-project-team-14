const { check, param } = require("express-validator");

const isMongoIdParam = (paramName, errorMessage) => {
    return param(paramName, errorMessage).isMongoId();
};

const supplierIDValidationRules = () => {
    return [
        param("supplierID", "Supplier ID should be in the format SP-xxxxx")
            .matches(/^SP-\d{5}$/)
    ];
};

const supplier_IdValidationRules = () => {
    return [isMongoIdParam("_id", "Invalid Supplier ID format")];
};

const supplierCreateValidationRules = () => {
    return [
        check("name")
            .trim()
            .notEmpty()
            .withMessage("Supplier name is required")
            .isLength({ max: 100 })
            .withMessage("Supplier name cannot exceed 100 characters"),
        check("contact.phone")
            .matches(/^[0-9]{10,15}$/)
            .withMessage("Please enter a valid phone number"),
        check("contact.email")
            .isEmail()
            .withMessage("Please enter a valid email"),
        check("address.street")
            .trim()
            .notEmpty()
            .withMessage("Street address is required"),
        check("address.city")
            .trim()
            .notEmpty()
            .withMessage("City is required"),
        check("address.state")
            .trim()
            .notEmpty()
            .withMessage("State is required"),
        check("address.postalCode")
            .trim()
            .notEmpty()
            .withMessage("Postal code is required"),
        check("address.country")
            .trim()
            .notEmpty()
            .withMessage("Country is required")
    ];
};

const supplierUpdateValidationRules = () => {
    return [
        check("name")
            .optional()
            .trim()
            .notEmpty()
            .withMessage("Supplier name cannot be empty")
            .isLength({ max: 100 })
            .withMessage("Supplier name cannot exceed 100 characters"),
        check("contact")
            .optional()
            .isObject()
            .withMessage("Contact should be an object"),
        check("contact.name")
            .optional()
            .trim()
            .notEmpty()
            .withMessage("Contact name cannot be empty"),
        check("contact.email")
            .optional()
            .isEmail()
            .withMessage("Invalid email format"),
        check("contact.phone")
            .optional()
            .matches(/^[0-9+\-\s()]{10,15}$/)
            .withMessage("Invalid phone number"),
        check("address")
            .optional()
            .isObject()
            .withMessage("Address should be an object"),
        check("address.street")
            .optional()
            .trim()
            .notEmpty()
            .withMessage("Street address cannot be empty"),
        check("address.city")
            .optional()
            .trim()
            .notEmpty()
            .withMessage("City cannot be empty"),
        check("address.state")
            .optional()
            .trim()
            .notEmpty()
            .withMessage("State cannot be empty"),
        check("address.postalCode")
            .optional()
            .trim()
            .notEmpty()
            .withMessage("Postal code cannot be empty"),
        check("address.country")
            .optional()
            .trim()
            .notEmpty()
            .withMessage("Country cannot be empty")
    ];
};

module.exports = {
    supplierIDValidationRules,
    supplier_IdValidationRules,
    supplierCreateValidationRules,
    supplierUpdateValidationRules
};
