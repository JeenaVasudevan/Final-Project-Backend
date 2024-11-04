import express from "express";
import {
    createOrder,
    fetchOrderDetails,
    updateOrderStatus,
    deleteOrder
} from "../controllers/orderControllers.js";
import { authUser } from "../middleware/authUser.js";
import { isUser } from "../middleware/isUser.js";
import { authAdmin } from "../middleware/authAdmin.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

router.post("/create",authUser,isUser,createOrder);

router.get("/orderDetails/:id",authAdmin,isAdmin,fetchOrderDetails);

router.put("/update/:id",authUser,isUser,updateOrderStatus);

router.delete("/delete/:id",authUser,isUser,deleteOrder);

export { router as orderRouter };
