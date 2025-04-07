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
          required: [true, "Unit price is required"],
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
      enum: ["pending", "ordered", "received", "cancelled", "returned"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partially_paid", "paid"],
      default: "unpaid",
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

// Add a text index for searching
purchaseSchema.index({ purchaseID: "text", notes: "text" });

const Purchase = mongoose.model("Purchase", purchaseSchema);

module.exports = Purchase;
