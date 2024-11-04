import express from "express";
import {
    createReview,
    fetchReviewsForRestaurant,
    updateReview,
    deleteReview
} from "../controllers/reviewControllers.js";
import { authUser } from "../middleware/authUser.js";
import { isUser } from "../middleware/isUser.js";

const router = express.Router();

router.post("/create",authUser,isUser,createReview);

router.get("/restaurantReviews/:id",fetchReviewsForRestaurant);

router.put("/update/:id", authUser, isUser, updateReview);

router.delete("/delete/:id", authUser, isUser, deleteReview);

export { router as reviewRouter };
