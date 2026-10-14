import express from "express";
import {
  checkoutOrder,
  verifyPayment,
  getUserOrders,
  getOrderById,
} from "../controllers/order.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/checkout", protectRoute, checkoutOrder);
router.post("/create-payment-order", protectRoute, checkoutOrder);
router.post("/verify-payment", protectRoute, verifyPayment);
router.get("/", protectRoute, getUserOrders);
router.get("/:id", protectRoute, getOrderById);

export default router;
