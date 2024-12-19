import express from "express";
import {
    createOrder,
    fetchOrderDetails,
    updateOrderStatus,
    deleteOrder,
    fetchUserOrders
} from "../controllers/orderControllers.js";
import { authUser } from "../middleware/authUser.js";


const router = express.Router();

router.get("/", authUser,fetchUserOrders)

router.post("/create",authUser,createOrder);

router.get("/orderDetails/:id",authUser,fetchOrderDetails);

router.put("/update/:id",authUser,updateOrderStatus);

router.delete("/delete/:id",authUser,deleteOrder);

export { router as orderRouter };
