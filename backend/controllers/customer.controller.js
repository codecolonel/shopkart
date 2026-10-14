import bcrypt from "bcryptjs";
import Customer from "../models/customer.model.js";
import { generateTokenAndSetCookie } from "../utils/generateToken.js";

// POST /customers/register
export const registerCustomer = async (req, res) => {
  try {
    const { fullName, name, email, password, phone } = req.body;
    const finalName = fullName || name;

    if (!finalName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "All fields (fullName, email, password, phone) are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await Customer.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const customer = await Customer.create({
      fullName: finalName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        name: customer.fullName,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error during registration",
    });
  }
};

// POST /customers/login
export const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const customer = await Customer.findOne({ email: normalizedEmail });

    if (!customer) {
      // Do not reveal whether email or password was wrong
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Set HttpOnly cookie
    generateTokenAndSetCookie(customer._id, res);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        name: customer.fullName,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error during login",
    });
  }
};

// GET /customers/me
export const getMe = async (req, res) => {
  try {
    const customer = req.user;
    return res.status(200).json({
      success: true,
      _id: customer._id,
      fullName: customer.fullName,
      name: customer.fullName,
      email: customer.email,
      phone: customer.phone,
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        name: customer.fullName,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user profile",
    });
  }
};

// POST /customers/logout
export const logoutCustomer = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Logout failed",
    });
  }
};

// PATCH /customers/change-password (Bonus challenge)
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Both old and new passwords are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const customer = await Customer.findById(req.user._id);
    const isMatch = await bcrypt.compare(oldPassword, customer.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect current password",
      });
    }

    const salt = await bcrypt.genSalt(10);
    customer.password = await bcrypt.hash(newPassword, salt);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Password change failed",
    });
  }
};
