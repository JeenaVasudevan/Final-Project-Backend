import { generateToken } from "../utilities/token.js";
import { Order } from "../models/orderModel.js"; 
import { User } from "../models/userModel.js";

export const createOrder = async (req, res, next) => {
    try {
        const { user } = req;
        const { items, totalAmount, deliveryAddress, restaurant } = req.body;
        if (!items || items.length === 0) {
            return res.status(400).json({ message: "Order items are required" });
        }
        if (!deliveryAddress) {
            return res.status(400).json({ message: "Delivery address is required" });
        }
        if (!restaurant) {
            return res.status(400).json({ message: "Restaurant ID is required" });
        }
        const newOrder = new Order({
            user: user.id,
            items,
            totalAmount,
            deliveryAddress,
            restaurant,
            status: "Pending",
        });
        await newOrder.save();
        const token = generateToken(user.id, 'user');
        res.cookie("token", token, {
            sameSite: "None",
            secure: true,
            httpOnly: true,
        });
        res.status(201).json({ message: "Order created successfully", data: newOrder });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(error.statusCode || 500).json({ error: error.message || "Internal server error" });
    }
};
export const fetchOrderDetails = async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const { user } = req;

        if (!orderId) {
            return res.status(400).json({ message: "Order ID not found in request" });
        }

        const orderDetails = await Order.findById(orderId).populate('user'); 

        if (!orderDetails) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (orderDetails.user.toString() !== user.id && user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied: You do not have permission to view this order" });
        }

        res.json({ message: "Order details fetched", data: orderDetails });
    } catch (error) {
        console.error("Error fetching order details:", error);
        next(error);
    }
};
export const updateOrderStatus = async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const { user } = req;
        const { status } = req.body; 
        if (!orderId) {
            return res.status(400).json({ message: "Order ID not found in request" });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (user.role !== 'admin' && order.user.toString() !== user.id) {
            return res.status(403).json({ message: "Access denied: You do not have permission to update this order" });
        }

        order.status = status || order.status;
        await order.save();

        const token = generateToken(user.id,'user');
        res.cookie("token", token, {
            sameSite: "None",
            secure: true,
            httpOnly: true,
        });

        res.json({ message: "Order status updated successfully", data: order });
    } catch (error) {
        console.error("Error updating order status:", error);
        next(error);
    }
};
export const deleteOrder = async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const { user } = req;

        if (!orderId) {
            return res.status(400).json({ message: "Order ID not found in request" });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (user.role !== 'admin' && order.user.toString() !== user.id) {
            return res.status(403).json({ message: "Access denied: You do not have permission to delete this order" });
        }

        await Order.findByIdAndDelete(orderId);

        const token = generateToken(user.id,'user');
        res.cookie("token", token, {
            sameSite: "None",
            secure: true,
            httpOnly: true,
        });

        res.json({ message: "Order deleted successfully" });
    } catch (error) {
        console.error("Error deleting order:", error);
        next(error);
    }
};
