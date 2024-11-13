import { generateToken } from "../utilities/token.js";
import { Restaurant } from "../models/restaurantModel.js";
import { Admin } from "../models/adminModel.js";

export const createRestaurant = async (req, res, next) => {
    try {
        const { user } = req;
        const { name, address, contactNumber, cuisine, image } = req.body;
        if (!name || !address || !contactNumber || !cuisine ||!image) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        const newRestaurant = new Restaurant({
            name,
            address,
            contactNumber,
            cuisine,
            image,
            admin: user.id, 
        });

        await newRestaurant.save();
        await Admin.findByIdAndUpdate(user.id, { $push: { restaurants: newRestaurant._id } });
        const token = generateToken(user.id, 'admin'); 
        res.cookie("token", token, {
            sameSite: "None",
            secure: true,
            httpOnly: true,
        });
        res.status(201).json({ success: true, message: "Restaurant created successfully", data: newRestaurant });
    } catch (error) {
        console.error("Error creating restaurant:", error);
        res.status(error.statusCode || 500).json({ success: false, error: error.message || "Internal server error" });
    }
};

export const findAllRestaurants = async (req, res, next) => {
    try {
        const restaurantList = await Restaurant.find()
            .populate('menuItems')
            .populate('admin');

        res.json({ success: true, message: "Restaurant list fetched", data: restaurantList });
    } catch (error) {
        res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
    }
};

export const fetchRestaurantDetails = async (req, res, next) => {
    try {
        const restaurantId = req.params.id;
        if (!restaurantId) {
            return res.status(400).json({ success: false, message: "Restaurant ID not found in request" });
        }
        const restaurantDetails = await Restaurant.findById(restaurantId)
            .populate('menuItems')
            .populate('admin');
        if (!restaurantDetails) {
            return res.status(404).json({ success: false, message: "Restaurant not found" });
        }
        res.json({ success: true, message: "Restaurant details fetched", data: restaurantDetails });
    } catch (error) {
        console.log(error);
        res.status(error.statusCode || 500).json({ success: false, message: error.message || "Internal server error" });
    }
};

export const updateRestaurant = async (req, res, next) => {
    try {
        const restaurantId = req.params.id;
        const { name, address, contactNumber, cuisine, image } = req.body;
        const { user } = req;
        if (!restaurantId) {
            return res.status(400).json({ success: false, message: "Restaurant ID not found in request" });
        }
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: "Restaurant not found" });
        }
        restaurant.name = name || restaurant.name;
        restaurant.address = address || restaurant.address;
        restaurant.contactNumber = contactNumber || restaurant.contactNumber;
        restaurant.cuisine = cuisine || restaurant.cuisine;
        restaurant.image= image || restaurant.image
        await restaurant.save();
        const token = generateToken(user.id, user.role); 
        res.cookie("token", token, {
            sameSite: "None",
            secure: true,
            httpOnly: true,
        });

        res.json({ success: true, message: "Restaurant updated successfully", data: restaurant });
    } catch (error) {
        console.log(error);
        res.status(error.statusCode || 500).json({ success: false, message: error.message || "Internal server error" });
    }
};

export const deleteRestaurant = async (req, res, next) => {
    try {
        const restaurantId = req.params.id;
        const user = req.user;
        if (!restaurantId) {
            return res.status(400).json({ success: false, message: "Restaurant ID not found in request" });
        }
        const restaurant = await Restaurant.findByIdAndDelete(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: "Restaurant not found" });
        }
        const token = generateToken(user.id, user.role);
        res.cookie("token", token, {
            sameSite: "None",
            secure: true,
            httpOnly: true,
        });
        res.json({ success: true, message: "Restaurant deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(error.statusCode || 500).json({ success: false, message: error.message || "Internal server error" });
    }
};
