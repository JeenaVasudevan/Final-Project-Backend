import { generateToken } from "../utilities/token.js"; 
import { Cart } from "../models/cartModel.js";

export const addToCart = async (req, res, next) => {
    try {
        const { user } = req;
        const { menuItem, quantity } = req.body;
        if (!menuItem) {
            return res.status(400).json({ success: false, message: "Menu item ID is required" });
        }
        if (!quantity || quantity <= 0) {
            return res.status(400).json({ success: false, message: "Quantity must be a positive integer" });
        }
        let cart = await Cart.findOne({ user: user.id });
        if (!cart) {
            cart = new Cart({ user: user.id, items: [] });
        }
        const existingItemIndex = cart.items.findIndex(item => item.menuItem.toString() === menuItem);
        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            cart.items.push({ menuItem, quantity });
        }
        await cart.save();
        const token = generateToken(user.id,'user');
        res.cookie("token", token, {
            sameSite: "None",
            secure: true,
            httpOnly: true,
        });
        res.status(201).json({ success: true, message: "Item added to cart successfully", data: cart });
    } catch (error) {
        console.error("Error adding item to cart:", error);
        res.status(error.statusCode || 500).json({ success: false, error: error.message || "Internal server error" });
    }
};

export const fetchCart = async (req, res, next) => {
    try {
        const { user } = req;
        const cart = await Cart.findOne({ user: user.id }).populate('items.menuItem');
        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }
        res.json({ success: true, message: "Cart fetched successfully", data: cart });
    } catch (error) {
        console.error("Error fetching cart:", error);
        next(error);
    }
};

export const updateCartItem = async (req, res, next) => {
    try {
        const { user } = req;
        const cartItemId = req.params.id;
        const { quantity } = req.body;
        if (quantity <= 0) {
            return res.status(400).json({ success: false, message: "Quantity must be greater than zero" });
        }
        const cart = await Cart.findOne({ user: user.id });
        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }
        const itemIndex = cart.items.findIndex(item => item.menuItem.toString() === cartItemId);
        if (itemIndex === -1) {
            return res.status(404).json({ success: false, message: "Cart item not found" });
        }
        cart.items[itemIndex].quantity = quantity;
        await cart.calculateTotalPrice();
        const token = generateToken(user.id, 'user');
        res.cookie("token", token, {
            sameSite: "None",
            secure: true,
            httpOnly: true,
        });
        res.json({ success: true, message: "Cart item updated successfully", data: cart });
    } catch (error) {
        console.error("Error updating cart item:", error);
        next(error);
    }
};

export const deleteCartItem = async (req, res, next) => {
    try {
        const { user } = req;
        const cartItemId = req.params.id;
        const cart = await Cart.findOne({ user: user.id });
        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }
        const itemIndex = cart.items.findIndex(item => item.menuItem.toString() === cartItemId);
        if (itemIndex === -1) {
            return res.status(404).json({ success: false, message: "Cart item not found" });
        }
        cart.items.splice(itemIndex, 1);
        await cart.calculateTotalPrice();
        const token = generateToken(user.id, 'user');
        res.cookie("token", token, {
            sameSite: "None",
            secure: true,
            httpOnly: true,
        });
        res.json({ success: true, message: "Cart item deleted successfully", data: cart });
    } catch (error) {
        console.error("Error deleting cart item:", error);
        next(error);
    }
};
// In cart controller
export const clearCart = async (req, res, next) => {
    try {
      const { user } = req;
  
      // Find the user's cart
      const cart = await Cart.findOne({ user: user.id });
      if (!cart) {
        return res.status(404).json({ success: false, message: "Cart not found" });
      }
  
      // Clear the cart items
      cart.items = [];
      await cart.calculateTotalPrice(); // If you have this method to recalculate totals after clearing the cart
  
      // Save the updated cart
      await cart.save();
  
      // Optional: Generate new token if needed
      const token = generateToken(user.id, 'user');
      res.cookie("token", token, {
        sameSite: "None",
        secure: true,
        httpOnly: true,
      });
  
      res.json({ success: true, message: "Cart cleared successfully", data: cart });
    } catch (error) {
      console.error("Error clearing cart:", error);
      next(error);
    }
  };
  