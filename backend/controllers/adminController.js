import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

export const login = async (req, res) => {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, message: "Logged in successfully" });
};

export const getCurrentAdmin = (req, res) => {
    res.json({
        success: true,
        admin: req.admin,
    });
};

export const logout = (req, res) => {
    res.clearCookie("token");
    res.json({ success: true, message: "Logged out successfully" });
};
