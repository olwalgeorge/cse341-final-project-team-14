const { check, param } = require("express-validator");

const isMongoIdParam = (paramName, errorMessage) => {
    return param(paramName, errorMessage).isMongoId();
};

const orderIDValidationRules = () => {
    return [
        param("orderID", "Order ID should be in the format OR-xxxxx")
            .matches(/^OR-\d{5}$/)
    ];
};

const order_IdValidationRules = () => {
    return [isMongoIdParam("_id", "Invalid Order ID format")];
};

const orderCreateValidationRules = () => {
    return [
        check("products")
            .isArray()
            .withMessage("Products must be an array")
            .notEmpty()
            .withMessage("At least one product is required"),
        check("products.*.product")
            .isMongoId()
            .withMessage("Invalid product ID"),
        check("products.*.quantity")
            .isInt({ min: 1 })
            .withMessage("Quantity must be at least 1"),
        check("status")
            .isIn(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'])
            .withMessage("Invalid order status"),
        check("shippingAddress")
            .isObject()
            .withMessage("Shipping address is required"),
        check("shippingAddress.street")
            .notEmpty()
            .withMessage("Street is required"),
        check("shippingAddress.city")
            .notEmpty()
            .withMessage("City is required"),
        check("shippingAddress.state")
            .notEmpty()
            .withMessage("State is required"),
        check("shippingAddress.postalCode")
            .notEmpty()
            .withMessage("Postal code is required"),
        check("shippingAddress.country")
            .notEmpty()
            .withMessage("Country is required"),
        check("customer.name")
            .notEmpty()
            .withMessage("Customer name is required"),
        check("customer.email")
            .isEmail()
            .withMessage("Invalid customer email"),
        check("customer.phone")
            .notEmpty()
            .withMessage("Customer phone is required")
    ];
};

module.exports = {
    orderIDValidationRules,
    order_IdValidationRules,
    orderCreateValidationRules
};
