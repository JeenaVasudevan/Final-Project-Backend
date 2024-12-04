import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    items: [
      {
        menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "Menu", required: true },
        quantity: { type: Number, default: 1, min: 1 },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Cancelled'],
      default: "pending",
    },
    deliveryAddress: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);