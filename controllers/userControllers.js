import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utilities/token.js";

export const signup = async (req, res, next) => {
    try {
        const { name, email, password, mobile } = req.body;
        if (!name || !email || !password || !mobile) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const userAlreadyExist = await User.findOne({ email });
        if (userAlreadyExist) {
            return res.status(400).json({ error: "User Already Exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ name, email, password: hashedPassword, mobile });
        const savedUser = await newUser.save();

        if (savedUser) {
            const token = generateToken(savedUser._id);
            res.cookie("token", token, {
                sameSite: "None",
                secure: true,
                httpOnly: true
            });
            return res.status(200).json({
                success: true, 
                message: "User registration successful", 
                redirectUrl: "/user/profile"  // Redirect URL for user
            });
        }
        return res.status(500).json({ error: "User could not be saved" });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const userExist = await User.findOne({ email });
        if (!userExist) {
            return res.status(400).json({ error: "User does not exist" });
        }

        const passwordMatch = await bcrypt.compare(password, userExist.password);
        if (!passwordMatch) {
            return res.status(400).json({ error: "Incorrect password" });
        }

        const token = generateToken(userExist._id);
        res.cookie("token", token, {
            sameSite: "None",
            secure: true,
            httpOnly: true
        });
        res.status(200).json({ 
            success: true, 
            message: "Login successful", 
            user:{
            id:userExist._id,
            email:userExist.email,
            role:userExist.role,
            },token,
            redirectUrl: userExist.role === "admin" ? "/admin/profile" : "/user/profile" 
        });
    } catch (error) {
        next(error);
    }
};

export const userProfile = async (req, res, next) => {
    try {
        const { user } = req;
        const userData = await User.findById(user.id).select("-password");

        if (!userData) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ success: true, message: "User profile fetched", data: userData });
    } catch (error) {
        next(error);
    }
};

export const userLogout = async (req, res, next) => {
    try {
        res.clearCookie("token",{
            sameSite: "None",
            secure: true,
            httpOnly: true
        });
        res.status(200).json({ success: true, message: "User logged out" });
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        const { user } = req;
        const { name, email, mobile, password } = req.body;
        const updatedFields = {};

        if (name) updatedFields.name = name;
        if (email) updatedFields.email = email;
        if (mobile) updatedFields.mobile = mobile;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            updatedFields.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(user.id, updatedFields, {
            new: true,
            runValidators: true,
            select: "-password"
        });

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ success: true, message: "Profile updated successfully", data: updatedUser });
    } catch (error) {
        next(error);
    }
};

export const deleteProfile = async (req, res, next) => {
    try {
        const { user } = req;
        const deletedUser = await User.findByIdAndDelete(user.id);

        if (!deletedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.clearCookie("token", {
            sameSite: "None",
            secure: true,
            httpOnly: true
        });
        res.status(200).json({ success: true, message: "Profile deleted successfully" });
    } catch (error) {
        next(error);
    }
};

export const checkUser = async (req, res, next) => {
    try {
        res.json({
            success: true,
            message:"Authorized user"
        });
    } catch (error) {
        console.log(error);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};