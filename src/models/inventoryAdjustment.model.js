const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adjustmentReasons = [
  "Physical Count",
  "Damaged Goods",
  "Expired Goods",
  "System Correction",
  "Quality Control",
  "Lost Items",
  "Found Items",
  "Initial Setup",
  "Other"
];

const inventoryAdjustmentSchema = new Schema({
  adjustmentID: {
    type: String,
    required: true,
    unique: true,
    match: [/^ADJ-\d{5}$/, "Adjustment ID must be in the format ADJ-XXXXX where X is a digit"]
  },
  warehouse: {
    type: Schema.Types.ObjectId,
    ref: "Warehouse",
    required: true
  },
  reason: {
    type: String,
    required: true,
    enum: {
      values: adjustmentReasons,
      message: `Adjustment reason must be one of: ${adjustmentReasons.join(', ')}`
    }
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, "Description cannot exceed 500 characters"]
  },
  items: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    quantityBefore: {
      type: Number,
      required: true,
      min: [0, "Previous quantity cannot be negative"]
    },
    quantityAfter: {
      type: Number,
      required: true,
      min: [0, "New quantity cannot be negative"]
    },
    reason: {
      type: String,
      trim: true
    }
  }],
  adjustmentDate: {
    type: Date,
    default: Date.now,
    validate: {
      validator: function(value) {
        // Adjustment date cannot be in the future
        return value <= new Date();
      },
      message: "Adjustment date cannot be in the future"
    }
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  performedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ["Draft", "Pending Approval", "Approved", "Completed", "Cancelled"],
    default: "Draft"
  }
}, {
  timestamps: true
});

// Virtual for calculating total items adjusted
inventoryAdjustmentSchema.virtual('totalItems').get(function() {
  return this.items.length;
});

// Pre-save middleware to calculate quantityChange for each item
inventoryAdjustmentSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.items.forEach(item => {
      if (!item.quantityChange) {
        item.quantityChange = item.quantityAfter - item.quantityBefore;
      }
    });
  }
  next();
});

module.exports = mongoose.model("InventoryAdjustment", inventoryAdjustmentSchema);
