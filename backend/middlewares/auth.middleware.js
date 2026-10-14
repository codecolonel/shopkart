import jwt from "jsonwebtoken";
import Customer from "../models/customer.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    // Also support Authorization header
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No authentication token provided",
      });
    }

    const secret = process.env.JWT_SECRET || "shopkart_jwt_secret_key_2026";
    const decoded = jwt.verify(token, secret);

    const customer = await Customer.findById(decoded.id).select("-password");
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Customer not found",
      });
    }

    req.user = customer;
    req.customer = customer;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token",
    });
  }
};

export default protectRoute;
