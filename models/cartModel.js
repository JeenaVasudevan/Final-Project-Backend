import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "Menu", required: true },
        quantity: { type: Number, default: 1, min: 1 },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true }
);
cartSchema.methods.calculateTotalPrice = async function () {
  const populatedCart = await this.populate('items.menuItem');
  this.totalPrice = populatedCart.items.reduce((total, item) => {
      return total + item.menuItem.price * item.quantity;
  }, 0);
  await this.save();
};


export const Cart = mongoose.model("Cart", cartSchema);