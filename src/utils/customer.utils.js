const Customer = require('../models/customer.model');
const asyncHandler = require('express-async-handler');

const generateCustomerId = asyncHandler(async () => {
    const prefix = 'CU-';
    const paddedLength = 5;

    const lastCustomer = await Customer.findOne(
        { customerID: { $regex: `^${prefix}` } },
        { customerID: 1 },
        { sort: { customerID: -1 } }
    );

    let nextNumber = 1;
    if (lastCustomer) {
        const lastNumber = parseInt(lastCustomer.customerID.slice(prefix.length), 10);
        nextNumber = lastNumber + 1;
    }

    const paddedNumber = nextNumber.toString().padStart(paddedLength, '0');
    return `${prefix}${paddedNumber}`;
});

const transformCustomer = (customer) => {
    if (!customer) return null;
    return {
        _id: customer._id,
        customerID: customer.customerID,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt
    };
};

module.exports = {
    generateCustomerId,
    transformCustomer
};
