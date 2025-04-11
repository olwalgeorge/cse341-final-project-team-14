const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const inventorySchema = new Schema(
  {
    inventoryID: {
      type: String,
      required: [true, "Inventory ID is required"],
      unique: true,
      trim: true,
      match: [/^IN-\d{5}$/, "Inventory ID must be in format IN-XXXXX"],
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product reference is required"],
    },
    warehouse: {
      type: Schema.Types.ObjectId,
      ref: "Warehouse",
      required: [true, "Warehouse reference is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
      default: 0,
    },
    minStockLevel: {
      type: Number,
      required: [true, "Minimum stock level is required"],
      min: [0, "Minimum stock level cannot be negative"],
      default: 10,
    },
    maxStockLevel: {
      type: Number,
      required: [true, "Maximum stock level is required"],
      min: [0, "Maximum stock level cannot be negative"],
      default: 100,
    },
    stockStatus: {
      type: String,
      enum: ["In Stock", "Low Stock", "Out of Stock", "Overstocked"],
      default: "In Stock",
    },
    location: {
      aisle: {
        type: String,
        trim: true,
        maxlength: [10, "Aisle identifier cannot exceed 10 characters"],
      },
      rack: {
        type: String,
        trim: true,
        maxlength: [10, "Rack identifier cannot exceed 10 characters"],
      },
      bin: {
        type: String,
        trim: true,
        maxlength: [10, "Bin identifier cannot exceed 10 characters"],
      },
    },
    lastStockCheck: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
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

// Pre-save hook to automatically calculate stock status
inventorySchema.pre("save", function (next) {
  if (this.quantity <= 0) {
    this.stockStatus = "Out of Stock";
  } else if (this.quantity < this.minStockLevel) {
    this.stockStatus = "Low Stock";
  } else if (this.quantity > this.maxStockLevel) {
    this.stockStatus = "Overstocked";
  } else {
    this.stockStatus = "In Stock";
  }
  next();
});

// Keep only these index definitions
inventorySchema.index({ product: 1, warehouse: 1 }, { unique: true });
inventorySchema.index({ warehouse: 1 });
inventorySchema.index({ stockStatus: 1 });
inventorySchema.index({ lastStockCheck: 1 });

const Inventory = mongoose.model("Inventory", inventorySchema);

module.exports = Inventory;
