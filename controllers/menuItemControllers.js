import { Menu } from "../models/menuModel.js";
import { Restaurant } from "../models/restaurantModel.js";
import { generateToken } from "../utilities/token.js";

export const createMenu = async (req, res, next) => {
    try {
        const { user } = req;
        const { name, description, price, image, category, restaurant } = req.body;
        
        if (!name || !price || !category || !restaurant) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const newMenu = new Menu({
            name,
            description,
            price,
            image,
            category,
            restaurant,
        });

        await newMenu.save();
        await Restaurant.findByIdAndUpdate(restaurant, { $push: { menuItems: newMenu._id } });

        const token = generateToken(user.id, 'admin');
        res.cookie("token", token, {
            sameSite: "None",
            secure: true,
            httpOnly: true,
        });

        res.status(201).json({ success: true, message: "Menu item created successfully", data: newMenu });
    } catch (error) {
        console.error("Error creating menu item:", error);
        next(error);
    }
};

// Fetch all menu items
export const findAllMenus = async (req, res, next) => {
    try {
        const menuList = await Menu.find().populate('restaurant');
        res.json({ success: true, message: "Menu list fetched", data: menuList });
    } catch (error) {
        console.error("Error fetching menu list:", error);
        res.json({ success: false, message: error.message || 'Failed to fetch menu list.' });
        next(error);
    }
};
export const fetchMenuDetails = async (req, res, next) => {
    try {
        const menuId = req.params.menuId;

        if (!menuId) {
            return res.status(400).json({ success: false, message: "Menu ID not found in request" });
        }

        const menuDetails = await Menu.findById(menuId).populate('restaurant');
        
        if (!menuDetails) {
            return res.status(404).json({ success: false, message: "Menu not found" });
        }

        res.json({ success: true, message: "Menu details fetched", data: menuDetails });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

// Update a menu item
export const updateMenu = async (req, res, next) => {
    try {
        const menuId = req.params.menuId;
        const { user } = req;
        const { name, description, price, image, category } = req.body;

        if (!menuId) {
            return res.status(400).json({ success: false, message: "Menu ID not found in request" });
        }

        const menu = await Menu.findById(menuId);

        if (!menu) {
            return res.status(404).json({ success: false, message: "Menu not found" });
        }

        menu.name = name || menu.name;
        menu.description = description || menu.description;
        menu.price = price || menu.price;
        menu.image = image || menu.image;
        menu.category = category || menu.category;

        await menu.save();

        const token = generateToken(user.id, 'admin');
        res.cookie("token", token, {
            sameSite: "None",
            secure: true,
            httpOnly: true,
        });

        res.json({ success: true, message: "Menu updated successfully", data: menu });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

// Delete a menu item
export const deleteMenu = async (req, res, next) => {
    try {
        const menuId = req.params.menuId;
        const { user } = req;

        if (!menuId) {
            return res.status(400).json({ success: false, message: "Menu ID not found in request" });
        }

        const menu = await Menu.findByIdAndDelete(menuId);

        if (!menu) {
            return res.status(404).json({ success: false, message: "Menu not found" });
        }

        const token = generateToken(user.id, user.role);
        res.cookie("token", token, {
            sameSite: "None",
            secure: true,
            httpOnly: true,
        });

        res.json({ success: true, message: "Menu deleted successfully" });
    } catch (error) {
        console.error(error);
        next(error);
    }
};