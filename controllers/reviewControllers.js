import { generateToken } from "../utilities/token.js"; 
import { Review } from "../models/reviewModel.js";
import { Restaurant } from "../models/restaurantModel.js";

export const createReview = async (req, res, next) => {
    try {
        const { user } = req;
        const { restaurantId, rating, comment } = req.body;

        if (!restaurantId || !rating) {
            return res.status(400).json({ message: "Restaurant ID and rating are required" });
        }
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }
        const review = new Review({
            user: user.id,
            restaurant: restaurantId,
            rating,
            comment,
        });

        await review.save();
        const token = generateToken(user.id,'user');
        res.cookie("token", token, {
            sameSite: "None",
            secure: true,
            httpOnly: true,
        });

        res.status(201).json({ message: "Review created successfully", data: review });
    } catch (error) {
        console.error("Error creating review:", error);
        next(error);
    }
};
export const fetchReviewsForRestaurant = async (req, res, next) => {
    try {
        const restaurantId = req.params.id;

        const reviews = await Review.find({ restaurant: restaurantId }).populate("user", "name"); // Populate user details

        if (!reviews.length) {
            return res.status(404).json({ message: "No reviews found for this restaurant" });
        }

        res.json({ message: "Reviews fetched successfully", data: reviews });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        next(error);
    }
};
export const updateReview = async (req, res, next) => {
    try {
        const reviewId = req.params.id;
        const { rating, comment } = req.body;
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }
        if (review.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to update this review" });
        }
        review.rating = rating || review.rating;
        review.comment = comment || review.comment;
        await review.save();
        const token = generateToken(req.user.id,'user');
        res.cookie("token", token, {
            sameSite: "None",
            secure: true,
            httpOnly: true,
        });
        res.json({ message: "Review updated successfully", data: review });
    } catch (error) {
        console.error("Error updating review:", error);
        next(error);
    }
};
export const deleteReview = async (req, res, next) => {
    try {
        const reviewId = req.params.id;
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }
        if (review.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to delete this review" });
        }
        await Review.deleteOne({ _id: reviewId });
        res.json({ message: "Review deleted successfully" });
    } catch (error) {
        console.error("Error deleting review:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

