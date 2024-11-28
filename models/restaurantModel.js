import mongoose from "mongoose";


const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    cuisine: {
      type: String,
      required: true,
      default:"various"
    },
    image: {
      type: String,
      default: "https://png.pngtree.com/thumb_back/fh260/background/20230618/pngtree-illustration-of-a-cartoon-style-phone-with-food-and-order-button-image_3639505.jpg",
    },
    menuItems: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Menu" 
    }],
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  { timestamps: true }
);

export const Restaurant = mongoose.model("Restaurant", restaurantSchema);
