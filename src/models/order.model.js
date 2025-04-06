// models/Order.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
  orderID: {
    type: String,
    unique: true,
    match: [/^OR-\d{5}$/],
    index: true,
    required: true
  },
  products: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    priceAtOrder: {
      type: Number,
      required: [true, 'Price at order time is required'],
      min: [0, 'Price cannot be negative']
    }
  }],
  orderDate: {
    type: Date,
    required: [true, 'Order date is required'],
    default: Date.now
  },
  status: {
    type: String,
    required: [true, 'Order status is required'],
    enum: {
      values: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      message: 'Invalid order status'
    },
    default: 'Pending'
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  shippingAddress: {
    type: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    },
    required: [true, 'Shipping address is required']
  },
  customer: {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Customer email is required'],
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, 'Customer phone is required']
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate total amount before saving
orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();

  if (this.isModified('products')) {
    this.totalAmount = this.products.reduce((total, item) => {
      return total + (item.priceAtOrder * item.quantity);
    }, 0);
  }

  next();
});

// Update product quantities when order status changes to "Delivered" or "Cancelled"
orderSchema.post('save', async function(doc, next) {
  if (doc.status === 'Delivered' || doc.status === 'Cancelled') {
    const Product = mongoose.model('Product');

    for (const item of doc.products) {
      const product = await Product.findById(item.product);
      if (product) {
        if (doc.status === 'Delivered') {
          product.quantity -= item.quantity;
        } else if (doc.status === 'Cancelled') {
          product.quantity += item.quantity;
        }
        await product.save();
      }
    }
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;