import express from "express";
import {
    addToCart,
    fetchCart,
    updateCartItem,
    deleteCartItem
} from "../controllers/cartControllers.js";
import { authUser } from "../middleware/authUser.js";
import { isUser } from "../middleware/isUser.js";


const router = express.Router();

router.post("/add",authUser,isUser,addToCart);

router.get("/fetch",authUser,isUser,fetchCart);

router.put("/update/:id",authUser,isUser,updateCartItem);

router.delete("/delete/:id",authUser,isUser,deleteCartItem);

export { router as cartRouter };
