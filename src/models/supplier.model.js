const mongoose = require("mongoose");
const { Schema } = mongoose;

const supplierSchema = new Schema(
  {
    supplierID: {
      type: String,
      unique: true,
      match: [/^SP-\d{5}$/],
      required: true,
    },
    name: {
      type: String,
      required: [true, "Supplier name is required"],
      trim: true,
      maxlength: [100, "Supplier name cannot exceed 100 characters"],
    },
    contact: {
      phone: {
        type: String,
        validate: {
          validator: function (v) {
            return /^[0-9]{10,15}$/.test(v);
          },
          message: "Please enter a valid phone number",
        },
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
    
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
    status: {
      type: String,
      enum: ["Active", "Inactive", "Pending", "Blocked"],
      default: "Active",
    },
  },
  {
    timestamps: true,
    // Make sure all validators run on updates
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    id: false,
  }
);

// Define indexes for the fields we'll often query by
supplierSchema.index({ name: 1 });
// Add unique: true to the explicit index rather than the field definition
supplierSchema.index({ "contact.email": 1 }, { unique: true });
supplierSchema.index({ "address.city": 1 });
supplierSchema.index({ "address.state": 1 });
supplierSchema.index({ "address.country": 1 });
supplierSchema.index({ status: 1 });

// Add a text index for searching
supplierSchema.index(
  { 
    name: "text", 
    "contact.email": "text", 
    "address.city": "text", 
    "address.state": "text",
    "address.country": "text"
  }
);

module.exports = mongoose.model("Supplier", supplierSchema);
