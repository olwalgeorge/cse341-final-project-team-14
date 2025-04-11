const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const inventoryTransactionSchema = new Schema(
  {
    transactionID: {
      type: String,
      required: [true, "Transaction ID is required"],
      unique: true,
      trim: true,
      match: [/^IT-\d{5}$/, "Transaction ID must be in format IT-XXXXX"],
    },
    inventory: {
      type: Schema.Types.ObjectId,
      ref: "Inventory",
      required: [true, "Inventory reference is required"],
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
    transactionType: {
      type: String,
      required: [true, "Transaction type is required"],
      enum: ["Purchase", "Sale", "Adjustment", "Transfer In", "Transfer Out", "Return", "Initial Stock"],
      default: "Adjustment",
    },
    quantityBefore: {
      type: Number,
      required: [true, "Previous quantity is required"],
      default: 0,
    },
    quantityChange: {
      type: Number,
      required: [true, "Quantity change is required"],
      validate: {
        validator: function(v) {
          return v !== 0;
        },
        message: "Quantity change cannot be zero",
      },
    },
    quantityAfter: {
      type: Number,
      required: [true, "New quantity is required"],
      min: [0, "Final quantity cannot be negative"],
    },
    reference: {
      documentType: {
        type: String,
        enum: ["Purchase", "Order", "Adjustment", "Transfer", "Return", null],
      },
      documentId: {
        type: Schema.Types.ObjectId,
        refPath: "reference.documentType",
      },
      documentCode: {
        type: String,
        trim: true,
      },
    },
    fromWarehouse: {
      type: Schema.Types.ObjectId,
      ref: "Warehouse",
    },
    toWarehouse: {
      type: Schema.Types.ObjectId,
      ref: "Warehouse",
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    transactionDate: {
      type: Date,
      required: [true, "Transaction date is required"],
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

// Pre-save hook to validate quantityAfter calculation
inventoryTransactionSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  
  // Ensure quantityAfter equals quantityBefore + quantityChange
  if (this.quantityBefore + this.quantityChange !== this.quantityAfter) {
    this.quantityAfter = this.quantityBefore + this.quantityChange;
  }
  
  // Ensure final quantity is not negative
  if (this.quantityAfter < 0) {
    return next(new Error('Resulting inventory quantity cannot be negative'));
  }
  
  next();
});

// Add indexes for efficient querying
inventoryTransactionSchema.index({ transactionID: 1 }, { unique: true });
inventoryTransactionSchema.index({ product: 1 });
inventoryTransactionSchema.index({ warehouse: 1 });
inventoryTransactionSchema.index({ inventory: 1 });
inventoryTransactionSchema.index({ transactionDate: 1 });
inventoryTransactionSchema.index({ transactionType: 1 });
inventoryTransactionSchema.index({ 'reference.documentId': 1 });
inventoryTransactionSchema.index({ performedBy: 1 });

const InventoryTransaction = mongoose.model("InventoryTransaction", inventoryTransactionSchema);

module.exports = InventoryTransaction;
