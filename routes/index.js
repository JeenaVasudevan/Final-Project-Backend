import express from "express";
import { userRouter } from "./userRoutes.js";
import { adminRouter } from "./adminRoutes.js";
import { restaurantRouter } from "./restaurantRoutes.js";
import { menuRouter } from "./menuRoutes.js";
import { orderRouter } from "./orderRoutes.js";
import { cartRouter } from "./cartRoutes.js";
import { reviewRouter } from "./reviewRoutes.js";

const router=express.Router()

router.use("/user",userRouter)

router.use("/admin",adminRouter)

router.use("/restaurant",restaurantRouter)

router.use("/menuItems",menuRouter)

router.use("/order",orderRouter)

router.use("/cart",cartRouter)

router.use("/review",reviewRouter)

export {router as apiRouter}