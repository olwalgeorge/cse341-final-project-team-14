const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transferStatusValues = [
  "Draft", 
  "Pending", 
  "In Transit", 
  "Partially Received", 
  "Completed", 
  "Cancelled"
];

const inventoryTransferSchema = new Schema({
  transferID: {
    type: String,
    required: true,
    unique: true,
    match: [/^TR-\d{5}$/, "Transfer ID must be in the format TR-XXXXX where X is a digit"]
  },
  fromWarehouse: {
    type: Schema.Types.ObjectId,
    ref: "Warehouse",
    required: true
  },
  toWarehouse: {
    type: Schema.Types.ObjectId,
    ref: "Warehouse",
    required: true,
    validate: {
      validator: function(value) {
        // From and To warehouses cannot be the same
        return !value.equals(this.fromWarehouse);
      },
      message: "From and To warehouses cannot be the same"
    }
  },
  items: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"]
    },
    receivedQuantity: {
      type: Number,
      default: 0,
      min: [0, "Received quantity cannot be negative"]
    },
    notes: {
      type: String,
      trim: true
    }
  }],
  requestDate: {
    type: Date,
    default: Date.now
  },
  expectedDeliveryDate: {
    type: Date
  },
  completionDate: {
    type: Date
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: transferStatusValues,
      message: `Status must be one of: ${transferStatusValues.join(', ')}`
    },
    default: "Draft"
  },
  requestedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  receivedBy: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  transportInfo: {
    method: {
      type: String,
      trim: true
    },
    trackingNumber: {
      type: String,
      trim: true
    },
    carrier: {
      type: String,
      trim: true
    }
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, "Notes cannot exceed 500 characters"]
  }
}, {
  timestamps: true
});

// Virtual for calculating total items
inventoryTransferSchema.virtual('totalItems').get(function() {
  return this.items.length;
});

// Virtual for calculating total quantity
inventoryTransferSchema.virtual('totalQuantity').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Virtual for calculating total received quantity
inventoryTransferSchema.virtual('totalReceivedQuantity').get(function() {
  return this.items.reduce((sum, item) => sum + (item.receivedQuantity || 0), 0);
});

// Virtual for calculating completion percentage
inventoryTransferSchema.virtual('completionPercentage').get(function() {
  const totalQuantity = this.totalQuantity;
  if (totalQuantity === 0) return 0;
  
  const totalReceived = this.totalReceivedQuantity;
  return Math.round((totalReceived / totalQuantity) * 100);
});

// Pre-save middleware to update status based on received quantities
inventoryTransferSchema.pre('save', function(next) {
  if (this.status === "In Transit" || this.status === "Partially Received") {
    const totalQuantity = this.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalReceived = this.items.reduce((sum, item) => sum + (item.receivedQuantity || 0), 0);
    
    if (totalReceived === 0) {
      this.status = "In Transit";
    } else if (totalReceived < totalQuantity) {
      this.status = "Partially Received";
    } else if (totalReceived >= totalQuantity) {
      this.status = "Completed";
      this.completionDate = new Date();
    }
  }
  
  next();
});

module.exports = mongoose.model("InventoryTransfer", inventoryTransferSchema);
