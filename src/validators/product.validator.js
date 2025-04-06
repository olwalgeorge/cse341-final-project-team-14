const { check, param } = require("express-validator");

const isMongoIdParam = (paramName, errorMessage) => {
    return param(paramName, errorMessage).isMongoId();
};

const productIDValidationRules = () => {
    return [
        param("productID", "Product ID should be in the format PR-xxxxx")
            .matches(/^PR-\d{5}$/)
    ];
};

const product_IdValidationRules = () => {
    return [isMongoIdParam("_id", "Invalid Product ID format")];
};

const productCreateValidationRules = () => {
    return [
        check("name")
            .trim()
            .notEmpty()
            .withMessage("Product name is required")
            .isLength({ max: 100 })
            .withMessage("Product name cannot exceed 100 characters"),
        check("price")
            .isFloat({ min: 0 })
            .withMessage("Price must be a positive number"),
        check("quantity")
            .isInt({ min: 0 })
            .withMessage("Quantity must be a non-negative integer"),
        check("category")
            .isIn(['Electronics', 'Clothing', 'Food', 'Furniture', 'Other'])
            .withMessage("Invalid category"),
        check("supplier")
            .isMongoId()
            .withMessage("Invalid supplier ID"),
        check("sku")
            .matches(/^[A-Z0-9]{6,12}$/)
            .withMessage("SKU must be 6-12 alphanumeric characters")
    ];
};

module.exports = {
    productIDValidationRules,
    product_IdValidationRules,
    productCreateValidationRules
};
