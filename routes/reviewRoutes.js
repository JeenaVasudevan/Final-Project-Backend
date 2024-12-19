import express from "express";
import {
    createReview,
    fetchReviewsForRestaurant,
    updateReview,
    deleteReview
} from "../controllers/reviewControllers.js";
import { authUser } from "../middleware/authUser.js";


const router = express.Router();

router.post("/create",authUser,createReview);

router.get("/restaurantReviews/:id",fetchReviewsForRestaurant);

router.put("/update/:id", authUser,updateReview);

router.delete("/delete/:id", authUser,deleteReview);

export { router as reviewRouter };
