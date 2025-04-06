const { check } = require('express-validator');
const mongoose = require('mongoose');

const orderIDValidationRules = () => {
    return [
        check("orderID")
            .matches(/^OR-\d{5}$/)
            .withMessage("Invalid order ID format. Must be OR-XXXXX where X is a digit")
    ];
};

const order_IdValidationRules = () => {
    return [
        check("_id")
            .custom(value => mongoose.Types.ObjectId.isValid(value))
            .withMessage("Invalid MongoDB ID format")
    ];
};

const customerIdValidationRules = () => {
    return [
        check("customerId")
            .custom(value => mongoose.Types.ObjectId.isValid(value))
            .withMessage("Invalid customer ID format")
    ];
};

const orderStatusValidationRules = () => {
    return [
        check("status")
            .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
            .withMessage("Invalid order status")
    ];
};

const orderCreateValidationRules = () => {
    return [
        check("customer")
            .notEmpty()
            .withMessage("Customer ID is required")
            .custom(value => mongoose.Types.ObjectId.isValid(value))
            .withMessage("Invalid customer ID format"),
        check("items")
            .isArray({ min: 1 })
            .withMessage("At least one item is required"),
        check("items.*.product")
            .notEmpty()
            .withMessage("Product ID is required")
            .custom(value => mongoose.Types.ObjectId.isValid(value))
            .withMessage("Invalid product ID format"),
        check("items.*.quantity")
            .isInt({ min: 1 })
            .withMessage("Quantity must be at least 1"),
        check("shippingAddress.street")
            .notEmpty()
            .withMessage("Shipping street is required"),
        check("shippingAddress.city")
            .notEmpty()
            .withMessage("Shipping city is required"),
        check("shippingAddress.state")
            .notEmpty()
            .withMessage("Shipping state is required"),
        check("shippingAddress.postalCode")
            .notEmpty()
            .withMessage("Shipping postal code is required"),
        check("shippingAddress.country")
            .notEmpty()
            .withMessage("Shipping country is required"),
        check("status")
            .optional()
            .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
            .withMessage("Invalid order status")
    ];
};

const orderUpdateValidationRules = () => {
    return [
        check("items")
            .optional()
            .isArray()
            .withMessage("Items must be an array"),
        check("items.*.product")
            .optional()
            .custom(value => mongoose.Types.ObjectId.isValid(value))
            .withMessage("Invalid product ID format"),
        check("items.*.quantity")
            .optional()
            .isInt({ min: 1 })
            .withMessage("Quantity must be at least 1"),
        check("status")
            .optional()
            .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
            .withMessage("Invalid order status")
    ];
};

module.exports = {
    orderIDValidationRules,
    order_IdValidationRules,
    orderCreateValidationRules,
    orderUpdateValidationRules,
    customerIdValidationRules,
    orderStatusValidationRules
};
