import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";


export const authUser = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization; // Retrieve token
    if (!token) {
      return res.status(401).json({ success: false, message: "Token not provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // Verify token
    const user = await User.findById(decoded.id); // Fetch user from the database

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    req.user = user; // Attach user to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    res.status(401).json({ success: false, message: "Unauthorized", error: error.message });
  }
};
