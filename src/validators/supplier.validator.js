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

module.exports = {
    supplierIDValidationRules,
    supplier_IdValidationRules,
    supplierCreateValidationRules
};
