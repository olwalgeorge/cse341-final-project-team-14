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
      index: true,
      validate: {
        validator: async function (v) {
          const customer = await this.constructor.findOne({ email: v });
          return !customer;
        },
        message: "Email address already exists",
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

// Add indexes for commonly filtered fields
customerSchema.index({ name: 1 });
customerSchema.index({ email: 1 });
customerSchema.index({ customerID: 1 });
customerSchema.index({ "address.city": 1 });
customerSchema.index({ "address.state": 1 });
customerSchema.index({ "address.country": 1 });

// Add a text index for searching
customerSchema.index(
  { 
    name: "text", 
    email: "text", 
    "address.city": "text", 
    "address.state": "text",
    "address.country": "text"
  }
);

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
