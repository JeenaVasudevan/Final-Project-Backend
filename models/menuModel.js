import mongoose from "mongoose";

const menuSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      maxLength: 500,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      default: "https://png.pngtree.com/thumb_back/fh260/background/20230618/pngtree-illustration-of-a-cartoon-style-phone-with-food-and-order-button-image_3639505.jpg",
    },
    category: {
      type: String,
      required: true,
    },
    restaurant: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Restaurant",
      required: true 
    },
    availability: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Menu = mongoose.model("Menu", menuSchema);
