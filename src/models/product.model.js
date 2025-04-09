// models/Product.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema({
  productID: {
    type: String,
    unique: true,
    match: [/^PR-\d{5}$/],
    index: true,
    required: true,
  },
  name: {
    type: String,
    required: [true, "Product name is required"],
    trim: true,
    maxlength: [100, "Product name cannot exceed 100 characters"],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, "Description cannot exceed 500 characters"],
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"],
    set: (v) => parseFloat(v.toFixed(2)), // Ensure 2 decimal places
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [0, "Quantity cannot be negative"],
    default: 0,
  },
  category: {
    type: String,
    required: [true, "Category is required"],
    trim: true,
    enum: {
      values: ["Electronics", "Clothing", "Food", "Furniture", "Other"],
      message: "Invalid category",
    },
  },
  supplier: {
    type: Schema.Types.ObjectId,
    ref: "Supplier",
    required: [true, "Supplier reference is required"],
    validate: {
      validator: (v) => mongoose.model("Supplier").findOne({ _id: v }).then((supplier) => !!supplier),
      message: "Supplier does not exist in the database",
    },
  },
  sku: {
    type: String,
    unique: true,
    trim: true,
    uppercase: true,
    validate: {
      validator: (v) => mongoose.model("Product").findOne({ sku: v }).then((product) => !product),
      message: "Product SKU already exists",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
productSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Add text index for search functionality
productSchema.index({ name: "text", description: "text", category: "text" });

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
