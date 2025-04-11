const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const warehouseSchema = new Schema(
  {
    warehouseID: {
      type: String,
      required: [true, "Warehouse ID is required"],
      unique: true,
      trim: true,
      match: [/^WH-\d{5}$/, "Warehouse ID must be in format WH-XXXXX"],
    },
    name: {
      type: String,
      required: [true, "Warehouse name is required"],
      trim: true,
      maxlength: [100, "Warehouse name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Warehouse description cannot exceed 500 characters"],
    },
    capacity: {
      type: Number,
      required: [true, "Warehouse capacity is required"],
      min: [0, "Capacity cannot be negative"],
    },
    capacityUnit: {
      type: String,
      required: [true, "Capacity unit is required"],
      enum: ["sqft", "sqm", "pallets", "items"],
      default: "sqft",
    },
    status: {
      type: String,
      required: [true, "Warehouse status is required"],
      enum: ["Active", "Inactive", "Maintenance", "Under Construction"],
      default: "Active",
    },
    contact: {
      name: {
        type: String,
        required: [true, "Contact name is required"],
        trim: true,
        maxlength: [100, "Contact name cannot exceed 100 characters"],
      },
      phone: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true,
        match: [/^\d{10,15}$/, "Please enter a valid phone number"],
      },
      email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        lowercase: true,
        match: [
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
          "Please enter a valid email",
        ],
      },
    },
    address: {
      street: {
        type: String,
        required: [true, "Street address is required"],
        trim: true,
        maxlength: [200, "Street address cannot exceed 200 characters"],
      },
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
        maxlength: [50, "City name cannot exceed 50 characters"],
      },
      state: {
        type: String,
        required: [true, "State is required"],
        trim: true,
        maxlength: [50, "State name cannot exceed 50 characters"],
      },
      postalCode: {
        type: String,
        required: [true, "Postal code is required"],
        trim: true,
        maxlength: [20, "Postal code cannot exceed 20 characters"],
      },
      country: {
        type: String,
        required: [true, "Country is required"],
        trim: true,
        maxlength: [50, "Country name cannot exceed 50 characters"],
      },
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: "User",
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

// Keep only these index definitions
warehouseSchema.index({ name: 1 });
warehouseSchema.index({ "address.city": 1, "address.state": 1 });
warehouseSchema.index({ status: 1 });

const Warehouse = mongoose.model("Warehouse", warehouseSchema);

module.exports = Warehouse;
