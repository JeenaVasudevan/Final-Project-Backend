import express from "express";
import {
    addToCart,
    fetchCart,
    updateCartItem,
    deleteCartItem,
    clearCart
} from "../controllers/cartControllers.js";
import { authUser } from "../middleware/authUser.js";



const router = express.Router();

router.post("/add",authUser,addToCart);

router.get("/fetch",authUser,fetchCart);

router.put("/update/:id",authUser,updateCartItem);

router.delete("/delete/:id",authUser,deleteCartItem);

router.put('/clear', authUser, clearCart);

export { router as cartRouter };
