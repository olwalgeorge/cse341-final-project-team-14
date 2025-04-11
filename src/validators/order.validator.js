const { check, param, oneOf, body } = require("express-validator");

const orderIDValidationRules = () => {
  return [
    param("orderID", "Order ID should be in the format OR-xxxxx").matches(
      /^OR-\d{5}$/
    ),
  ];
};

const order_IdValidationRules = () => {
  return [
    check("order_Id")
      .isMongoId()
      .withMessage("Invalid MongoDB ID format"),
  ];
};

const customerIdValidationRules = () => {
  return [
    check("customerId")
      .isMongoId()
      .withMessage("Invalid customer ID format"),
  ];
};

const orderStatusValidationRules = () => {
  return [
    check("status")
      .isIn(["pending", "processing", "shipped", "delivered", "cancelled"])
      .withMessage("Invalid order status"),
  ];
};

const orderCreateValidationRules = () => {
  return [
    check("customer")
      .notEmpty()
      .withMessage("Customer ID is required")
      .isMongoId()
      .withMessage("Invalid customer ID format"),
    oneOf([
      // Validate items array format
      [
        check("items")
          .isArray({ min: 1 })
          .withMessage("At least one item is required"),
        check("items.*.product")
          .notEmpty()
          .withMessage("Product ID is required")
          .isMongoId()
          .withMessage("Invalid product ID format"),
        check("items.*.quantity")
          .isInt({ min: 1 })
          .withMessage("Quantity must be at least 1"),
        check("items.*.price")
          .optional()
          .isFloat({ min: 0 })
          .withMessage("Price must be a non-negative number"),
      ],
      // Validate products array format
      [
        check("products")
          .isArray({ min: 1 })
          .withMessage("At least one product is required"),
        check("products.*.product")
          .notEmpty()
          .withMessage("Product ID is required")
          .isMongoId()
          .withMessage("Invalid product ID format"),
        check("products.*.quantity")
          .isInt({ min: 1 })
          .withMessage("Quantity must be at least 1"),
        check("products.*.priceAtOrder")
          .optional()
          .isFloat({ min: 0 })
          .withMessage("Price must be a non-negative number"),
      ],
    ], "Order must contain either 'items' or 'products' array with at least one item"),
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
      .isIn(["Pending", "Processing", "Shipped", "Delivered", "Cancelled"])
      .withMessage("Invalid order status"),
    check("totalAmount")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Total amount must be a non-negative number"),
  ];
};

const orderUpdateValidationRules = () => {
  return [
    oneOf([
      // Optional items array
      [
        check("items").optional().isArray().withMessage("Items must be an array"),
        check("items.*.product")
          .optional()
          .isMongoId()
          .withMessage("Invalid product ID format"),
        check("items.*.quantity")
          .optional()
          .isInt({ min: 1 })
          .withMessage("Quantity must be at least 1"),
        check("items.*.price")
          .optional()
          .isFloat({ min: 0 })
          .withMessage("Price must be a non-negative number"),
      ],
      // Optional products array
      [
        check("products").optional().isArray().withMessage("Products must be an array"),
        check("products.*.product")
          .optional()
          .isMongoId()
          .withMessage("Invalid product ID format"),
        check("products.*.quantity")
          .optional()
          .isInt({ min: 1 })
          .withMessage("Quantity must be at least 1"),
        check("products.*.priceAtOrder")
          .optional()
          .isFloat({ min: 0 })
          .withMessage("Price must be a non-negative number"),
      ],
      // Neither is provided (other fields being updated)
      [
        body().custom((body) => {
          return !body.items && !body.products;
        }),
      ],
    ], "If updating items, use either 'items' or 'products' format"),
    check("status")
      .optional()
      .isIn(["Pending", "Processing", "Shipped", "Delivered", "Cancelled"])
      .withMessage("Invalid order status"),
  ];
};

module.exports = {
  orderIDValidationRules,
  order_IdValidationRules,
  orderCreateValidationRules,
  orderUpdateValidationRules,
  customerIdValidationRules,
  orderStatusValidationRules,
};
