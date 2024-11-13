import express from "express";
import {createRestaurant, deleteRestaurant, fetchRestaurantDetails, findAllRestaurants, updateRestaurant } from "../controllers/restaurantControllers.js";
import { authAdmin } from "../middleware/authAdmin.js";
import { isAdmin } from "../middleware/isAdmin.js";
const router=express.Router()

router.get("/all-restaurants",findAllRestaurants);

router.get("/restaurantDetails/:id",fetchRestaurantDetails);

router.post("/create", authAdmin,isAdmin, createRestaurant);

router.put("/update/:id", authAdmin,isAdmin, updateRestaurant);

router.delete("/delete/:id", authAdmin,isAdmin, deleteRestaurant);

export {router as restaurantRouter}