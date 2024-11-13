import bcrypt from 'bcrypt';
import { generateToken } from '../utilities/token.js';
import { Admin } from '../models/adminModel.js';

export const signup = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ success: false, error: "Admin already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = new Admin({ name, email, password: hashedPassword });
        
        const savedAdmin = await newAdmin.save();
        if (savedAdmin) {
            const token = generateToken(savedAdmin._id, 'admin');
            res.cookie("token", token, {
                sameSite: "None",
                secure: true,
                httpOnly: true
            });
            return res.status(201).json({
                success: true, 
                message: "Admin registration successful",
                redirectUrl: "/admin/dashboard"  // Redirect URL for admin
            });
        }

        return res.status(500).json({ success: false, error: "Something went wrong" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};


export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ success: false, error: "Admin not found" });
        }
        const isPasswordCorrect = await bcrypt.compare(password, admin.password);
        if (!isPasswordCorrect) {
            res.clearCookie("token");
            return res.status(400).json({ success: false, error: "Invalid credentials" });
        }
        const token = generateToken(admin._id, 'admin');
        res.cookie("token", token, {
            sameSite: "None",
            secure: true,
            httpOnly: true
        });
        res.status(200).json({ success: true, message: "Admin login successful",redirectUrl: "/admin" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};

export const adminProfile = async (req, res, next) => {
    try {
        const { user } = req;
        const adminData = await Admin.findById(user.id).select("-password");

        if (!adminData) {
            return res.status(404).json({ success: false, error: "Admin not found" });
        }

        res.status(200).json({ success: true, message: "Admin profile fetched", data: adminData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};

export const adminLogout = async (req, res, next) => {
    try {
        res.clearCookie("token", {
            sameSite: "None",
            secure: true,
            httpOnly: true
        });
        res.status(200).json({ success: true, message: "Admin logged out" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};

export const adminUpdate = async (req, res, next) => {
    try {
        const { user } = req;
        const { name, email, password } = req.body;
        const updatedFields = {};

        if (name) updatedFields.name = name;
        if (email) updatedFields.email = email;
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updatedFields.password = hashedPassword;
        }

        const updatedAdmin = await Admin.findByIdAndUpdate(user.id, updatedFields, {
            new: true,
            runValidators: true,
            select: "-password"
        });

        if (!updatedAdmin) {
            return res.status(404).json({ success: false, error: "Admin not found" });
        }

        res.status(200).json({ success: true, message: "Admin profile updated successfully", data: updatedAdmin });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};

export const deleteAdmin = async (req, res, next) => {
    try {
        const { user } = req;
        const deletedAdmin = await Admin.findByIdAndDelete(user.id);

        if (!deletedAdmin) {
            return res.status(404).json({ success: false, error: "Admin not found" });
        }

        res.clearCookie("token", {
            sameSite: "None",
            secure: true,
            httpOnly: true
        });

        res.status(200).json({ success: true, message: "Admin profile deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};

export const checkAdmin = async (req, res, next) => {
    try {
        res.json({
            success: true,
            message:"Authorized admin"
        });
    } catch (error) {
        console.log(error);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};
