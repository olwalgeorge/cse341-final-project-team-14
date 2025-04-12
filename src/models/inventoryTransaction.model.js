const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionTypes = [
  "Adjustment", 
  "Purchase", 
  "Sale", 
  "Return", 
  "Transfer In", 
  "Transfer Out", 
  "Damaged",
  "Expired",
  "Initial"
];

const referenceDocumentTypes = [
  "Purchase", 
  "Order", 
  "Adjustment", 
  "Transfer", 
  "Return"
];

const inventoryTransactionSchema = new Schema({
  transactionID: {
    type: String,
    required: true,
    unique: true,
    match: [/^IT-\d{5}$/, "Transaction ID must be in the format IT-XXXXX where X is a digit"]
  },
  inventory: {
    type: Schema.Types.ObjectId,
    ref: "Inventory",
    required: false
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  warehouse: {
    type: Schema.Types.ObjectId,
    ref: "Warehouse",
    required: true
  },
  transactionType: {
    type: String,
    required: true,
    enum: {
      values: transactionTypes,
      message: `Transaction type must be one of: ${transactionTypes.join(', ')}`
    }
  },
  transactionDate: {
    type: Date,
    default: Date.now,
    validate: {
      validator: function(value) {
        // Transaction date cannot be in the future
        return value <= new Date();
      },
      message: "Transaction date cannot be in the future"
    }
  },
  quantityBefore: {
    type: Number,
    required: true,
    min: [0, "Previous quantity cannot be negative"]
  },
  quantityChange: {
    type: Number,
    required: true,
    validate: {
      validator: function(value) {
        // Quantity change cannot be zero
        if (value === 0) return false;
        
        // Sale, Transfer Out, Damaged, and Expired should have negative quantity change
        if (["Sale", "Transfer Out", "Damaged", "Expired"].includes(this.transactionType) && value > 0) {
          return false;
        }
        
        // Purchase, Transfer In, Initial should have positive quantity change
        if (["Purchase", "Transfer In", "Initial"].includes(this.transactionType) && value < 0) {
          return false;
        }
        
        return true;
      },
      message: function(props) {
        if (props.value === 0) return "Quantity change cannot be zero";
        
        if (["Sale", "Transfer Out", "Damaged", "Expired"].includes(this.transactionType) && props.value > 0) {
          return `${this.transactionType} transactions must have a negative quantity change`;
        }
        
        if (["Purchase", "Transfer In", "Initial"].includes(this.transactionType) && props.value < 0) {
          return `${this.transactionType} transactions must have a positive quantity change`;
        }
        
        return "Invalid quantity change";
      }
    }
  },
  quantityAfter: {
    type: Number,
    min: [0, "New quantity cannot be negative"]
  },
  reference: {
    documentType: {
      type: String,
      enum: {
        values: referenceDocumentTypes,
        message: `Document type must be one of: ${referenceDocumentTypes.join(', ')}`
      }
    },
    documentId: {
      type: Schema.Types.ObjectId
    },
    documentCode: {
      type: String,
      trim: true,
      minlength: [3, "Document code must be at least 3 characters"],
      maxlength: [20, "Document code cannot exceed 20 characters"]
    }
  },
  fromWarehouse: {
    type: Schema.Types.ObjectId,
    ref: "Warehouse",
    validate: {
      validator: function(value) {
        // Required for Transfer Out transactions
        if (this.transactionType === "Transfer Out" && !value) {
          return false;
        }
        
        return true;
      },
      message: "From warehouse is required for Transfer Out transactions"
    }
  },
  toWarehouse: {
    type: Schema.Types.ObjectId,
    ref: "Warehouse",
    validate: {
      validator: function(value) {
        // Required for Transfer In transactions
        if (this.transactionType === "Transfer In" && !value) {
          return false;
        }
        
        // From and To warehouses cannot be the same
        if (value && this.fromWarehouse && value.equals(this.fromWarehouse)) {
          return false;
        }
        
        return true;
      },
      message: function(props) {
        if (this.transactionType === "Transfer In" && !props.value) {
          return "To warehouse is required for Transfer In transactions";
        }
        
        if (props.value && this.fromWarehouse && props.value.equals(this.fromWarehouse)) {
          return "From and To warehouses cannot be the same";
        }
        
        return "Invalid To warehouse";
      }
    }
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, "Notes cannot exceed 500 characters"]
  },
  performedBy: {
    type: Schema.Types.ObjectId,
    ref: "User"
  }
}, {
  timestamps: true
});

// Pre-save middleware to calculate quantityAfter if not provided
inventoryTransactionSchema.pre('save', function(next) {
  if (this.quantityBefore !== undefined && 
      this.quantityChange !== undefined && 
      this.quantityAfter === undefined) {
    this.quantityAfter = this.quantityBefore + this.quantityChange;
  }
  next();
});

// Custom validation for document type based on transaction type
inventoryTransactionSchema.path('reference').validate(function(value) {
  if (!value || !value.documentType) return true;
  
  if (this.transactionType === "Purchase" && value.documentType !== "Purchase") {
    this.invalidate('reference.documentType', "Purchase transactions must reference a Purchase document");
    return false;
  }
  
  if (this.transactionType === "Sale" && value.documentType !== "Order") {
    this.invalidate('reference.documentType', "Sale transactions must reference an Order document");
    return false;
  }
  
  return true;
});

module.exports = mongoose.model("InventoryTransaction", inventoryTransactionSchema);
