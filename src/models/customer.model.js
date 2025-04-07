const mongoose = require("mongoose");
const { Schema } = mongoose;

const customerSchema = new Schema(
  {
    customerID: {
      type: String,
      unique: true,
      match: [/^CU-\d{5}$/],
      index: true,
      required: true,
    },
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      maxlength: [100, "Customer name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /^[\w.-]+@[\w.-]+\.\w{2,3}$/.test(v);
        },
        message: "Please enter a valid email",
      },
    },
    phone: {
      type: String,
      validate: {
        validator: function (v) {
          return /^[0-9]{10,15}$/.test(v);
        },
        message: "Please enter a valid phone number",
      },
    },
    address: {
      street: {
        type: String,
        trim: true,
        maxlength: [100, "Street address cannot exceed 100 characters"],
      },
      city: {
        type: String,
        trim: true,
        maxlength: [50, "City name cannot exceed 50 characters"],
      },
      state: {
        type: String,
        trim: true,
        maxlength: [50, "State name cannot exceed 50 characters"],
      },
      postalCode: {
        type: String,
        trim: true,
        maxlength: [20, "Postal code cannot exceed 20 characters"],
      },
      country: {
        type: String,
        trim: true,
        maxlength: [50, "Country name cannot exceed 50 characters"],
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
  },
  {
    timestamps: true,
  }
);

// Add a text index for searching
customerSchema.index({ name: "text", email: "text" });

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
