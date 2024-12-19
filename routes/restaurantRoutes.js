import express from "express";
import {createRestaurant, deleteRestaurant, fetchRestaurantDetails, findAllRestaurants, updateRestaurant } from "../controllers/restaurantControllers.js";
import { authAdmin } from "../middleware/authAdmin.js";

const router=express.Router()

router.get("/all-restaurants",findAllRestaurants);

router.get("/restaurantDetails/:id",fetchRestaurantDetails);

router.post("/create", authAdmin,createRestaurant);

router.put("/update/:id", authAdmin,updateRestaurant);

router.delete("/delete/:id", authAdmin,deleteRestaurant);

export {router as restaurantRouter}