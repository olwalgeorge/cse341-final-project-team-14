const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const returnReasons = [
  "Damaged Goods",
  "Wrong Item Shipped",
  "Quality Issue",
  "Customer Return",
  "Expired Product",
  "Recall",
  "Overstock",
  "Other"
];

const returnStatusValues = [
  "Draft",
  "Pending",
  "Approved",
  "In Progress",
  "Completed",
  "Rejected",
  "Cancelled"
];

const returnSourceValues = [
  "Customer",
  "Supplier",
  "Internal",
  "Other"
];

const inventoryReturnSchema = new Schema({
  returnID: {
    type: String,
    required: true,
    unique: true,
    match: [/^RET-\d{5}$/, "Return ID must be in the format RET-XXXXX where X is a digit"]
  },
  sourceType: {
    type: String,
    required: true,
    enum: {
      values: returnSourceValues,
      message: `Source type must be one of: ${returnSourceValues.join(', ')}`
    }
  },
  source: {
    // This could be a customer ID, supplier ID, or internal reference
    sourceId: {
      type: Schema.Types.ObjectId,
      required: function() {
        return this.sourceType !== "Other";
      }
    },
    sourceName: {
      type: String,
      trim: true,
      required: true
    }
  },
  relatedDocument: {
    documentType: {
      type: String,
      enum: ["Order", "Purchase", null]
    },
    documentId: {
      type: Schema.Types.ObjectId
    },
    documentCode: {
      type: String,
      trim: true
    }
  },
  warehouse: {
    type: Schema.Types.ObjectId,
    ref: "Warehouse",
    required: true
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
    reason: {
      type: String,
      required: true,
      enum: {
        values: returnReasons,
        message: `Reason must be one of: ${returnReasons.join(', ')}`
      }
    },
    condition: {
      type: String,
      enum: ["New", "Used", "Damaged", "Expired", "Defective"],
      required: true
    },
    action: {
      type: String,
      enum: ["Return to Stock", "Return to Supplier", "Dispose", "Repair", "Pending Inspection"],
      required: true
    },
    notes: {
      type: String,
      trim: true
    }
  }],
  returnDate: {
    type: Date,
    default: Date.now
  },
  processedDate: {
    type: Date
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: returnStatusValues,
      message: `Status must be one of: ${returnStatusValues.join(', ')}`
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
  processedBy: {
    type: Schema.Types.ObjectId,
    ref: "User"
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
inventoryReturnSchema.virtual('totalItems').get(function() {
  return this.items.length;
});

// Virtual for calculating total quantity
inventoryReturnSchema.virtual('totalQuantity').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Pre-save middleware to set processedDate when status changes to Completed
inventoryReturnSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === "Completed" && !this.processedDate) {
    this.processedDate = new Date();
  }
  next();
});

// Middleware to populate references based on sourceType
inventoryReturnSchema.pre(/^find/, function(next) {
  if (this._mongooseOptions.lean !== true) {
    const populateField = this.sourceType === "Customer" ? "Customer" :
      this.sourceType === "Supplier" ? "Supplier" : null;
    
    if (populateField) {
      this.populate({
        path: "source.sourceId",
        model: populateField,
        select: "name email phone"
      });
    }
  }
  next();
});

module.exports = mongoose.model("InventoryReturn", inventoryReturnSchema);
