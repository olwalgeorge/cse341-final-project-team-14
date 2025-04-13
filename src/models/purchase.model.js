const mongoose = require("mongoose");
const { Schema } = mongoose;

const purchaseSchema = new Schema(
  {
    purchaseID: {
      type: String,
      unique: true,
      match: [/^PU-\d{5}$/],
      index: true,
      required: true,
    },
    supplier: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      required: [true, "Supplier is required"],
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "Product ID is required"],
        },
        quantity: {
          type: Number,
          required: [true, "Quantity is required"],
          min: [1, "Quantity must be at least 1"],
        },
        price: {
          type: Number,
          required: false,
          min: [0, "Price cannot be negative"],
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Pending", "Ordered", "Received", "Cancelled", "Returned"],
      default: "Pending",
    },
    receivingWarehouse: {
      type: Schema.Types.ObjectId,
      ref: "Warehouse",
      required: [true, "Receiving warehouse is required"],
      description: "The warehouse where purchased items will be received"
    },
    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Partially_paid", "Paid"],
      default: "Unpaid",
    },
    paymentDue: {
      type: Date,
    },
    notes: {
      type: String,
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

// Pre-save hook to ensure item prices match product costPrice
purchaseSchema.pre("save", async function(next) {
  // Update the updatedAt field
  this.updatedAt = Date.now();
  
  // If items array is modified, ensure prices are set correctly
  if (this.isModified('items')) {
    const Product = mongoose.model('Product');
    
    // Process each item to set price if not explicitly provided
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      
      // If price is not set or is 0, get it from the product's costPrice
      if (!item.price || item.price === 0) {
        try {
          const product = await Product.findById(item.product);
          if (product) {
            this.items[i].price = product.costPrice;
          } else {
            return next(new Error(`Product with ID ${item.product} not found`));
          }
        } catch (error) {
          return next(error);
        }
      }
    }
    
    // Recalculate total amount based on updated prices
    this.totalAmount = this.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }
  
  next();
});

// Add a text index for searching
purchaseSchema.index({ purchaseID: "text", notes: "text" });

const Purchase = mongoose.model("Purchase", purchaseSchema);

module.exports = Purchase;
