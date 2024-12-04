import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    paymentIntentId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Success", "Failed"],
      default: "Pending",
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    receiptUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Payment = mongoose.model("Payment", paymentSchema);